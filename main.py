import pandas as pd
import torch
from modules import controller as con, random_story
from modules import authorization as auth

from sqlalchemy import text
from db import config, schema, crud, model
from sqlalchemy.orm import Session
from typing import List

from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from gradio_client import Client
from typing import Union
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# trying out haystack to increase the performance (but it did in fact only make the performance worse)
# from haystack.document_stores.faiss import FAISSDocumentStore
# from haystack.nodes import EmbeddingRetriever, SentenceTransformersRanker, TransformersSummarizer
# from haystack import Pipeline

import json
import time
import os
from collections import defaultdict
from contextlib import asynccontextmanager


# FastAPI Setup

corpus_embeddings = None # model from main dataset
client=None
tag_sampler={}
initial_tags=['WELLNESS', 'TECH']
user_tag_sampler={}
ACCESS_TOKEN_EXPIRED = 10
REFRESH_TOKEN_EXPIRED = 30
document_store=None
retriever=None
ranker=None
device='cpu'
df = con.load_corpus()
client=None
# client = Client("http://127.0.0.1:7860")
# client = Client("https://adaptivestoryfinder-medium-query-topk.hf.space/")

print('initializing common tags')
# initial tag sampler
for i in range(len(initial_tags)):
    result=random_story.random_stories(initial_tags[i], df)
    if result.code == '200':
        dfs = result.result
        tag_sampler[initial_tags[i]]=dfs
print(tag_sampler.keys())

print('initializing user tags')
folder_path = "history"
for filename in os.listdir(folder_path):
    if filename.endswith(".txt"):
        file_path = os.path.join(folder_path, filename)

        with open(file_path, "r") as file:
            content = file.read()
            tag_list = content.split()
            user_tags={}

            for t in tag_list:
                if t not in initial_tags:
                    result=random_story.random_stories(t, df)
                    if result.code == '200':
                        dfs = result.result
                        user_tags[t]=dfs
                else:
                    user_tags[t]=tag_sampler[t]
            user_tag_sampler[filename[:-4]]=user_tags
print(user_tag_sampler.keys())


# Connect to the database
model.Base.metadata.create_all(bind=config.engine)
def get_db():
    db = config.SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_session = Depends(get_db)

app = FastAPI()


# Load model + dataset
@asynccontextmanager
async def lifespan(app: FastAPI):
    global corpus_embeddings
    global document_store
    global retriever 
    global ranker
    global device

    print("start loading model and dataset")
    # df = con.load_corpus()
    corpus_embeddings=con.load_corpus_tensor()

    # initial haystack document_stores, retriever, ranker
    # assert document_store.faiss_index_factory_str == "Flat"
    # print("initializing retriever:")
    # retriever = EmbeddingRetriever(
    # document_store = FAISSDocumentStore.load(index_path="all_medium_faiss_v2.faiss", config_path="all_medium_faiss_v2.json")
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


# Define origins (localhost right now)
origins = [
    "http://localhost",
    "http://localhost:8080",
]

# Define middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# General hello world GET
@app.get("/")
async def root():
    return {"message": "Hello World from FastAPI"}


# Login POST 
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


# Authorization token verify GET
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

        return schema.Response(status=status, code=code, message=msg, result={"user_name": result})
        # return schema.Response(status=status, code=code, message=msg, result=result)
    except KeyError:
        return schema.Response(status="Failed", code='404', message="Token not found in Header", result=None)


# Basic search GET without user history
@app.get("/search", tags=["Search"])
async def search_query(query:str=""):
    #example http://127.0.0.1:8000/search?query=start_my_own_restaurant

    query = query.replace("_", " ")

    T1 = time.time()
    query_corpus_result= con.search_query(query,corpus_embeddings=corpus_embeddings, client=client,
                                          retriever=retriever, ranker= ranker, df=df)
    T2 = time.time()
    print('Running time: %sms' % ((T2 - T1)*1000))
    return query_corpus_result


# Search GET with a user history/ preference
@app.get("/search_his", tags=["Search"])
async def search_query_history(query:str="",token=Depends(token_verify)):
    #example http://127.0.0.1:8000/search_his?query=start_my_own_restaurant

    query = query.replace("_", " ")
    if token.code == "201" or token.code== "200":
        print(token.result)
        query_corpus_result= con.search_query_history(query,corpus_embeddings=corpus_embeddings, client=client, user_name= token.result['user_name'], df=df)
        return query_corpus_result

    else:
        return schema.Response(status=token.status, code=token.code, message=token.message, result=None)


# Highlight a paragraph POST
@app.post("/highlight", tags=["Search"])
async def highlight_paragraph(request:List[schema.ParagraphSchema],token=Depends(token_verify)):
    if token.code == "201" or token.code== "200":
        result= con.paragraph_text_highlighting(request, token.result["user_name"])
        return result
    else:
        return schema.Response(status=token.status, code=token.code, message=token.message, result=None)


# All of the users GET
@app.get('/user/all',tags=["User"])
async def get_all_user(skip: int = 0, limit: int = 100, db: Session =db_session):
    _users = crud.get_all_user(db, skip, limit)
    return schema.Response(status="Ok", code="200", message="Sucstatus, code, msg, resultcess fetch all data", result=_users)


# Single user GET
@app.get('/user',tags=["User"])
async def get_user(user_name:str, db: Session =db_session ):

    _users = crud.get_user(db, user_name)
    return schema.Response(status="Ok", code="200", message="Success get user", result=_users)


# A users history uploads GET
@app.get('/user/history',tags=["User"])
async def get_user_history(user_name:str, token=Depends(token_verify)):
    if token.code == "201" or token.code== "200":
        file_path = f"history/{user_name}.json"
        # get all histories from user and return it aggregated with date
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                grouped_data = defaultdict(list)
                for item in data:
                    date = item['date']
                    grouped_data[date].append(item)
                result = dict(grouped_data)
            return schema.Response(status="Ok", code="200", message="successful get user history", result=result)
        except FileNotFoundError:
            print(f"The file {file_path} does not exist.")
            return schema.Response(status="Failed", code="404", message="file not exist", result={})
        except json.JSONDecodeError:
            print(f"The file {file_path} is not a valid JSON file.")
            return schema.Response(status="Failed", code="400", message="not valid Json file", result={})
    else:
        return schema.Response(status=token.status, code=token.code, message=token.message, result=None)


# Delete a certain part of a users history PATCH
@app.patch('/user/history/delete',tags=["User"])
async def delete_history(user_name:str,index=-1, date_str="", token=Depends(token_verify)):
    if token.code == "201" or token.code== "200":
        file_path = f"history/{user_name}.json"
        result = None
        try:
            with open(file_path, 'r') as f:
                history = pd.read_json(f)
                history["date"]=history["date"].astype('str')
                result = crud.delete_history(int(index), date_str, history)
            if result is not None:
                result.to_json(file_path, orient='records', indent=4)
                try:
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                        grouped_data = defaultdict(list)
                        for item in data:
                            date = item['date']
                            grouped_data[date].append(item)
                        result = dict(grouped_data)
                    return schema.Response(status="Ok", code="200", message="successful delete", result=result)
                except FileNotFoundError:
                    print(f"The file {file_path} does not exist.")
                    return schema.Response(status="Failed", code="404", message="file not exist", result={})
                except json.JSONDecodeError:
                    print(f"The file {file_path} is not a valid JSON file.")
                    return schema.Response(status="Failed", code="400", message="not valid Json file", result={})

            else:
                return schema.Response(status="Failed", code="500", message="unknown error", result=None)

        except FileNotFoundError:
            print(f"The file {file_path} does not exist.")
            return schema.Response(status="Failed", code="404", message="file not exist", result={})
        except json.JSONDecodeError:
            print(f"The file {file_path} is not a valid JSON file.")
            return schema.Response(status="Failed", code="400", message="not valid Json file", result={})
    else:
        return schema.Response(status=token.status, code=token.code, message=token.message, result=None)


# Set a user POST
@app.post("/user", tags=["User"])
async def create_user(request: schema.UserSchema, db: Session =db_session): 
    if request.user_name == None or request.password == None:
        return schema.Response(status="Failed", code='400', message='User name or password is empty', result=None)

    status, code, msg, result = crud.create_user(db, user_name=request.user_name, password=request.password)
    # detect exception from input
    return schema.Response(status=status, code=code, message=msg, result=result)


# Update user histories PATCH
@app.patch("/user", tags=["User"])
async def update_histories(request: schema.UserSchema,token=Depends(token_verify)):
    # detect upload_urls exception

    if token.code == "201" or token.code== "200":

        if request.user_name == None or request.upload_urls == None:
            return schema.Response(status="Failed", code='400', message='User name or upload file is empty', result=None)

        # get user history
        status, code, msg, result = crud.update_histories(user_name=request.user_name, upload_urls=request.upload_urls, device=device)
        return schema.Response(status=status, code=code, message=msg, result=result)

    else:
        return schema.Response(status=token.status, code=token.code, message=token.message, result=None)


# Get random articles recommendations for the specified tag/topic
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


# Get the next article which already loaded with a sampler
@app.get("/next_tag_story", tags=["Tag"])
async def next_story(tag:str="", user_name:str=""):
    if user_name!="":
        try:
            articles = pd.DataFrame()
            for t in user_tag_sampler[user_name]:
                dfs = user_tag_sampler[user_name][t] 
                articles = pd.concat([articles, dfs.random_sample()], ignore_index=True)
            article_response = schema.ArticleResponse()
            article_response.process_dataset(articles)
            return schema.Response(status='Ok', code='200', message='success', result=article_response)
        except Exception as e:
            print(e)
            return schema.Response(status="Failed", code='400', message='tag is not initialize', result=None)
    else:
        if tag=="":
            return schema.Response(status="Failed", code='400', message='tag empty', result=None)
        else:
            try:
                dfs= tag_sampler[tag]
                articles = dfs.random_sample()

                article_response = schema.ArticleResponse()
                article_response.process_dataset(articles)
                return schema.Response(status='Ok', code='200', message='success', result=article_response)
            except Exception as e:
                print(e)
                return schema.Response(status="Failed", code='400', message='tag is not initialize', result=None)


