import pandas as pd
import torch
from . import clean_dataset
import json
from sentence_transformers import SentenceTransformer, util, CrossEncoder

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
    tensor_path= 'corpus_embeddings.pt'
    print("load corpus embedding")
    corpus_embeddings = torch.load(tensor_path, map_location=torch.device(device))
    return corpus_embeddings

def search_query(query:str, corpus_embeddings, df)->pd.DataFrame:
    print(query)
    query_embedding = _embed_text(query)
    # print(f'query shape: {query_embedding.shape}')

    # query_corpus_result:pd.DataFrame = getTopResult(query_embedding, corpus_embeddings, 10, df)
    query_corpus_result = _get_hits(query_embedding, corpus_embeddings, 10,df)

    rerank_result = _rank_hits_cross_encoder(query_corpus_result,query)
    return rerank_result

def search_query_history(query:str, corpus_embeddings, df)->pd.DataFrame:

    query_corpus_result = search_query(query,corpus_embeddings,df)

    query_corpus_result_embedding = _embed_text(query_corpus_result.clean_sentence.values)

    user_history = _read_history()
    user_keyword_embeddings = _embed_text(user_history.clean_sentence.values)
    # print(f'user history shape: {user_keyword_embeddings.shape}')

    history_rank = _rank_hits_history(user_keyword_embeddings, query_corpus_result_embedding, 10, query_corpus_result)

    return history_rank

def _get_hits(question_embedding, corpus_embeddings, top_k, df):
    hits = util.semantic_search(question_embedding, corpus_embeddings, top_k=top_k)
    hits = hits[0]  # Get the hits for the first query

    result_index = [] # get the top10 item from df
    print("\nHits by bi_encoder:")
    for item in hits:
        idx = item["corpus_id"]
        result_index.append(idx)
        print(f"{idx}: {df[['title']].iloc[idx].values}")

    # df.iloc[result_index].copy().to_csv('hits.csv',',')
    
    return df.iloc[result_index].copy()

def _rank_hits_cross_encoder(hits_df,query):
    cross_inp = [[query, value] for value in hits_df.clean_sentence.values]

    scores = cross_encoder.predict(cross_inp)
    hits_df['score'] = scores

    hits_df.sort_values(by=['score'], inplace=True, ascending=False)

    print("\nCross Hits:")
    print(f"{hits_df[['title']].values}")
    return hits_df.copy()

def _rank_hits_history(history_emb, rerank_emb, topk, df) -> pd.DataFrame:
    cos_scores = util.pytorch_cos_sim(rerank_emb, history_emb)
    # print(f"cos: {type(cos_scores)}")
    doc_average_score = torch.mean(cos_scores, dim=1)
    # print(f'history_score: {doc_average_score.shape}')

    top_results = torch.topk(doc_average_score, k=topk)

    print("\nhistory Hits:")

    # result = top_results.indices.tolist()
    result_index = [] # get the top10 item from df

    for score, idx in zip(top_results[0], top_results[1]):
        score = score.cpu().data.numpy() 
        idx = idx.cpu().data.numpy()
        print(f"{idx}: {df[['title']].iloc[idx].values}")
        result_index.append(idx)
        # result.append(df[['clean_sentence']].iloc[idx].item())

    return df.iloc[result_index].copy()

def _read_history() -> pd.DataFrame:
    with open('food_health_data.json') as f:
        data = json.load(f)

    history= []
    for index in data:
        history.append(data[index])
    user_history = pd.DataFrame(history, columns=['sentence'])
    user_history = clean_dataset.clean_sentences(user_history)
    # print(user_history.head())
    return user_history

