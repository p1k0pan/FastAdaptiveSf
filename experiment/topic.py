from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
from tqdm import tqdm
classifier = pipeline("text-classification", model="Yueh-Huan/news-category-classification-distilbert")
df2=pd.read_csv('../cleaned_medium_articles_v9.csv')

def split_text_into_parts(text, max_words_per_part):
    words = text.split()
    total_words = len(words)

    parts = []
    current_part_word_count = 0

    while current_part_word_count < total_words:
        truncated_words = words[current_part_word_count:current_part_word_count+max_words_per_part]
        truncated_text = ' '.join(truncated_words)
        current_part_word_count+=max_words_per_part
        parts.append(truncated_text)
        
    return parts

total_label=[]
for value in tqdm(df2['text']):
    labels=[]
    max=250
    try:
        for p in split_text_into_parts(value, max):
            cl = classifier(p)[0]
            score = cl['score']
            label = cl['label']
            if label not in labels:
                labels.append(label)
        total_label.append(labels)
    except:
        total_label.append('error')

# def multi_label(row, max):
#     labels=[]
#     try:
#         for p in split_text_into_parts(row['text'], max):
#             cl = classifier(p)[0]
#             score = cl['score']
#             label = cl['label']
#             if label not in labels:
#                 labels.append(label)
#         return labels
#     except:
#         return multi_label(row, max-50)

# tqdm.pandas()
# df2['topic2'] = df2.progress_apply(multi_label, args=(250,), axis=1)
df2['topic2']=total_label
df2.to_csv('../cleaned_medium_articles_v11.csv',index=False)
print("finish")
