from sqlalchemy.orm import Session
from . import model, schema
from typing import List
from newspaper import Article, Config

import json
import os


def get_all_user(db: Session, skip: int = 0, limit: int = 100):
    return db.query(model.User).offset(skip).limit(limit).all()

def get_user(db: Session, user_name: str):
    return db.query(model.User).filter(model.User.user_name==user_name).first()

def create_user(db: Session, user_name: str, password: str):

    _user_check = get_user(db=db, user_name = user_name)
    if _user_check != None:
        return ['Failed', '400', 'user exist', None]
    else:
        _user = model.User(user_name=user_name, password=password)
        db.add(_user)
        db.commit()
        db.refresh(_user)
        return ['Ok', '201', 'user create success', _user]

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

def update_histories(user_name: str, upload_urls:List):


    directory_name = "history/"  
    if not os.path.exists(directory_name):
        os.mkdir(directory_name)

    user_file = user_name+".json"

    with open(directory_name+user_file, "w+") as uf:
        try:
            index = json.load(uf)
        except json.JSONDecodeError:
            # JSON file is empty or invalid
            index = {}
        except Exception as e:
            print(e)
            return ['Failed', '500', 'internal error', e]

        user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
        config = Config()
        config.browser_user_agent = user_agent

        for url in upload_urls:
            if str(url) not in index:
                try:
                    article = Article(url)
                    article.download()
                    article.parse()
                    index[str(url)] = article.text
                except Exception as e:
                    print(e)
                    continue


        uf.write(json.dumps(index))

    return ['Ok', '200', 'Success update data', user_name]






