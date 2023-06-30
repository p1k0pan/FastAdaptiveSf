import pandas as pd

import ast
data = pd.read_csv('cleaned_medium_articles_v6.csv')
# Assuming your dataset is stored in a pandas DataFrame called 'data'
# and the column with tags is named 'column_tags'

# Convert the column_tags to a list of tags
tags_list = data['tags'].tolist()
tag = {}

# clist = ast.literal_eval(tags_list[0])
# print(type(clist))
for l in tags_list:

    # Convert the string to a list
    converted_list = ast.literal_eval(l)
    for t in converted_list:
        if t not in tag:
            tag[t]=1
        else:
            tag[t]+=1
sorted_dict = dict(sorted(tag.items(), key=lambda x: x[1]))

print(sorted_dict)
# Flatten the list of tags and split if a cell contains a list
# flattened_tags = [tag for sublist in tags_list for tag in sublist if isinstance(sublist, list)]

# Count the occurrences of each tag
# tag_counts = pd.Series(flattened_tags).value_counts()

# Print the distinct tags and their counts
# print(tags_list)
# print(tag_counts)
