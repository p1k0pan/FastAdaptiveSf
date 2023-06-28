from contextlib import asynccontextmanager
import pandas as pd
from modules import controller as con
from modules import authorization as auth

from sqlalchemy import text
from db import config, schema, crud, model
from sqlalchemy.orm import Session

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from gradio_client import Client
from typing import Union
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm


corpus_embeddings = None # model from main dataset
client=None

'''
# connect database
model.Base.metadata.create_all(bind=config.engine)
def get_db():
    db = config.SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_session = Depends(get_db)
'''
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
    return {"message": "Hello World from FastAPI"}

@app.get("/docker_test")
async def docker_test():
    print("test success")
    return {"message": "test success"}

@app.get("/search")
async def search_query(query:str=""):
    #example http://127.0.0.1:8000/search?query=start_my_own_restaurant

    query = query.replace("_", " ")

    query_corpus_result= con.search_query(query,corpus_embeddings=corpus_embeddings, client=client)

    return {"title": query_corpus_result["title"].tolist(), "urls": query_corpus_result['url'].tolist(),
            "authors": query_corpus_result['authors'].tolist(), "timestamp":query_corpus_result['timestamp'].tolist(),
            "tags": query_corpus_result['tags'].tolist(), "text": query_corpus_result['text'].tolist()}

@app.get("/search_his")
async def search_query_history(query:str=""):
    #example http://127.0.0.1:8000/search_his?query=start_my_own_restaurant

    query_corpus_result= con.search_query_history(query,corpus_embeddings=corpus_embeddings, client=client)

    return {"title": query_corpus_result["title"].tolist(), "urls": query_corpus_result['url'].tolist(),
            "authors": query_corpus_result['authors'].tolist(), "timestamp":query_corpus_result['timestamp'].tolist(),
            "tags": query_corpus_result['tags'].tolist(), "text": query_corpus_result['text'].tolist()}
    # return {"title": "test"}

'''
@app.get('/user')
async def get_user(skip: int = 0, limit: int = 100, db: Session =db_session):
    _users = crud.get_all_user(db, skip, limit)
    return schema.Response(status="Ok", code="200", message="Success fetch all data", result=_users)

@app.post("/user")
async def create_user(request: schema.UserSchema, db: Session =db_session): 
    _user = crud.create_user(db, user=request)
    # detect exception from input
    return schema.Response(status="Ok",
                    code="201",
                    message="User created successfully", result=_user)

@app.patch("/user")
async def update_histories(request: schema.UserSchema, db: Session =db_session):
    # detect upload_urls exception
    _user = crud.update_history(db, user_name=request.user_name, upload_urls=request.upload_urls)
    return schema.Response(status="Ok", code="200", message="Success update data", result=_user)

@app.post("/login")
async def login_to_create_token( user: schema.UserSchema, db: Session =db_session):
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
            token = auth.create_token(_user.user_name)

            return schema.Response(status="Ok",
                        code="200",
                        message="login success", result=token)

@app.get("/token_verify")
async def token_verif(request:Request,db: Session =db_session):
    try:
        token = request.headers['authorization']
        status, code, msg, result = auth.token_decode(token)
        if result:
            # if token not expired, check username
            _user = crud.get_user(db, result)
            if not _user:
                return schema.Response(status="credentials exception",
                            code="400",
                            message="token is invalid", result=None)

        return schema.Response(status=status, code=code, message=msg, result=result)
    except KeyError:
        return schema.Response(status="Failed", code='404', message="Token not found in Header", result=None)
'''