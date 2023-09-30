import pandas as pd
import torch
from . import clean_dataset
import json
from sentence_transformers import SentenceTransformer, util, CrossEncoder
from io import StringIO
import os
from db import schema
# from newspaper import Article, Config
from trafilatura import fetch_url, extract
# from haystack import Pipeline
import time
from sklearn.preprocessing import Normalizer
import json
from ast import literal_eval

result_num = 50

if torch.cuda.is_available():
    device = 'cuda'
elif torch.backends.mps.is_available():
    device = 'mps'
else:
    device = 'cpu'

def _embed_text(text):
    return bi_encoder.encode(text, convert_to_tensor=True,show_progress_bar=True)

bi_encoder = SentenceTransformer('multi-qa-mpnet-base-dot-v1', device=device)
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2',device=device)
list_topic= ['U.S. NEWS', 'COMEDY', 'PARENTING', 'WORLD NEWS', 'CULTURE & ARTS',
       'TECH', 'SPORTS', 'ENTERTAINMENT', 'POLITICS', 'WEIRD NEWS',
       'ENVIRONMENT', 'EDUCATION', 'CRIME', 'SCIENCE', 'WELLNESS',
       'BUSINESS', 'STYLE & BEAUTY', 'FOOD & DRINK', 'MEDIA',
       'QUEER VOICES', 'HOME & LIVING', 'WOMEN', 'BLACK VOICES', 'TRAVEL',
       'MONEY', 'RELIGION', 'LATINO VOICES', 'IMPACT', 'WEDDINGS',
       'COLLEGE', 'PARENTS', 'ARTS & CULTURE', 'STYLE', 'GREEN', 'TASTE',
       'HEALTHY LIVING', 'THE WORLDPOST', 'GOOD NEWS', 'WORLDPOST',
       'FIFTY', 'ARTS', 'DIVORCE']

label_dict = {}
index=0
label_empty_list=[]
for l in list_topic:
    label_dict[l] = index
    index += 1
    label_empty_list.append(0)


def load_corpus():
    dataset_path = 'cleaned_medium_articles_v14.csv'
    print("load corpus dataset")
    df = pd.read_csv(dataset_path)
    return df

def load_corpus_tensor():
    tensor_path= 'corpus_embeddings_v5.pt'
    print("load corpus embedding")
    corpus_embeddings = torch.load(tensor_path, map_location=torch.device(device))
    return corpus_embeddings

def random_stories(tag:str, client):

    try:
        result = client.predict(
                        None,True,tag,
                        api_name="/predict"
        )

        df_str = StringIO(result)
        df_t:pd.DataFrame = pd.read_csv(df_str, sep='\t')
        num_sample = 10
        result =df_t.sample(n=num_sample, replace=False)

        article_response = schema.ArticleResponse()
        article_response.process_dataset(result)
        return schema.Response(status='Ok', code='200', message='success', result=article_response)
    except ConnectionError:
        return schema.Response(status='Failed', code='500', message='connection failed', result=None)

def search_query(query:str, corpus_embeddings, client, retriever, ranker, df):
    print(query)
    # print(f'query shape: {query_embedding.shape}')

    try:

        article_response = schema.ArticleResponse()
        query_embedding = _embed_text(query)
        query_corpus_result = _get_hits_from_HF(query_embedding, corpus_embeddings, result_num,client, df=df)
        rerank_result = _rank_hits_cross_encoder(query_corpus_result,query)
        rerank_result = rerank_result.reset_index(drop=True)

        # get the result that scroe>0
        positive_indices = rerank_result[rerank_result['score'] > 0].index.tolist()

        article_response.process_dataset(rerank_result, positive_indices[-1])

        # rerank_result = _get_hits_from_haystack(query,retriever, ranker)
        # article_response.process_document(rerank_result)

        return schema.Response(status='Ok', code='200', message='success', result=article_response)
    except ConnectionError:
        return schema.Response(status='Failed', code='500', message='connection failed', result=None)

def search_query_history(query:str, corpus_embeddings, client, user_name, df):

    print(query)
    # print(f'query shape: {query_embedding.shape}')

    try:
        query_embedding = _embed_text(query)
        query_corpus_result = _get_hits_from_HF(query_embedding, corpus_embeddings, result_num,client, df=df)

        rerank_result = _rank_hits_cross_encoder(query_corpus_result,query)
        rerank_result = rerank_result.reset_index(drop=True)

        # get the result that scroe>0
        positive_indices = rerank_result[rerank_result['score'] > 0].index.tolist()
        print("positive indices: ", positive_indices)
        positive_rows = rerank_result[rerank_result.index.isin(positive_indices)]
        negative_rows = rerank_result[~rerank_result.index.isin(positive_indices)]
        print(positive_rows)

        query_corpus_result_embedding = _embed_text(positive_rows.clean_sentence.values)

        # user_history = _read_history(user_name)
        # if not user_history.empty:
        #     user_keyword_embeddings = _embed_text(user_history.clean_sentence.values)
            # print(f'user history shape: {user_keyword_embeddings.shape}')

        user_topic_ratio, user_keyword_embeddings = _read_history_embd(user_name)

        if user_keyword_embeddings.numel() != 0:
            history_rank = _rank_hits_history(user_topic_ratio, user_keyword_embeddings, query_corpus_result_embedding, positive_rows)
            result_df = pd.concat([history_rank, negative_rows])
            result_df = result_df.reset_index(drop=True)

            article_response = schema.ArticleResponse()
            article_response.process_dataset(result_df, positive_indices[-1])
            return schema.Response(status='Ok', code='200', message='success', result=article_response)
        else:
            print("user history is empty")
            article_response = schema.ArticleResponse()
            article_response.process_dataset(rerank_result, positive_indices[-1])
            return schema.Response(status='Ok', code='200', message='success without history', result=article_response)

    except ConnectionError:
        return schema.Response(status='Failed', code='500', message='connection failed', result=None)

# def paragraph_highlighting(url:str, client, user_name):

#     user_topic_ratio, history_emb = _read_history_embd(user_name)
#     if history_emb.numel() != 0:
#         downloaded = fetch_url(url) 
#         result = extract(downloaded,no_fallback=True)
#         if result :

#             paragraphs=result.split('\n')
#             paragraphs.pop(0) # first item is title
#             print(f"paragraphs len: {len(paragraphs)}")

#             para_emb = _embed_text(paragraphs) #shape: (n,384) n-> numbers of paragraphs
#             cos_scores = util.pytorch_cos_sim(para_emb, history_emb)
#             doc_average_score = torch.mean(cos_scores, dim=1).cpu().numpy()

#             # Create a dictionary with order (index) and score
#             score_order_dict = {i: score for i, score in enumerate(doc_average_score)}

#             # Sort the dictionary based on scores (highest to lowest)
#             sorted_score_order_dict = {k: v for k, v in sorted(score_order_dict.items(), key=lambda item: item[1], reverse=True)}
#             print(sorted_score_order_dict)

#             # pop up the first 3 paragraph and score need to over threshold
#             average = sum(doc_average_score) / len(score_order_dict)
#             threshold = 0.15
#             highlighted_paragraph=[]
#             for key in sorted_score_order_dict:
#                 if sorted_score_order_dict[key]>threshold and len(highlighted_paragraph)<4:
#                     highlighted_paragraph.append(paragraphs[key])
#                 else:
#                     break

#             return schema.Response(status='Ok', code='200', message='highlight success', result=highlighted_paragraph)
#         else:
#             return schema.Response(status='Failed', code='500', message='extract function failed', result=None)

#     else:
#         return schema.Response(status='Failed', code='400', message='history is null', result=None)

def paragraph_text_highlighting(paragraphs,user_name):
    user_topic_ratio, history_emb = _read_history_embd(user_name)
    if history_emb.numel() != 0:
        contents=[]
        ids = []
        for item in paragraphs:
            contents.append(item.text)
            ids.append(item.id)

        para_emb = _embed_text(contents) #shape: (n,384) n-> numbers of paragraphs
        cos_scores = util.pytorch_cos_sim(para_emb, history_emb)
        doc_average_score = torch.mean(cos_scores, dim=1).cpu().numpy()

        # Create a dictionary with order (index) and score
        score_order_dict = {ids[i]: score for i, score in enumerate(doc_average_score)}

        # Sort the dictionary based on scores (highest to lowest)
        sorted_score_order_dict = {k: v for k, v in sorted(score_order_dict.items(), key=lambda item: item[1], reverse=True)}
        print(sorted_score_order_dict)

        # pop up the first 3 paragraph and score need to over threshold
        # average = sum(doc_average_score) / len(score_order_dict)
        threshold = 0.3
        highlighted_paragraph=[]
        for key in sorted_score_order_dict:
            if sorted_score_order_dict[key]>threshold and len(highlighted_paragraph)<4:
                highlighted_paragraph.append(key)
            else:
                break

        return schema.Response(status='Ok', code='200', message='highlight success', result=highlighted_paragraph)

    else:
        return schema.Response(status='Failed', code='400', message='history is null', result=None)


def _get_hits_from_haystack(query:str, retriever, ranker):

    pipeline2 = Pipeline()
    pipeline2.add_node(component=retriever, name='Retriever', inputs=['Query'])
    pipeline2.add_node(component=ranker, name='Ranker', inputs=['Retriever'])
    result = pipeline2.run(query=query)

    return result

def _get_hits_from_HF(question_embedding, corpus_embeddings, top_k, client, df=None):
    hits = util.semantic_search(question_embedding, corpus_embeddings, top_k=top_k)
    hits = hits[0]  # Get the hits for the first query

    result_index = [] # get the top10 item from df
    scores=[]
    print("\nHits by bi_encoder:")
    for item in hits:
        idx = item["corpus_id"]
        result_index.append(idx)
        scores.append(item['score'])

    if df is not None:
        df_result = df.iloc[result_index].copy()
    else:

        index_str = ' '.join(map(str, result_index))
        print(index_str)

        result = client.predict(
                        index_str,False,None,
                        api_name="/predict"
        )
        print("after predict")
        df_str = StringIO(result)
        df_result = pd.read_csv(df_str, sep='\t')
    df_result['score']=scores

    print(df_result[["index","title", "score"]].values)
    # df.iloc[result_index].copy().to_csv('hits.csv',',')
    
    return df_result

def _get_hits(question_embedding, corpus_embeddings, top_k, df):
    """
    this function abandon, replaced with _get_hits_from_HF
    loading huge dataset consume too much resources
    """
    hits = util.semantic_search(question_embedding, corpus_embeddings, top_k=top_k)
    hits = hits[0]  # Get the hits for the first query

    result_index = [] # get the top10 item from df
    print("\nHits by bi_encoder:")
    for item in hits:
        idx = item["corpus_id"]
        result_index.append(idx)

    print(df[["index","title"]].values)
    return df.iloc[result_index].copy()

def _rank_hits_cross_encoder(hits_df,query):
    cross_inp = [[query, value] for value in hits_df.clean_sentence.values]

    scores = cross_encoder.predict(cross_inp)
    hits_df['score'] = scores

    hits_df.sort_values(by=['score'], inplace=True, ascending=False)

    print("\nCross Hits:")
    print(hits_df[["index","title","score"]].values)
    return hits_df.copy()

def _rank_hits_history(user_topic_ratio, history_emb, rerank_emb, positive_df) -> pd.DataFrame:
    cos_scores = util.pytorch_cos_sim(rerank_emb, history_emb)
    # print(f"cos: {type(cos_scores)}")
    doc_average_score = torch.mean(cos_scores, dim=1)
    print(f'history_score: {doc_average_score.shape}')

    # top_results = torch.topk(doc_average_score, k=topk)

    print("\nhistory Hits:")

    # only positive score df
    # positive_df = positive_df.iloc[0:int(doc_average_score.shape[0])].copy()

    # normalizie cos-similarity
    positive_df['Cosine Similarity'] = Normalizer(norm="l1").fit_transform(doc_average_score.cpu().reshape(1,-1)).tolist()[0]
    # normalizie cross-encoder score
    positive_df['score'] = Normalizer(norm="l1").fit_transform(positive_df['score'].values.reshape(1, -1)).tolist()[0]
    # get topic score with user
    for his in positive_df['topic2']:
        article_topic=label_empty_list.copy()
        his=literal_eval(his)
        for topic in his:
            article_topic[label_dict[topic]]+=1
        # article topic occurence no need ratio rather directly * user_topic_ratio
        positive_df["topic_score"]=sum(x * y for x, y in zip(user_topic_ratio, article_topic))
    
    # final score
    positive_df['final_score']=positive_df['score'] * 0.5+ positive_df['Cosine Similarity']*0.3+ positive_df['topic_score']*0.2

    # calculate the final score
    positive_df = positive_df.sort_values(by='final_score', ascending=False)
    positive_df = positive_df.reset_index(drop=True)

    print(positive_df.loc[:,("index","title", "Cosine Similarity", "score", "topic_score", "final_score")].values)
    return positive_df

def _read_history_embd(user_name:str):
    directory_name='history/'
    user_file = user_name

    # print(os.getcwd())
    if not os.path.exists(directory_name+user_file+'.json'):
        return None, torch.tensor([])
    else:
        # Step 1: Read the JSON file and extract the user history
        with open(directory_name+user_file+'.json') as f:
            user_history_data = json.load(f)

        # # Step 3: Iterate over the topics in the user history and update the count in the dictionary
        user_topic=label_empty_list.copy()
        for his in user_history_data:
            user_history_topics=his.get('topic',[])
            for topic in user_history_topics:
                user_topic[label_dict[topic]]+=1

        total_occurrences = sum(user_topic)

        # Step 5: Calculate the ratio for each topic
        user_topic_ratio = [ value / total_occurrences for value in user_topic]
        return user_topic_ratio, torch.load(directory_name+user_file+'.pt', map_location=torch.device(device))


