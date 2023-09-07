from typing import List, Optional, Generic, TypeVar, Dict
from pydantic import BaseModel  
from pydantic.generics import GenericModel

T = TypeVar('T')


class UserSchema(BaseModel):
    user_name: Optional[str] = None
    password: Optional[str] = None
    histories: Optional[Dict] = None
    upload_urls: Optional[List[str]]= None

    class Config:
        orm_mode = True


# class Request(GenericModel, Generic[T]):
#     parameter: Optional[T] = Field(...)


# class RequestUser(BaseModel):
#     parameter: UserSchema = Field(...)


class Response(GenericModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T]

class ArticleResponse(BaseModel):
    title: Optional[List[str]]
    urls: Optional[List[str]]
    authors: Optional[List[str]]
    timestamp: Optional[List[str]]
    # tags: Optional[List[str]]
    topic2: Optional[List[str]]
    text: Optional[List[str]]
    thumbnail: Optional[List[str]]  
    index: Optional[List[str]]  


    def process_dataset(self, df):
        self.title = df["title"].tolist()
        self.urls = df['url'].tolist()
        self.authors = df['authors'].tolist()
        self.timestamp = df['timestamp'].tolist()
        # self.tags = df['tags'].tolist()
        self.topic2 = df['topic2'].tolist()
        self.text = df['text'].tolist()
        self.thumbnail= df['thumbnail'].tolist()
        self.index= df['index'].tolist()

    def process_document(self, doc):
        titles = []
        texts = []
        urls = []
        authors = []
        timestamps = []
        thumbnails = []
        topic2s = []
        indices=[]

        for i in doc['documents']:
            titles.append(i.meta['title'])
            texts.append(i.content)
            urls.append(i.meta['url'])
            authors.append(i.meta['authors'])
            timestamps.append(i.meta['timestamp'])
            thumbnails.append(i.meta['thumbnail'])
            topic2s.append(i.meta['topic'])
            indices.append(i.meta['index'])

        self.title = titles
        self.urls = urls
        self.authors = authors
        self.timestamp = timestamps
        # self.tags = df['tags'].tolist()
        self.topic2 = topic2s
        self.text = texts
        self.thumbnail= thumbnails
        self.index= indices
