from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
from tqdm import tqdm
import os


# VARIABLES TO CHANGE with the help of the created topic_progress-info.txt --> this way the process can be stopped and started again without losing the progress
######################################################
starting_index = 4000 #### CHANGE ######   START VALUE: 0
RUN = 2 #### INCREASE ######            START VALUE: 1

create_topics = True
save_interval = 500
concat_files = False
handle_errors = False
######################################################



# 1. Create the topics for the articles in the database
if create_topics:
    print("Creating topics ...")

    classifier = pipeline("text-classification", model="Yueh-Huan/news-category-classification-distilbert")
    df2=pd.read_csv('../cleaned_medium_articles_v9.csv')
    df2 = df2.iloc[starting_index:]


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


    removed_topics = ["WEIRD NEWS", "FIFTY", "GOOD NEWS"]                               # VARIABLE     ### SHOULD NOT BE MORE THAN THE MAX AMOUNT OF TOPICS FOR EACH ARTICLE
    max_labels = 4 # max amount of topics for an article                                # VARIABLE
    high_topic_score = 0.5 # max amount of topics for an article                        # VARIABLE     ### 0.5 is a good score value for a meaningful topic

    total_label=[]
    idx_cnt = starting_index - 1
    for value in tqdm(df2['text']):
        topics = {}
        max_words=250 # words for each split of the article                             # VARIABLE
        max_parts = 5 # max amount of split parts with those words for an article       # VARIABLE

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
                    elif assignedLabelsCnt < max_labels and score >= high_topic_score: # assign more topics
                        labels.append(label)
                        assignedLabelsCnt += 1
                    else:
                        if not labels: # if all of the topics are in the "removed_topics" list (labels is empty), just add it anyways to at least have one
                            first_label = next(iter(sorted_topics.keys()))
                            labels.append(first_label)
                        break
            
            total_label.append(labels) # list of sorted labels
            print(labels)
        except:
            total_label.append('error')


        idx_cnt += 1
        if (idx_cnt + 1) % save_interval == 0: # save every 1000 iterations
            df2_truncated = df2.iloc[:len(total_label)]
            df2_truncated['topic2']=total_label
            df2_truncated.to_csv('cleaned_medium_articles_v11' + '_' + str(idx_cnt) + '_' + str(RUN) + '.csv',index=False)

            info_file = "topic_progress-info.txt"
            f = open(info_file, "w")
            f.write("Important variables and how to change them for the next run \n\n")
            f.write("Current RUN: \n")
            f.write(str(RUN) + "\n")
            f.write("=> RUN variable for the next run: " + str(RUN+1) + " \n\n\n\n")
            f.write("Current iteration index: \n")
            f.write(str(idx_cnt) + "\n")
            f.write("=> starting_index variable for the next run: " + str(idx_cnt+1) + " \n\n\n\n")
            f.close()

            print("saving on iteration " + str(idx_cnt) + " ...")

            # remove older saves
            removeable_index = idx_cnt - save_interval
            if removeable_index < 0:
                continue
            else:
                try:
                    path = 'cleaned_medium_articles_v11' + '_' + str(removeable_index) + '_' + str(RUN) +  '.csv'
                    os.remove(path)
                except OSError as e:
                    print(f"Error: {e.filename} - {e.strerror}")


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

    df2_truncated = df2.iloc[:len(total_label)]
    df2_truncated['topic2']=total_label
    df2_truncated.to_csv('cleaned_medium_articles_v11' + '_' + "final" + '_' + str(RUN) + '.csv',index=False)
    print("finish")



# 2. Concat saved files
if concat_files:
    print("merging save files ...")



# 3. Handle errors and fill potential empty topic entries
if handle_errors:
    print("handling the error tags ...")