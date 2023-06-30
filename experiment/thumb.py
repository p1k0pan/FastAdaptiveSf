
import pandas as pd

df = pd.read_csv('cleaned_medium_articles_v5.csv')

first_row = df.iloc[1]
column_names = df.columns
columns_to_delete = ['Unnamed: 0.2', 'Unnamed: 0.1']

old_column_name = 'Unnamed: 0'
new_column_name = 'index'

# Rename the column
df = df.rename(columns={old_column_name: new_column_name})

# Drop the specified columns
df = df.drop(columns=columns_to_delete)
# Iterate over the column names and corresponding values in the first row
# for column_name, value in zip(column_names, first_row):
#     print(f"{column_name}: {value}")

df.to_csv('cleaned_medium_articles_v6')



# print(df.columns)
