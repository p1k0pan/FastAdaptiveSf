# FastAdaptiveSf

FastAPI Adaptive Storyfinder

Please download the model and dataset from https://huggingface.co/spaces/AdaptiveStoryfinder/medium_query_topk/tree/main
and put it on root.

## start

( python -m pip install --upgrade pip ) <br />
pip install -r requirements.txt <br />
<br />
( pip install uvicorn ) <br />
python -m nltk.downloader stopwords <br />
run `uvicorn main:app --reload`

## docker
docker compose build
--> docker compose up


python manage.py makemigrations
python manage.py migrate

python manage.py createsuperuser

## search

example: http://127.0.0.1:8000/search_his?query=start_my_own_restaurant

return:

```json
{
  "title": [
    "Going Down the Restaurant Memory Lane of My Childhood",
    "I ordered chole bhature and received customer experience in return",
    "Is Your Loyalty Program Rewarding the Right Customers?",
    "A new restaurant model? This SF eatery now delivers food out of a 20-year-old Singaporean restaurant in Menlo Park",
    "How to Manage a Restaurant?",
    "Introducing DoorDash Kitchens Full Service, a New Partnership Model for Restaurants To Grow Their…",
    "How To Start A Restaurant Business With No Experience",
    "Five new Peninsula restaurants to try right now",
    "How Do We Get There from Here?",
    "Interior Design Tips That All First Time Buyers Should Know"
  ],
  "urls": [
    "https://medium.com/p/c00c8cca394a",
    "https://medium.com/indian-thoughts/i-ordered-chole-bhature-and-received-customer-experience-in-return-d41aef08590e",
    "https://medium.com/swlh/is-your-loyalty-program-rewarding-the-right-customers-2036791e4df2",
    "https://thesixfifty.com/a-new-model-this-sf-eatery-now-delivers-food-out-of-a-20-year-old-singaporean-eatery-in-menlo-park-b701b07f726c",
    "https://medium.com/@teddybongshim/how-to-manage-a-restaurant-3b489b13e4c5",
    "https://medium.com/doordash/introducing-doordash-kitchens-full-service-a-new-partnership-model-for-restaurants-to-grow-their-f0ac15fb9755",
    "https://medium.com/visualmodo/how-to-start-a-restaurant-business-with-no-experience-ae0fdaceb71",
    "https://thesixfifty.com/five-new-peninsula-restaurants-to-try-right-now-c3dc2618a427",
    "https://medium.com/our-human-family/how-do-we-get-there-from-here-62e2dc931393",
    "https://medium.com/intique/interior-design-tips-that-all-first-time-buyers-should-know-cf9d5e88eb2a"
  ],
  "authors": [
    "['Danna Reich Colman']",
    "['Karthik Pasupathy']",
    "['Ellen Barber']",
    "['The Six Fifty Staff']",
    "['Edward Uke']",
    "[]",
    "[]",
    "['Elena Kadvany']",
    "['Brian Fehler']",
    "[]"
  ],
  "timestamp": [
    "2016-06-30 06:54:17.528000+00:00",
    "2019-11-15 13:07:30.689000+00:00",
    "2019-11-13 17:22:10.945000+00:00",
    "2020-09-10 19:17:05.851000+00:00",
    "2020-02-21 11:10:18.956000+00:00",
    "2021-07-29 13:25:42.338000+00:00",
    "2020-12-07 02:18:15.567000+00:00",
    "2020-10-02 02:07:56.452000+00:00",
    "2020-10-27 06:16:47.159000+00:00",
    "2019-04-26 06:16:12.173000+00:00"
  ],
  "tags": [
    "['Food', 'Beverly Hills', 'Recipe']",
    "['Marketing', 'Food', 'Sales', 'Startup Lessons', 'Customer Experience']",
    "['Business', 'Loyalty Program', 'Restaurant Business', 'Rewards Programs', 'Loyalty']",
    "['Bay Area', 'Restaurant Business', 'San Francisco', 'Silicon Valley', 'Small Business']",
    "['Management', 'Pos', 'Business', 'Restaurant', 'Small Business']",
    "['DoorDash', 'Ghost Kitchen', 'Restaurant', 'Bay Area', 'Delivery']",
    "['Restaurant Business', 'How To', 'Business', 'Experience', 'Restaurant']",
    "['Bay Area', 'Restaurant', 'San Francisco', 'Silicon Valley', 'Foodies']",
    "['Election 2020', 'Family', 'LGBTQ', 'Community', 'Equality']",
    "['Homedesign', 'Interior Design', 'Home Decor', 'Interior Decorating', 'Home Improvement']"
  ],
  "text": ["str1", "str2", "str3"]
}
```

## Crud

### get all user

example: http://127.0.0.1:8000/user (GET)

response:

```json
{
  "code": "200",
  "status": "Ok",
  "message": "Success fetch all data",
  "result": [
    {
      "user_name": "user2",
      "password": "user1_1234",
      "histories": null
    },
    {
      "user_name": "user1",
      "password": "u1_1234",
      "histories": ["1234", "gjsodng", "bnon4reo"]
    }
  ]
}
```

### create a user

example: http://127.0.0.1:8000/user (POST)

request:

```json
{
  "user_name": "user5",
  "password": "user5_1234",
  "histories": null
}
```

response:

```json
{
  "code": "200",
  "status": "Ok",
  "message": "User created successfully",
  "result": {
    "user_name": "user5",
    "password": "user5_1234",
    "histories": null
  }
}
```

### update histories

example: http://127.0.0.1:8000/user (patch)

request:

```json
{
  "user_name": "user5",
  "histories": ["file1", "file2", "file3"]
}
```

response:

```json
{
  "code": "200",
  "status": "Ok",
  "message": "Success update data",
  "result": {
    "user_name": "user5",
    "password": "user5_1234",
    "histories": ["file1", "file2", "file3"]
  }
}
```
