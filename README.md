# FastAdaptiveSf

FastAPI Adaptive Storyfinder

Please download the model and dataset from https://huggingface.co/spaces/AdaptiveStoryfinder/medium_query_topk/tree/main
and put it on root.

## start
0. Install Python 3.8.16 / Python 3.10 <br />
1. ( If necessary: python -m pip install --upgrade pip ) <br />
2. Only once: create Python environment like (py -3.8 -m venv test-env    or    py -3.8 -m virtualenv test-env    or     conda create -n test-env python=3.8) <br />
3. Activate environment every time: Scripts\activate     or     Scripts\activate.bat     or     conda activate Masterprojekt <br />
4. Update requirements: `pip install -r requirements.txt` <br />
<br />

*frontend* (Vue): <br />
0. cd frontend <br />
1. ( If necessary: npm install -g npm ) / alternatively with yarn <br />
2. Only once: npm install -g @vue/cli <br />
3. ( If error occurs run: rm -rf node_modules package-lock.json && npm install ) <br />
4. Update requirements: `npm install` <br />
5. Everytime: `npm run serve` <br />
<br />

*backend* (FastAPI): <br />
1. ( pip install uvicorn ) <br />
2. python -m nltk.downloader stopwords <br />
3. Everytime: run `uvicorn main:app --reload`

## docker

Start docker: <br />
`docker compose build` <br />
--> Everytime: `docker compose up` <br />

For migrations: <br />
1. python manage.py makemigrations <br />
2. python manage.py migrate <br />

Create a super user: <br />
python manage.py createsuperuser <br />


## search

### search with history (GET)

example: http://127.0.0.1:8000/search_his?query=start_my_own_restaurant

return:

```json
{
  "code": "200",
  "status": "Ok",
  "message": "success",
  "result": {
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
}
```

### search without history(GET)

example: http://127.0.0.1:8000/search?query=start_my_own_restaurant

return structure with search with history

### random articles(GET)

example: http://127.0.0.1:8000/random?tag=Technology

return structure with search with history

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

example: http://127.0.0.1:8000/user (PATCH)

request:

```json
{
  "user_name": "user1",
  "upload_urls": [
    "https://www.aljazeera.com/news/2023/4/19/thousands-try-to-flee-sudan-as-truce-fails",
    "https://www.aljazeera.com/news/2023/4/19/diplomats-aid-workers-under-attack-in-nightmare-sudan-violence",
    "https://english.alarabiya.net/News/world/2023/04/19/Russia-s-private-Wagner-Group-denies-it-is-operating-in-Sudan"
  ]
}
```

response:

```json
{
    "code": "200",
    "status": "Ok",
    "message": "Success update data",
    "result": {
        "password": "u1_1234",
        "user_name": "user1"
        "histories":"{\n  \"https://www.aljazeera.com/news/2023/4/19/thousands-try-to-flee-sudan-as-truce-fails\": \"Khartoum residents struggle with power cuts, water shortage as fighting rages for fifth day.\\n\\nA new ceasefire\", \n  \"https://www.aljazeera.com/news/2023/4/19/diplomats-aid-workers-under-attack-in-nightmare-sudan-violence\": \"Endre Stiansen, the Norwegian ambassador to Sudan, said the \‘urban warfare\’ in Khartoum is unprecedented.\"
    }
```

## Authorization

### login to create token

example: http://127.0.0.1:8000/login (POST)

request body:

```json
{
  "user_name": "user1",
  "password": "u1_1234"
}
```

response:

success:

```json
{
  "code": "200",
  "status": "Ok",
  "message": "login success",
  "result": "user_name"
}

response header
{
    "access_token": "access_token",
    "refresh_token": "refresh_token"
}
```

user name error:

```json
{
  "code": "400",
  "status": "Bad Request",
  "message": "Invalid user name or user not found",
  "result": null
}
```

password incorrect:

```json
{
  "code": "400",
  "status": "Bad Request",
  "message": "Invalid password",
  "result": null
}
```

### token verify

example: http://127.0.0.1:8000/token_verify (GET)

**header should set a filed named `Authorization` with token value, every request should contain token**

valid:

```json
{
    "code": "200",
    "status": "Ok",
    "message": "Token is valid",
    "result": "user1"(user_name)
}
```

access token expired, but valid refresh token:

```json
{
  "code": "401",
  "status": "Failed",
  "message": "Token can be refresh",
  "result": null
}
```

Then request the same url agian but with refresh token and endpoint add `refresh=true`, example: http://127.0.0.1:8000/search_his?query=start_my_own_restaurant&refresh=true

The request would success and meanwhile return refreshed token on header

```json

response header
{
    "access_token": "access_token",
    "refresh_token": "refresh_token"
}
```

if pass the expired access token by accident:

```json
{
  "code": "400",
  "status": "Failed",
  "message": "Please pass the refresh token",
  "result": null
}
```

expired:

```json
{
  "code": "400",
  "status": "Failed",
  "message": "Token is expired",
  "result": null
}
```

error:

```json
{
  "code": "400",
  "status": "Failed",
  "message": "some error",
  "result": null
}
```



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
