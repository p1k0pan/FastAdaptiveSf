from contextlib import asynccontextmanager
import pandas as pd
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


corpus_embeddings = None # model from main dataset
client=None
tag_story={}
ACCESS_TOKEN_EXPIRED = 10
REFRESH_TOKEN_EXPIRED = 30

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

    print("start loading model and dataset")
    # df = con.load_corpus()
    corpus_embeddings=con.load_corpus_tensor()
    client = Client("https://adaptivestoryfinder-medium-query-topk.hf.space/")

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
                        message="login success", result={"access_token": access_token, "refresh_token": refresh_token})

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
            if code=="201":
                # assign a token
                access_token = auth.create_token(_user.user_name, ACCESS_TOKEN_EXPIRED)
                refresh_token = auth.create_token(_user.user_name, REFRESH_TOKEN_EXPIRED)
                response.headers["access_token"] = access_token
                response.headers["refresh_token"] = refresh_token
                return schema.Response(status=status, code=code, message=msg, result={"access_token": access_token, "refresh_token": refresh_token})

        return schema.Response(status=status, code=code, message=msg, result=result)
    except KeyError:
        return schema.Response(status="Failed", code='404', message="Token not found in Header", result=None)

@app.get("/search", tags=["Search"])
async def search_query(query:str=""):
    #example http://127.0.0.1:8000/search?query=start_my_own_restaurant

    query = query.replace("_", " ")

    query_corpus_result= con.search_query(query,corpus_embeddings=corpus_embeddings, client=client)


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


@app.get('/user/all',tags=["User"])
async def get_all_user(skip: int = 0, limit: int = 100, db: Session =db_session):
    _users = crud.get_all_user(db, skip, limit)
    return schema.Response(status="Ok", code="200", message="Sucstatus, code, msg, resultcess fetch all data", result=_users)

@app.get('/user',tags=["User"])
async def get_user(user_name:str, db: Session =db_session ):

    _users = crud.get_user(db, user_name)
    return schema.Response(status="Ok", code="200", message="Success get user", result=_users)

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

    if token.code == "201" or token.code== "200":

        if request.user_name == None or request.upload_urls == None:
            return schema.Response(status="Failed", code='400', message='User name or upload file is empty', result=None)

        status, code, msg, result = crud.update_histories(user_name=request.user_name, upload_urls=request.upload_urls)
        return schema.Response(status=status, code=code, message=msg, result=result)

    else:
        return schema.Response(status=token.status, code=token.code, message=token.message, result=None)

@app.get("/initial_tag_story", tags=["Tag"])
async def initial_tag_story(tag:str=""):
    if tag=="":
        return schema.Response(status="Failed", code='400', message='tags empty', result=None)
    else:
        result = random_story.random_stories(tag,client)
        
        if result.code == '200':
            dfs, articles = result.result
            tag_story[tag]=dfs
            result.result = articles

        return result

@app.get("/next_tag_story", tags=["Tag"])
async def next_story(tag:str=""):
    if tag=="":
        return schema.Response(status="Failed", code='400', message='tag empty', result=None)
    else:
        try:
            print('next')
            dfs= tag_story[tag]
            articles = dfs.random_sample()
            print(articles.iloc[2])

            article_response = schema.ArticleResponse()
            article_response.process_dataset(articles)
            # return schema.Response(status='Ok', code='200', message='success', result=articles)
            return schema.Response(status='Ok', code='200', message='success', result=article_response)
        except:
            return schema.Response(status="Failed", code='400', message='tag is not initialize', result=None)
