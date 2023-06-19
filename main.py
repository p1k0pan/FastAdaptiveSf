from contextlib import asynccontextmanager
import pandas as pd
from modules import controller as con

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from gradio_client import Client

corpus_embeddings = None # model from main dataset
client=None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global corpus_embeddings
    global client

    print("start loading model and dataset")
    # df = con.load_corpus()
    corpus_embeddings=con.load_corpus_tensor()
    client = Client("https://adaptivestoryfinder-medium-query-topk.hf.space/")

    print("ready to go")
    yield # ctrl-c stop the program would run code below
    print("end lifespan")

app = FastAPI(lifespan=lifespan)

# NEW
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/docker_test")
async def docker_test():
    print("test success")
    return {"message": "test success"}

@app.get("/search")
async def search_query(query:str=""):
    #example http://127.0.0.1:8000/search?query=start_my_own_restaurant

    query = query.replace("_", " ")

    query_corpus_result= con.search_query(query,corpus_embeddings=corpus_embeddings, client=client)

    return {"title": query_corpus_result["title"].tolist(), "urls": query_corpus_result['url'].tolist()}

@app.get("/search_his")
async def search_query_history(query:str=""):
    #example http://127.0.0.1:8000/search_his?query=start_my_own_restaurant

    query_corpus_result= con.search_query_history(query,corpus_embeddings=corpus_embeddings, client=client)

    # return {"title": query_corpus_result["title"].tolist(), "urls": query_corpus_result['url'].tolist()}
    return {"title": "test"}


