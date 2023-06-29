from sqlalchemy.orm import Session
from . import model, schema
from typing import List
from newspaper import Article
import json


def get_all_user(db: Session, skip: int = 0, limit: int = 100):
    return db.query(model.User).offset(skip).limit(limit).all()

def get_user(db: Session, user_name: str):
    return db.query(model.User).filter(model.User.user_name==user_name).first()

def create_user(db: Session, user: schema.UserSchema ):
    _user = model.User(user_name=user.user_name, password=user.password)
    db.add(_user)
    db.commit()
    db.refresh(_user)
    return _user

def update_history(db: Session, user_name: str,  upload_urls:List):
    _user = get_user(db=db, user_name = user_name)
    upload_count =0
    # upload and clean

    # no previous uploaded histories
    if _user.histories == None:
        new_histories = {}
        for url in upload_urls:
            article = Article(url)
            article.download()
            article.parse()
            new_histories[url.strip("\n")] =article.text
            upload_count+=1
    else:
        new_histories =json.loads(_user.histories) 

        for url in upload_urls:
            if str(url) not in new_histories:
                article = Article(url)
                article.download()
                article.parse()
                new_histories[url.strip("\n")] =article.text
                upload_count+=1

    print(upload_count)
    formatted_json = json.dumps(new_histories, indent=2)
    _user.histories = formatted_json

    db.commit()
    db.refresh(_user)
    return _user
