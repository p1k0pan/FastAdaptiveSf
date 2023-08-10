from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
from tqdm import tqdm
classifier = pipeline("text-classification", model="Yueh-Huan/news-category-classification-distilbert")
df2=pd.read_csv('../cleaned_medium_articles_v9.csv')

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


removed_topics = ["WEIRD NEWS", "FIFTY", "GOOD NEWS"] # topics that are not important at all   ### SHOULD NOT BE MORE THAN THE MAX AMOUNT OF TOPICS FOR EACH ARTICLE
max_labels = 4 # max amount of topics for an article
total_label=[]
for value in tqdm(df2['text']):
    topics = {}
    max_words=250 # words for each split of the article
    max_parts = 5 # max amount of split parts with those words for an article

    try:
        # Calculate the topics for the split parts
        for part in split_text_into_parts(value, max_words, max_parts):
            cl = classifier(part)[0]
            score = cl['score']
            label = cl['label']

            if label not in topics:
                topics[label] = score
            else:
                if topics[label] < score:
                    topics[label] = score

        # Assign topics to database entries
        sorted_topics = dict(sorted(topics.items(), key=lambda item: item[1], reverse=True)) # sort topics (labels) according to the score


        labels = []
        assignedLabelsCnt = 0
        for label, score in sorted_topics.items():
            #print(f"Key: {label}, Value: {score}")

            if label in removed_topics:
                continue
            else:
                if assignedLabelsCnt == 0:# ALWAYS append the first topic
                    labels.append(label)
                    assignedLabelsCnt += 1
                elif assignedLabelsCnt < max_labels and score >= 0.5: # assign more topics   # 0.5 is a good value for a meaningful topic
                    labels.append(label)
                    assignedLabelsCnt += 1
                else:
                    if not labels: # if all of the topics are in the "removed_topics" list (labels is empty), just add it anyways to at least have one
                        first_label = next(iter(sorted_topics.keys()))
                        labels.append(first_label)
                    break
        
        total_label.append(labels) # list of sorted labels
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
