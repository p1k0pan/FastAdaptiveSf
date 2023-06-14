# FastAdaptiveSf

FastAPI Adaptive Storyfinder

Please download the model and dataset from https://huggingface.co/spaces/AdaptiveStoryfinder/medium_query_topk/tree/main
and put it on root.

## start

run `uvicorn main:app --reload`

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
  ]
}
```
