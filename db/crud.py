from sqlalchemy.orm import Session
from . import model, schema
from typing import List
from newspaper import Article
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

    # current_directory = os.getcwd() # root
    directory_name = "history/" + user_name
    index_url = directory_name + "/index.json"
    if not os.path.exists(directory_name):
        os.mkdir(directory_name)

    with open(index_url, "w+") as index_file:
        try:
            index = json.load(index_file)
            cur_num =  max(index.values())
        except json.JSONDecodeError:
            # JSON file is empty or invalid
            index = {}
            cur_num = 0
        except Exception as e:
            print(e)
            return ['Failed', '500', 'internal error', e]


        print(cur_num)

        for url in upload_urls:
            if str(url) not in index:
                cur_num+=1
                index[str(url)] = cur_num
                article = Article(url)
                article.download()
                article.parse()

                article_url = directory_name + "/" + str(cur_num) + ".txt"
                with open(article_url, 'w') as article_file:
                    article_file.write(article.text)

        index_file.write(json.dumps(index))

    return ['Ok', '200', 'Success update data', user_name]






