import pandas as pd
from sentence_transformers import SentenceTransformer, util, CrossEncoder
import torch
import modules.clean_dataset
import json
import numpy as np
import argparse



# Create the argument parser
parser = argparse.ArgumentParser()

# Add the arguments
parser.add_argument('--clean_corpus', action='store_true', help='Flag to generate dataset')
parser.add_argument('--gen_corpus_tensor', action='store_true', help='Flag to generate corpus tensor')

# Parse the arguments
args = parser.parse_args()

if torch.cuda.is_available():
    device = 'cuda'
elif torch.backends.mps.is_available():
    device = 'mps'
else:
    device = 'cpu'

bi_encoder = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1', device=device)
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2',device=device)



def read_history() -> pd.DataFrame:
    with open('food_health_data.json') as f:
        data = json.load(f)

    history= []
    for index in data:
        history.append(data[index])
    user_history = pd.DataFrame(history, columns=['sentence'])
    user_history = clean_dataset.clean_sentences(user_history)
    return user_history



def embed_text(text):
    return bi_encoder.encode(text, convert_to_tensor=True,show_progress_bar=True)



def rank_hits_history(history_emb, rerank_emb, topk, df) -> pd.DataFrame:
    cos_scores = util.pytorch_cos_sim(rerank_emb, history_emb)
    doc_average_score = torch.mean(cos_scores, dim=1)

    top_results = torch.topk(doc_average_score, k=topk)

    print("\nhistory Hits:")

    result_index = [] # get the top10 item from df

    for score, idx in zip(top_results[0], top_results[1]):
        score = score.cpu().data.numpy() 
        idx = idx.cpu().data.numpy()
        print(f"{idx}: {df[['title']].iloc[idx].values}")
        result_index.append(idx)

    return df.iloc[result_index].copy()



def get_hits(question_embedding, corpus_embeddings, top_k, df):
    hits = util.semantic_search(question_embedding, corpus_embeddings, top_k=top_k)
    hits = hits[0]  # Get the hits for the first query

    result_index = [] # get the top10 item from df
    print("\nHits by bi_encoder:")
    for item in hits:
        idx = item["corpus_id"]
        result_index.append(idx)
        print(f"{idx}: {df[['title']].iloc[idx].values}")
    
    return df.iloc[result_index].copy()



def rank_hits_cross_encoder(hits_df,query):
    cross_inp = [[query, value] for value in hits_df.clean_sentence.values]

    scores = cross_encoder.predict(cross_inp)
    hits_df['score'] = scores

    hits_df.sort_values(by=['score'], inplace=True, ascending=False)

    print("\nCross Hits:")
    print(f"{hits_df[['title']].values}")
    return hits_df.copy()



def load_corpus():
    if args.clean_corpus:
        dataset_path = 'medium_articles.csv'
        print("clean corpus dataset")
        df = pd.read_csv(dataset_path)
        df['sentence'] = df['title'] + ': ' + df['text']
        df['sentence'] = df['sentence'].astype(str)
        df = clean_dataset.clean_sentences(df)
        df.to_csv('cleaned_medium_articles.csv',',')
    else:
        dataset_path = 'cleaned_medium_articles_v6.csv'
        print("load corpus dataset")
        df = pd.read_csv(dataset_path)
    return df



def load_corpus_tensor(df:pd.DataFrame):
    if args.gen_corpus_tensor:
        print("start embedding corpus")
        corpus_embeddings = embed_text(df.clean_sentence.values)
        print("end embedding corpus")
        torch.save(corpus_embeddings, 'corpus_embeddings_v2.pt')
        print("saved")
    else:
        print("load corpus embedding")
        corpus_embeddings = torch.load('corpus_embeddings.pt').to(device)

    return corpus_embeddings



def model_from_HF(df:pd.DataFrame, query)->pd.DataFrame:
    """
        use uploaded api to get model
    """

    print(query)
    client = Client("https://adaptivestoryfinder-medium-query-topk.hf.space/")
    result = client.predict(
                    "10",	# str  in 'topk' Textbox component
                    query,
                    api_name="/predict"
    )
    result = list(map(int, result))
    top10_df = df.iloc[result].copy()
    return top10_df



def model_from_local(df:pd.DataFrame, query)->pd.DataFrame:
    corpus_embeddings = load_corpus_tensor(df)

    print(query)
    query_embedding = embed_text(query)
    # print(f'query shape: {query_embedding.shape}')

    query_corpus_result = get_hits(query_embedding, corpus_embeddings, 10,df)

    rerank_result = rank_hits_cross_encoder(query_corpus_result,query)
    return rerank_result



if __name__ == "__main__":

    query:str = "start my own restaurant"	# str  in 'query' Textbox component
    df = load_corpus()
    corpus_embeddings = load_corpus_tensor(df)


