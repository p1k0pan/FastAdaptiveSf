import experiments.medium_embeddings as me
from contextlib import asynccontextmanager
import pandas as pd
import controller as con

from fastapi import FastAPI

df = pd.DataFrame() # all data from maindataset

corpus_embeddings = None # model from main dataset

@asynccontextmanager
async def lifespan(app: FastAPI):
    global df    # Load the ML model
    global corpus_embeddings

    print("start loading model and dataset")
    df = con.load_corpus()
    corpus_embeddings=con.load_corpus_tensor()

    print("ready to go")
    yield # ctrl-c stop the program would run code below
    print("end lifespan")


app = FastAPI(lifespan=lifespan)
# app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/search")
async def search_query(query:str=""):
    #example http://127.0.0.1:8000/search?query=hello

    query = query.replace("_", " ")

    query_corpus_result= con.search_query(query,corpus_embeddings=corpus_embeddings, df=df)

    return {"m": query_corpus_result["title"].tolist()}

@app.get("/search_his")
async def search_query_history(query:str=""):
    #example http://127.0.0.1:8000/search?query=hello

    query_corpus_result= con.search_query_history(query,corpus_embeddings=corpus_embeddings, df=df)

    return {"m": query_corpus_result["title"].tolist()}

