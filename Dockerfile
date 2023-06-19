FROM python:3.8

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

RUN python -m nltk.downloader punkt
RUN python -m nltk.downloader stopwords
RUN python -m nltk.downloader wordnet
RUN mv /root/nltk_data /usr/local/nltk_data

COPY . .

# RUN mv cleaned_medium_articles.csv modules/cleaned_medium_articles.csv
# RUN mv corpus_embeddings.pt modules/corpus_embeddings.pt

# CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "7860"]
# CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0" ]

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
