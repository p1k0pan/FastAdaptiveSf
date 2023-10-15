# NOT IN USE anymore (instead topic.py); from https://github.com/MaartenGr/BERTopic



from numba.core.errors import NumbaDeprecationWarning, NumbaPendingDeprecationWarning # conda install numba
import warnings

warnings.simplefilter('ignore', category=NumbaDeprecationWarning)
warnings.simplefilter('ignore', category=NumbaPendingDeprecationWarning)



# Imports
from bertopic import BERTopic
from sklearn.datasets import fetch_20newsgroups
import torch
from bertopic.representation import KeyBERTInspired
import os
import pandas as pd

# Further imports
import collections
from tqdm import tqdm
from sklearn.feature_extraction.text import CountVectorizer
#from cuml.manifold import UMAP # DOES NOT WORK ON WINDOWS
#from cuml.cluster import HDBSCAN # DOES NOT WORK ON WINDOWS
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer



# Load embeddings & dataset & device

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current) # ...\FastAdaptiveSf

dataset_path = str(parent) + "\cleaned_medium_articles_v6.csv"
embeddings_path = str(parent) + "\corpus_embeddings_v2.pt"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("device: " + str(device))


## (standard_modeling) Topic Modeling with BERTopic: https://colab.research.google.com/drive/1FieRA9fLdkQEGDIMYl0I3MCjSUKVF8C-?usp=sharing
print("Topic Modeling with BERTopic")



# Train model & load data

# Clean_sentence extract that column
#docs = fetch_20newsgroups(subset='all',  remove=('headers', 'footers', 'quotes'))['data']
print(dataset_path)
df = pd.read_csv(dataset_path)
docs = df['Clean_sentence']
print(docs.head)

corpus_embeddings = torch.load(embeddings_path, map_location=device) # torch.device(device)
print(corpus_embeddings)

topic_model = BERTopic(language="english", calculate_probabilities=True, verbose=True) # topic_model = BERTopic(embedding_model="xlm-r-bert-base-nli-stsb-mean-tokens")
topics, probs = topic_model.fit_transform(docs, corpus_embeddings)



# Reduce topics

new_topics, new_probs = topic_model.reduce_topics(docs, topics, probs, nr_topics=30) # topic_model.reduce_topics(docs, nr_topics=60)



# Show Results

topic_model.get_topic_info()
topic_model.get_topic(0) # Select the most frequent topic

topic_model.topics_[:10] # access the predicted topics for the first 10 documents



# Visualizations

topic_model.visualize_topics() # Visualize Topics

topic_model.visualize_distribution(probs[200], min_probability=0.015) # Visualize Topic Probabilities

topic_model.visualize_hierarchy(top_n_topics=50) # Topic Hierarchy

topic_model.visualize_barchart(top_n_topics=5) # Visualize Terms

topic_model.visualize_heatmap(n_clusters=20, width=1000, height=1000) # Visualize Topic Similarity



# Save model
topic_model.save(path + "standard_topic_model")
topic_model.save("standard_topic_model")
# my_model = BERTopic.load("standard_topic_model") # load again
