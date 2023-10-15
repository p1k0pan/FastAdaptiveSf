# Generate topics for the dataset articles


from queue import Empty
from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
from tqdm import tqdm
import os
import ast
import re
from collections import Counter
import matplotlib.pyplot as plt



# VARIABLES TO CHANGE with the help of the created topic_progress-info.txt --> this way the process can be stopped and started again without losing the progress
######################################################
starting_index = 0 #### CHANGE ######   START VALUE: 0
RUN = 1 #### INCREASE ######            START VALUE: 1

create_topics = False # create new topics here
save_interval = 500

# only if necessary and only AFTER all of the topics have been created
concat_files = False
handle_errors = False # not required right now

# handle_no_topic reqires statistical_distribution to be true
handle_no_topic = True
# Analyse
statistical_distribution = True


removed_topics = ["WEIRD NEWS", "FIFTY", "GOOD NEWS"]                               # VARIABLE     ### will only get assigned of there arent any other options
max_labels = 4 # max amount of topics for an article                                # VARIABLE
high_topic_score = 0.5 # max amount of topics for an article                        # VARIABLE     ### 0.5 is a good score value for a meaningful topic
######################################################



# 1. Create the topics for the articles in the database
if create_topics:
    print("Creating topics ...")
    classifier = pipeline("text-classification", model="Yueh-Huan/news-category-classification-distilbert")
    print("")
    df2=pd.read_csv('../cleaned_medium_articles_v9.csv')
    df2 = df2.iloc[starting_index:]

    # split article into parts
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
    

    total_label=[]
    idx_cnt = starting_index - 1
    # iterate over text
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

    df2_truncated = df2.iloc[:len(total_label)]
    df2_truncated['topic2']=total_label
    df2_truncated.to_csv('cleaned_medium_articles_v11' + '_' + "final" + '_' + str(RUN) + '.csv',index=False)
    print("finish")



# 2. Concat saved files
if concat_files:
    print("merging save files ...")
    df2_1=pd.read_csv('cleaned_medium_articles_v11_3999_1.csv')
    df2_2=pd.read_csv('cleaned_medium_articles_v11_19499_2.csv')
    df2_3=pd.read_csv('cleaned_medium_articles_v11_26999_3.csv')
    df2_4=pd.read_csv('cleaned_medium_articles_v11_59499_4.csv')
    df2_5=pd.read_csv('cleaned_medium_articles_v11_100999_5.csv')
    df2_6=pd.read_csv('cleaned_medium_articles_v11_118499_6.csv')
    df2_7=pd.read_csv('cleaned_medium_articles_v11_final_7.csv')

    merged_df = pd.concat([df2_1, df2_2, df2_3, df2_4, df2_5, df2_6, df2_7], ignore_index=True)
    merged_df.to_csv('cleaned_medium_articles_v12.csv',index=False)
    merged_df=pd.read_csv('cleaned_medium_articles_v12.csv')
    print("merged file:")
    print(merged_df.head)
    print(merged_df.shape)



# 3. Handle errors and fill potential empty topic entries
if handle_errors:
    print("show all of the error tags ...")

    # There was one row with an "error" tag which was removed by the following lines
    ###########################################################
    #final_df=pd.read_csv('cleaned_medium_articles_v12.csv')
    #final_df = final_df.drop(65878) # 65878 contains "error"
    #final_df.reset_index(drop=True, inplace=True)
    #final_df.to_csv('cleaned_medium_articles_v13.csv',index=False)
    ###########################################################

    final_df=pd.read_csv('cleaned_medium_articles_v13.csv')
    print("final file:")
    print(final_df.head)
    print(final_df.shape)
    print("")

    print("check for more errors (tag errors will be printed) ...")
    for index, row in tqdm(final_df.iterrows(), total=final_df.shape[0]):
        contains_error = False
        topics_as_list = None

        try:
            topics_as_list = ast.literal_eval(row["topic2"])
        except ValueError as e:
            print("")
            print(f"Error evaluating topic2 for row index {index}: {e}")
            print("")
            topics_as_list = "error"
    
        for topic in topics_as_list:
            if len(topics_as_list) == 0:
                contains_error = True
                break

            if 'error' in topic.lower() or "" == topic.lower():
                contains_error = True
                break

            if contains_error:
                print("")
                print("error at row index " + str(index) + ": " + row["topic2"])
                print("")
    


# Get the first part of an article text
def first_text_part(text, words_per_chunk):
        words = re.findall(r'\w+', text)
    
        if len(words) <= words_per_chunk:
            return ' '.join(words)
    
        first_part = ' '.join(words[:words_per_chunk])
        return first_part


# Calculate some topics
def calculate_new_topics(row, classifier):
    contains_error = False
    topics_as_list = []


    try:
        topics_as_list = ast.literal_eval(row["topic2"])
    except ValueError as e:
        contains_error = True
        topics_as_list = []

    if (len(topics_as_list) == 0 or not topics_as_list) or 'error' in topics_as_list:
        contains_error = True
    
    for topic in topics_as_list:
        if 'error' in topic.lower() or "" == topic.lower():
            contains_error = True
            break

    
    if contains_error:
        # try to create a new label one last time (score doesnt matter at this point) or leave it empty
        try:
            max_words=250 # words for each split of the article                     # VARIABLE
            text = first_text_part(row["text"], words_per_chunk=max_words)
            #words = re.findall(r'\w+', text)
            #while len(words) < max_words:
                #text += " " + text  # Concatenate the text with itself
                #words = re.findall(r'\w+', text)

            cl = classifier(text)[0]
            label = cl['label']

            last_alternative_label = None
            if not label or label in removed_topics:
                # another try
                max_words=200
                while max_words > 25:
                    text = first_text_part(row["text"], words_per_chunk=max_words)

                    cl = classifier(text)[0]
                    temp_label = cl['label']

                    max_words -= 50

                    if temp_label and temp_label not in removed_topics:
                        label = temp_label
                        break
                    if temp_label in removed_topics:  # finally, if nothing else can be found, just keep the removed topic as a last reserve
                        last_alternative_label = temp_label


            if label:
                return [label] # final_df.at[index, "topic2"] = [label]
            else:
                if last_alternative_label is not None:
                    return [last_alternative_label] # final_df.at[index, "topic2"] = [last_alternative_label]
                else:
                    return [] # final_df.at[index, "topic2"] = []

        except:
            return [] # final_df.at[index, "topic2"] = []

    return []



# Show some relevant statistical values & distributions regarding the generated topics of the dataset
if statistical_distribution:
    print("reading DataFrame for statistical distribution analysis ...")
    final_df=pd.read_csv('../cleaned_medium_articles_v14.csv')
    for index, row in final_df.iterrows():
        try:
            final_df.at[index, "topic2"] = ast.literal_eval(row["topic2"])
        except ValueError as e:
            print("")
            print(f"Error evaluating topic for row index {index}: {e}")
            print("")
            final_df.at[index, "topic2"] = []

    if handle_no_topic:
        classifier = pipeline("text-classification", model="Yueh-Huan/news-category-classification-distilbert")
        print("")
        print("")
        print("")


    # Count the number of entries in each "topic2" list and create a Counter for the counts
    num_entries_counter = Counter([len(topic_list) for topic_list in final_df["topic2"]])

    # Print the count of articles for each number of entries
    print("Number of Articles with Different Number of Entries:")
    for num_entries, count in num_entries_counter.items():
        print(f"{num_entries} entries: {count} articles")
        print("")

        if handle_no_topic: 
            if num_entries == 0 and count > 0:
                print("")
                print("articles with 0 topics:")

                # Remember articles without topic
                articles_without_topic = final_df[final_df["topic2"].apply(len) == 0].index.tolist()

                progress_bar = tqdm(total=len(articles_without_topic), desc="Processing", unit="article")
                for index in articles_without_topic:
                    final_df.at[index, "topic2"] = calculate_new_topics(final_df.loc[index], classifier)
                    progress_bar.update(1)
                progress_bar.close()

                # Print articles which had no topic, but now should have received one
                print("")
                print("Articles which did not have a topic just now")
                for index in articles_without_topic:
                    print(f"Article {index} - 'topic2':", final_df.loc[index, "topic2"])
    
    if handle_no_topic:
        print("")
        print("")
        print("")
        print("Try it again after calculating new topics for empty ones:")
        num_entries_counter = Counter([len(topic_list) for topic_list in final_df["topic2"]])
        for num_entries, count in num_entries_counter.items():
            print(f"{num_entries} entries: {count} articles")
            
        final_df.to_csv('cleaned_medium_articles_v14.csv',index=False)
        final_df=pd.read_csv('cleaned_medium_articles_v14.csv')
    print("")
    print("")
    print("")
    topics_only = final_df['topic2']


    # Flatten the lists of topics
    all_topics = [topic for sublist in topics_only for topic in sublist]

    # Calculate the frequency distribution
    topic_distribution = Counter(all_topics)

    # Convert to DataFrame for easier manipulation
    distribution_df = pd.DataFrame.from_dict(topic_distribution, orient='index', columns=['Frequency'])

    # Sort the DataFrame by frequency
    distribution_df = distribution_df.sort_values(by='Frequency', ascending=False)

    # Print the complete frequency distribution DataFrame
    print("Complete Frequency Distribution:\n")
    print(distribution_df)

    # Visualize the distribution
    plt.figure(figsize=(10, 6))
    distribution_df.plot(kind='bar', legend=None)
    plt.xlabel('Topic')
    plt.ylabel('Frequency')
    plt.title('Topic Distribution')
    plt.show()


