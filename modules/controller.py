import pandas as pd
import torch
from . import clean_dataset
import json
from sentence_transformers import SentenceTransformer, util, CrossEncoder
from io import StringIO
import os
from db import schema

result_num = 50

if torch.cuda.is_available():
    device = 'cuda'
elif torch.backends.mps.is_available():
    device = 'mps'
else:
    device = 'cpu'

def _embed_text(text):
    return bi_encoder.encode(text, convert_to_tensor=True,show_progress_bar=True)

bi_encoder = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1', device=device)
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2',device=device)

def load_corpus():
    dataset_path = 'cleaned_medium_articles.csv'
    print("load corpus dataset")
    df = pd.read_csv(dataset_path)
    return df

def load_corpus_tensor():
    tensor_path= 'corpus_embeddings_v2.pt'
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

def search_query(query:str, corpus_embeddings, client):
    print(query)
    query_embedding = _embed_text(query)
    # print(f'query shape: {query_embedding.shape}')

    try:
        query_corpus_result = _get_hits_from_HF(query_embedding, corpus_embeddings, result_num,client)

        rerank_result = _rank_hits_cross_encoder(query_corpus_result,query)

        article_response = schema.ArticleResponse()
        article_response.process_dataset(rerank_result)
        return schema.Response(status='Ok', code='200', message='success', result=article_response)
    except ConnectionError:
        return schema.Response(status='Failed', code='500', message='connection failed', result=None)

def search_query_history(query:str, corpus_embeddings, client, user_name):

    print(query)
    query_embedding = _embed_text(query)
    # print(f'query shape: {query_embedding.shape}')

    try:
        query_corpus_result = _get_hits_from_HF(query_embedding, corpus_embeddings, result_num,client)

        rerank_result = _rank_hits_cross_encoder(query_corpus_result,query)

        query_corpus_result_embedding = _embed_text(rerank_result.clean_sentence.values)

        user_history = _read_history(user_name)
        if not user_history.empty:
            user_keyword_embeddings = _embed_text(user_history.clean_sentence.values)
            # print(f'user history shape: {user_keyword_embeddings.shape}')

            history_rank = _rank_hits_history(user_keyword_embeddings, query_corpus_result_embedding, rerank_result)

            article_response = schema.ArticleResponse()
            article_response.process_dataset(history_rank)
            return schema.Response(status='Ok', code='200', message='success', result=article_response)
        else:
            article_response = schema.ArticleResponse()
            article_response.process_dataset(rerank_result)
            return schema.Response(status='Ok', code='200', message='success without history', result=article_response)

    except ConnectionError:
        return schema.Response(status='Failed', code='500', message='connection failed', result=None)


def _get_hits_from_HF(question_embedding, corpus_embeddings, top_k, client):
    hits = util.semantic_search(question_embedding, corpus_embeddings, top_k=top_k)
    hits = hits[0]  # Get the hits for the first query

    result_index = [] # get the top10 item from df
    print("\nHits by bi_encoder:")
    for item in hits:
        idx = item["corpus_id"]
        result_index.append(idx)

    index_str = ' '.join(map(str, result_index))
    print(index_str)

    result = client.predict(
                    index_str,False,None,
                    api_name="/predict"
    )
    df_str = StringIO(result)
    df_result = pd.read_csv(df_str, sep='\t')
    print(df_result[["Unnamed: 0","title"]].values)
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

    print(df[["Unnamed: 0","title"]].values)
    return df.iloc[result_index].copy()

def _rank_hits_cross_encoder(hits_df,query):
    cross_inp = [[query, value] for value in hits_df.clean_sentence.values]

    scores = cross_encoder.predict(cross_inp)
    hits_df['score'] = scores

    hits_df.sort_values(by=['score'], inplace=True, ascending=False)

    print("\nCross Hits:")
    print(hits_df[["Unnamed: 0","title"]].values)
    return hits_df.copy()

def _rank_hits_history(history_emb, rerank_emb, df) -> pd.DataFrame:
    cos_scores = util.pytorch_cos_sim(rerank_emb, history_emb)
    # print(f"cos: {type(cos_scores)}")
    doc_average_score = torch.mean(cos_scores, dim=1)
    print(f'history_score: {doc_average_score.shape}')

    # top_results = torch.topk(doc_average_score, k=topk)

    print("\nhistory Hits:")

    df['Cosine Similarity'] = doc_average_score.tolist()   
    df = df.sort_values(by='Cosine Similarity', ascending=False)
    df = df.reset_index(drop=True)

    print(df[["Unnamed: 0","title"]].values)

    return df

def _read_history(user_name:str):

    directory_name='history/'
    user_file = user_name+'.json'

    # print(os.getcwd())
    if not os.path.exists(directory_name+user_file):

        # with open('food_health_data.json', 'r') as f:
        #     data = json.load(f)
        #     print("go with default")
        return pd.DataFrame()
    else:
        with open(directory_name+user_file, 'r') as f:
            data = json.load(f)
            print("go with user")

            history= []
            for index in data:
                history.append(data[index])
            user_history = pd.DataFrame(history, columns=['sentence'])
            user_history = clean_dataset.clean_sentences(user_history)
            # print(user_history.head())
            return user_history
