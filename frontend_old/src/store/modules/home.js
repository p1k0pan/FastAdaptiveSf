// Setup Function
import { defineStore } from "pinia";
//import wikihowapi_pk as wha;
//import wikihowunofficialapi as wha

//import { ref, computed } from 'vue' // reactive,

export const useHomeStore = defineStore({
  id: 'home',
  state: () => ({
    results: [],
    post: null,
    loading: false,
    error: null
  }),
  
  getters: {
    getPostsPerAuthor: (state) => {
      return (authorId) => state.results.filter((post) => post.userId === authorId)
    }
  }, 

  actions: {
    async fetchSearchResults(query) {
      // do async/promise stuff
      this.post = null
      this.loading = true
      this.results = []

      query = "how_to_cook_noodles"
      try {
        this.results = await fetch(
          "http://127.0.0.1:8000/test/search?query=" + String(query),
          {
          mode: "no-cors", // no-cors, *cors, same-origin
          }
        ) 
        console.log("H12321413H")
        console.log(this.results)
        
        //fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
        .then((response) => response.json())
        //.then(data => this.results = data)
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
      console.log("HEHHHEHEH")
      console.log(this.results)

      /*
      const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
      return response.json(); // parses JSON response into native JavaScript objects
      */






    //how_tos: list = wha.search_wikihow_link("housing bubble")
    //return JsonResponse({"results": how_tos})
      var someValue = []
      this.results = someValue

      if(query == "test"){
        someValue = [
          {thumbnail:'http://www.snut.fr/wp-content/uploads/2015/08/image-de-paysage.jpg', title:'An item', views: '17.093', date:'09.05.2023',},
          {thumbnail:'http://www.snut.fr/wp-content/uploads/2015/08/image-de-paysage.jpg', title:'A second item', views: '17.093', date:'09.05.2023',},
          {thumbnail:'http://www.snut.fr/wp-content/uploads/2015/08/image-de-paysage.jpg', title:'A third item', views: '17.093', date:'09.05.2023',},
          {thumbnail:'http://www.snut.fr/wp-content/uploads/2015/08/image-de-paysage.jpg', title:'A fourth item', views: '17.093', date:'09.05.2023',},
        ]
      } else {
        someValue = [
          {thumbnail:'http://www.snut.fr/wp-content/uploads/2015/08/image-de-paysage.jpg', title:'An item', views: '17.093', date:'09.05.2023',},
        ]
      }
    this.results = someValue
    //this.results = how_tos
    },

    /*async fetchPosts() {
      this.posts = []
      this.loading = true
      try {
        this.posts = await fetch('https://jsonplaceholder.typicode.com/posts')
        .then((response) => response.json()) 
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
    async fetchPost(id) {
      this.post = null
      this.loading = true
      try {
        this.post = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
        .then((response) => response.json())
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    }*/
  }
})