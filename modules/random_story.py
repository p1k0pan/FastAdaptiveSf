import pandas as pd
import random
from db import schema
from io import StringIO


# Define a sampler to initialize random articles from a specific tag/topic
class DataFrameSampler:
    def __init__(self, dataframe):
        self.dataframe = dataframe.copy()
        self.sampled_indices = set()  

    def random_sample(self, n=10):
        n = min(n, len(self.dataframe))
        if n==0:
            return pd.DataFrame()

        sampled_data = []
        while len(sampled_data) < n:
            random_index = random.randint(0, len(self.dataframe) - 1)

            if random_index not in self.sampled_indices:
                self.sampled_indices.add(random_index)

                sampled_data.append(self.dataframe.iloc[random_index])

        self.dataframe.drop(self.dataframe.index[list(self.sampled_indices)], inplace=True)
        self.sampled_indices.clear()  

        return pd.DataFrame(sampled_data)


# Receive some random tag/topic-related articles
def random_stories(tag:str,df):

    res = df[df['topic2'].apply(lambda x: tag in x)].copy()
    if not res.empty:
        dfs = DataFrameSampler(res)
        return schema.Response(status='Ok', code='200', message='successful initialize random story sampler', result=dfs)
    else:
        return schema.Response(status='Ok', code='400', message='tag is not in df', result=None)


