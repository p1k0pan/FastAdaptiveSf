from typing import List, Optional, Generic, TypeVar, Dict
from pydantic import BaseModel  
from pydantic.generics import GenericModel


T = TypeVar('T')


# Define the schema used for the requests or responses with FastAPI

# Schema for the users
class UserSchema(BaseModel):
    user_name: Optional[str] = None
    password: Optional[str] = None
    histories: Optional[Dict] = None
    upload_urls: Optional[List[str]]= None

    class Config:
        orm_mode = True


# Schema for website paragraphs
class ParagraphSchema(BaseModel):
    # paragraphs: Optional[List[Dict]] = None
    text: Optional[str] = None
    id: Optional[str] = None

    class Config:
        orm_mode = True


# General response schema
class Response(GenericModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T] = None


# Schema for an article
class ArticleResponse(BaseModel):
    title: Optional[List[str]] = None
    urls: Optional[List[str]] = None
    authors: Optional[List[str]] = None
    timestamp: Optional[List[str]] = None
    # tags: Optional[List[str]] = None # old default tags
    topic2: Optional[List[str]] = None # newly generated topics/tags
    text: Optional[List[str]] = None
    thumbnail: Optional[List[str]] = None  
    index: Optional[List[int]] = None  
    positive_index: Optional[int] = None

    def process_dataset(self, df, positive_index:int=-1):
        self.title = df["title"].tolist()
        self.urls = df['url'].tolist()
        self.authors = df['authors'].tolist()
        self.timestamp = df['timestamp'].tolist()
        # self.tags = df['tags'].tolist()
        self.topic2 = df['topic2'].tolist()
        self.text = df['text'].tolist()
        self.thumbnail= df['thumbnail'].tolist()
        self.index= df['index'].tolist()
        self.positive_index = positive_index

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


