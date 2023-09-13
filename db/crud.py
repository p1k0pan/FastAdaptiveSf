from sqlalchemy.orm import Session
import torch
from . import model, schema
from typing import List
# from newspaper import Article, Config
from modules import controller, clean_dataset
import pandas as pd
from trafilatura import fetch_url, extract
from tqdm import tqdm

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

def update_histories(user_name: str, upload_urls:List, device:str):

    directory_name = "history/"  
    if not os.path.exists(directory_name):
        os.mkdir(directory_name)

    user_file = user_name

    new_history =[]
    content_to_emb =[]
    try:
        df = pd.read_json(directory_name+user_file+".json")
        i= int(df['index'].iloc[-1])
        print("last index: ", i)
        i+=1
        flag=True
    except FileNotFoundError:
        df = pd.DataFrame()
        i=0
        flag=False
        print("file not found")

    for url in tqdm(upload_urls):
        # condition: when file not exist or file exist and url not exist
        if not flag or (flag and not df['url'].isin([str(url)]).any()):
            new_history_item, content_to_emb_item = extract_url(str(url), i)
            
            # condition: when extract function is correct with returning valid value(including "")
            if new_history_item is not None and content_to_emb_item is not None:
                new_history.extend(new_history_item)
                content_to_emb.extend(content_to_emb_item)
                i+=1
            else:
                return ['Failed', '500', 'extract function failed', None]
        
    # after processing, if new_history is still empty, then return failed
    if not new_history and not content_to_emb:
        return ['Failed', '400', 'no new data', None]

    new_df = pd.DataFrame(new_history)

    new_emb = controller._embed_text(content_to_emb)

    if flag:
        df = pd.concat([df, new_df], ignore_index=True)
        history_emb = torch.load(directory_name+user_file+'.pt', map_location=torch.device(device))
        # tensor concat 
        con_emb = torch.cat((history_emb, new_emb), dim=0)
        torch.save(con_emb, directory_name+user_file+".pt")
    else:
        df = new_df
        torch.save(new_emb, directory_name+user_file+".pt")
    df.to_json(directory_name+user_file+".json", orient='records', indent=4)
    

    return ['Ok', '200', 'Success update data', user_name]


def extract_url(url, i):

    new_history =[]
    content_to_emb =[]
    try:

        downloaded = fetch_url(url) 
        result = extract(downloaded,no_fallback=True)
        content_to_emb.append(result) # what if the result is ""

        if result:
            title_index = result.find('\n')
            title = result[:title_index]
            content = result[title_index:]
            
        else:
            title = ""
            content=""

        item={ 'index': i,'title': title, 'url': str(url), 'content': content}

        new_history.append(item)
    except Exception as e:
        print(e)
        return (None, None)
    return (new_history, content_to_emb)
