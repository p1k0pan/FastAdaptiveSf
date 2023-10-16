from sqlalchemy.orm import Session
import torch
from . import model, schema
from typing import List
# from newspaper import Article, Config
from modules import controller, clean_dataset
import pandas as pd
from trafilatura import fetch_url, extract
from tqdm import tqdm
from transformers import pipeline

import json
import os
from datetime import date
 
# Returns the current local date
pipe = pipeline("text-classification", model="Yueh-Huan/news-category-classification-distilbert", truncation=True)

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

# upload histories
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
        df["date"]=df["date"].astype('str')
        i+=1
        flag=True
    except FileNotFoundError:
        df = pd.DataFrame()
        i=0
        flag=False
        print("file not found")

    today = str(date.today())
    for url in tqdm(upload_urls):
        # condition: when file not exist or file exist and url not exist
        if not flag or (flag and not df['url'].isin([str(url)]).any()):
            new_history_item, content_to_emb_item = extract_url(str(url), i, today)
            
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
    
    # get occurence of topic
    topics={}
    for item in df['topic']:
        for t in item:
            if t in topics:
                topics[t]+=1
            else:
                topics[t]=1
    sorted_occurrence = dict(sorted(topics.items(), key=lambda x: x[1], reverse=True))
    keys = list(sorted_occurrence.keys())
    print(keys)
    first_key = keys[0] if len(keys) > 0 else None
    second_key = keys[1] if len(keys) > 1 else None
    with open(directory_name+user_file+".txt", 'w') as file:
        file.write(str(first_key) + "\n")
        file.write(str(second_key) + "\n")
    return ['Ok', '200', 'update success', user_name]

# delete histories
def delete_history(index:int, date_str:str, history:pd.DataFrame):
    if date_str == "":
        # if date is not None that means delete all history with date
        history = history[history['index'] != index]
    else:
        history = history[history['date'] != date_str]

    # Reset the index
    history = history.reset_index(drop=True)

    # Reassign the "i" column with the same values as the index
    history['index'] = history.index
    return history

# using extract function to extract content from url
def extract_url(url, i, d):

    new_history =[]
    content_to_emb =[]
    try:

        downloaded = fetch_url(url) 
        result = extract(downloaded,no_fallback=True)
        topic=[]
        title = ""
        content="" 

        if result:
            content_to_emb.append(result) # what if the result is ""
            title_index = result.find('\n')
            title = result[:title_index]
            content = result[title_index:]

            count=0
            max_labels=4
            high_topic_score = 0.5
            for part in split_text_into_parts(result, 250, 5):
                cl=pipe(part)[0]
                score = cl['score']
                label = cl['label']
                if count==0 or (count < max_labels and score >= high_topic_score and label not in topic):
                    topic.append(label)
                    count+=1
            
        else:
            content_to_emb.append("")
            
        item={ 'index': i,'title': title, 'url': str(url), 'content': content, "date": str(d), "topic": topic}

        new_history.append(item)
    except Exception as e:
        print(e)
        return (None, None)
    return (new_history, content_to_emb)

# split text into parts that fits in applying model
def split_text_into_parts(text, max_words_per_part, max_parts):
    words = text.split()
    total_words = len(words)

    parts = []
    current_part_word_count = 0

    word_limit = total_words if total_words <= max_words_per_part * max_parts else max_words_per_part * max_parts # limit amount of split parts
    while current_part_word_count < word_limit:
        truncated_words = words[current_part_word_count:current_part_word_count+max_words_per_part]
        truncated_text = ' '.join(truncated_words)
        current_part_word_count+=max_words_per_part
        parts.append(truncated_text)
        
    return parts
