from contextlib import asynccontextmanager
import pandas as pd
import torch
from modules import controller as con, random_story
from modules import authorization as auth

from sqlalchemy import text
from db import config, schema, crud, model
from sqlalchemy.orm import Session

from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from gradio_client import Client
from typing import Union
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from haystack.document_stores.faiss import FAISSDocumentStore
from haystack.nodes import EmbeddingRetriever, SentenceTransformersRanker, TransformersSummarizer
from haystack import Pipeline

import json
import time

corpus_embeddings = None # model from main dataset
client=None
tag_sampler={}
initial_tags=['Technology', 'Health']
presented_tag_story={}
ACCESS_TOKEN_EXPIRED = 10
REFRESH_TOKEN_EXPIRED = 30
document_store=None
retriever=None
ranker=None
device='cpu'

# connect database
model.Base.metadata.create_all(bind=config.engine)
def get_db():
    db = config.SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_session = Depends(get_db)

app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global corpus_embeddings
    global client
    global presented_tag_story
    global document_store
    global retriever 
    global ranker
    global device

    print("start loading model and dataset")
    # df = con.load_corpus()
    corpus_embeddings=con.load_corpus_tensor()
    client = Client("https://adaptivestoryfinder-medium-query-topk.hf.space/")

    print('initializing tags')
    # initial tag sampler
    # [await initial_tag_story(tag) for tag in initial_tags]
    # presented_tag_story = {tag: [] for tag in initial_tags}
    # print(tag_sampler.keys())

    # initial haystack document_stores, retriever, ranker
    # document_store = FAISSDocumentStore.load(index_path="all_medium_faiss_v2.faiss", config_path="all_medium_faiss_v2.json")
    # assert document_store.faiss_index_factory_str == "Flat"
    # print("initializing retriever:")
    # retriever = EmbeddingRetriever(
    #     document_store=document_store, embedding_model="sentence-transformers/multi-qa-MiniLM-L6-cos-v1",top_k=50
    # )
    # print("initializing ranker:")
    # ranker = SentenceTransformersRanker(model_name_or_path="cross-encoder/ms-marco-MiniLM-L-6-v2", top_k=50)

    if torch.cuda.is_available():
        device = 'cuda'
    elif torch.backends.mps.is_available():
        device = 'mps'
    else:
        device = 'cpu'

    print("ready to go")
    yield # ctrl-c stop the program would run code below
    print("end lifespan")

app = FastAPI(lifespan=lifespan)



origins = [
    "http://localhost",
    "http://localhost:8080",
]

# NEW
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World from FastAPI"}

@app.post("/login", tags=["Authorization"])
async def login_to_create_token(response:Response, user: schema.UserSchema, db: Session =db_session):
    _user = crud.get_user(db, user.user_name)
    if not _user:
        return schema.Response(status="Bad Request",
                    code="400",
                    message="Invalid user name or user not found", result=None)
    else:
        if _user.password !=user.password:
            return schema.Response(status="Bad Request",
                        code="400",
                        message="Invalid password", result=None)
        else:
            # assign a token
            access_token = auth.create_token(_user.user_name, ACCESS_TOKEN_EXPIRED)
            refresh_token = auth.create_token(_user.user_name, REFRESH_TOKEN_EXPIRED)
            response.headers["access_token"] = access_token
            response.headers["refresh_token"] = refresh_token

            return schema.Response(status="Ok",
                        code="200",
                                   message="login success", result={"user_name": _user.user_name,"access_token": access_token, "refresh_token": refresh_token})

@app.get("/token_verify", tags=["Authorization"])
async def token_verify(response: Response, request:Request,db: Session =db_session, refresh:bool=False):
    try:
        token = request.headers['authorization']
        status, code, msg, result = auth.token_validation(token,refresh)
        if code=="201" or code == "200":
            # if token not expired, check username
            _user = crud.get_user(db, result)
            if not _user:
                return schema.Response(status="credentials exception",
                            code="400",
                            message="token is invalid", result=None)
            # 201 = refresh 
            if code=="201":
                # assign a token
                access_token = auth.create_token(_user.user_name, ACCESS_TOKEN_EXPIRED)
                refresh_token = auth.create_token(_user.user_name, REFRESH_TOKEN_EXPIRED)
                response.headers["access_token"] = access_token
                response.headers["refresh_token"] = refresh_token
                return schema.Response(status=status, code=code, message=msg, result={"user_name": result,"access_token": access_token, "refresh_token": refresh_token})
            elif code=="401":
                return schema.Response(status=status, code=code, message=msg, result={"user_name": _user.user_name})


        return schema.Response(status=status, code=code, message=msg, result=result)
    except KeyError:
        return schema.Response(status="Failed", code='404', message="Token not found in Header", result=None)

@app.get("/search", tags=["Search"])
async def search_query(query:str=""):
    #example http://127.0.0.1:8000/search?query=start_my_own_restaurant

    query = query.replace("_", " ")

    T1 = time.time()
    # pipeline2 = Pipeline()
    # pipeline2.add_node(component=retriever, name='Retriever', inputs=['Query'])
    # pipeline2.add_node(component=ranker, name='Ranker', inputs=['Retriever'])
    # result = pipeline2.run(query=query)
    query_corpus_result= con.search_query(query,corpus_embeddings=corpus_embeddings, client=client,
                                          retriever=retriever, ranker= ranker)
    T2 = time.time()
    print('Running time: %sms' % ((T2 - T1)*1000))
    return query_corpus_result

@app.get("/search_his", tags=["Search"])
async def search_query_history(query:str="",token=Depends(token_verify)):
    #example http://127.0.0.1:8000/search_his?query=start_my_own_restaurant

    query = query.replace("_", " ")
    if token.code == "201" or token.code== "200":
        print(token.result)
        query_corpus_result= con.search_query_history(query,corpus_embeddings=corpus_embeddings, client=client, user_name= token.result)
        return query_corpus_result

    else:
        return schema.Response(status=token.status, code=token.code, message=token.message, result=None)
    # return {"title": "test"}

@app.get("/highlight", tags=["Search"])
async def highlight_paragraph(url:str="",token=Depends(token_verify)):

    if token.code == "201" or token.code== "200":
        result= con.paragraph_highlighting(url, client, token.result)
        return result
    else:
        return schema.Response(status=token.status, code=token.code, message=token.message, result=None)


@app.get('/user/all',tags=["User"])
async def get_all_user(skip: int = 0, limit: int = 100, db: Session =db_session):
    _users = crud.get_all_user(db, skip, limit)
    return schema.Response(status="Ok", code="200", message="Sucstatus, code, msg, resultcess fetch all data", result=_users)

@app.get('/user',tags=["User"])
async def get_user(user_name:str, db: Session =db_session ):

    _users = crud.get_user(db, user_name)
    return schema.Response(status="Ok", code="200", message="Success get user", result=_users)

@app.get('/user/history',tags=["User"])
async def get_user(user_name:str, db: Session =db_session ):
    if token.code == "201" or token.code== "200":
        file_path = f"history/{user_name}.json"
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            return schema.Response(status="Ok", code="200", message="successful get user history", result=data)
        except FileNotFoundError:
            print(f"The file {file_path} does not exist. Creating an empty JSON.")
            return schema.Response(status="Failed", code="404", message="file not exist", result={})
        except json.JSONDecodeError:
            print(f"The file {file_path} is not a valid JSON file. Creating an empty JSON.")
            return schema.Response(status="Failed", code="400", message="not valid Json file", result={})
    else:
        return schema.Response(status=token.status, code=token.code, message=token.message, result=None)

@app.post("/user", tags=["User"])
async def create_user(request: schema.UserSchema, db: Session =db_session): 
    if request.user_name == None or request.password == None:
        return schema.Response(status="Failed", code='400', message='User name or password is empty', result=None)

    status, code, msg, result = crud.create_user(db, user_name=request.user_name, password=request.password)
    # detect exception from input
    return schema.Response(status=status, code=code, message=msg, result=result)

@app.patch("/user", tags=["User"])
async def update_histories(request: schema.UserSchema, db: Session =db_session,token=Depends(token_verify)):
    # detect upload_urls exception

    # if token.code == "201" or token.code== "200":

    if request.user_name == None or request.upload_urls == None:
        return schema.Response(status="Failed", code='400', message='User name or upload file is empty', result=None)

    status, code, msg, result = crud.update_histories(user_name=request.user_name, upload_urls=request.upload_urls, device=device)
    return schema.Response(status=status, code=code, message=msg, result=result)

    # else:
    #     return schema.Response(status=token.status, code=token.code, message=token.message, result=None)

@app.get("/initial_tag_story", tags=["Tag"])
async def initial_tag_story(tag:str=""):
    if tag=="":
        return schema.Response(status="Failed", code='400', message='tags empty', result=None)
    else:
        result = random_story.random_stories(tag,client)
        
        if result.code == '200':
            dfs = result.result
            tag_sampler[tag]=dfs
            result.result = None

        return result

@app.get("/next_tag_story", tags=["Tag"])
async def next_story(tag:str=""):
    if tag=="":
        return schema.Response(status="Failed", code='400', message='tag empty', result=None)
    else:
        try:
            dfs= tag_sampler[tag]
            articles = dfs.random_sample()

            article_response = schema.ArticleResponse()
            article_response.process_dataset(articles)
            presented_tag_story[tag].append(article_response)
            return schema.Response(status='Ok', code='200', message='success', result=article_response)
        except:
            return schema.Response(status="Failed", code='400', message='tag is not initialize', result=None)
