import pandas as pd
import ast



data = pd.read_csv('cleaned_medium_articles_v6.csv')
# Assuming your dataset is stored in a pandas DataFrame called 'data'
# and the column with tags is named 'column_tags'

# Convert the column_tags to a list of tags
tags_list = data['tags'].tolist()
tag = {}


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


