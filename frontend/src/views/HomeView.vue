<template>
  <div id="home" class="divide-y divide-gray-200">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand ml-4" href="#">Adaptive Storyfinder</a>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">

          <v-spacer></v-spacer>

            <a class="nav-link" href="#"
              >Home <span class="sr-only">(current)</span></a
            >
          </li>
          <li class="nav-item dropdown">

                <div v-if="isLoggedIn">
                  <b-button v-b-modal.modal-1 @click="$store.dispatch('resetHistory')">Import History</b-button>

                  <b-modal id="modal-1" title="Upload your history!">
                    <div>
                      <button @click="showFileSelect = !showFileSelect" v-if="!fileSelected">
                        Select a file
                      </button>
                    </div>
                    <div v-show="showFileSelect">
                      <FileUploadField
                        :maxSize="1000000"
                        accept="json,csv"
                      /> 
                        <!-- json,pdf,csv,txt -->
                        <!-- @file-upload="(file) => getUploadedFile(file)" -->
                    </div>

                    <div v-if="fileSelected">
                      Successfully Selected file: {{ file.name }}.{{
                        file.fileExtention
                      }}
                    </div>
                  </b-modal>
                </div>
          </li>
        </ul>

        <div class="container">
          <div class="item">
            <form class="form-inline mx-auto" @submit.prevent="handleSearch">
              <input
                class="form-control mr-sm-2 rounded"
                type="search"
                placeholder="Search"
                aria-label="Search"
                v-model.trim="searchQuery"
              />
            </form>
          </div>
          <div class="item">
            <!-- <form class="form-inline"> -->
            <button
              class="btn btn-outline-success my-2 my-sm-0"
              type="submit"
              @click="handleSearch"
            >
              Search
            </button>
            <!-- </form> -->
          </div>
        </div>

        <li class="nav-item active no-bullet-points" v-if="!isLoggedIn">
          <a class="nav-link" @click="login">Log In/ Sign Up</a>
        </li>

        <li class="nav-item active no-bullet-points" v-if="isLoggedIn">
          <a class="nav-link" @click="logout">Log Out</a>
        </li>
      </div>
    </nav>





    <main>

      <div v-if="showSearchResult"
        style="bottom: 0;"
      >
        <b-row align-v="center" align-h="center" class="justify-content-md-center overflow-hidden">
          <b-col></b-col>

          <b-col cols="6">
            <b-card>


              <div class="container-fluid">


        <!--<div class="row display-flex no-gutters">
          <div class="col-xs-6 col-md-2">
            <div class="container"></div>
          </div>

          <div class="col-xs-6 col-md-7 ms-auto"> -->



            <div class="cards" v-if="results.length > 0">
              <ul class="list-group result-list">
                <li
                  class="list-group-item result-list-item border-0"
                  v-for="(itemDict, idx) in results"
                  :key="idx"
                >
                  <v-container>
                  
                    <b-row no-gutters>
                      <b-col md="4">
                        <b-card-img :src="itemDict['thumbnail']" alt="Image" class="rounded-0"></b-card-img>
                      </b-col>


                    
                      <b-col md="8 position-relative"> <!-- https://www.codeply.com/p/TGtv6KDKvD -->
                      <b-card no-body class="mb-3 position-absolute top-0 bottom-0 start-0 end-0">
                        <b-card-header>

                            
                          <div class="tagDiv">
                              <li v-for='(tag, index) in formatTags(itemDict["tags"])' :key="tag + index" class="tagsList">
                                {{ tag.replace("'", "").replace("'", "") }}
                              </li>
                          </div>
                        </b-card-header>
                        
                        
                        <b-card-body class="h-100 d-flex flex-column overflow-auto">
                          <div class="titleDiv">
                            <b-card-title class="wordBreak" title-tag="h5" :href="itemDict['url']">{{itemDict["title"]}}</b-card-title>

                            <span> 
                              <b-button class="rounded px-2" @click="openSummaryModal"> Summary </b-button>

                            </span>

                          </div>

                          <b-card-text class="wordBreak">
                            <p class="three-lines"> {{ itemDict["text"] }} </p> <!-- https://codepen.io/raevilman/pen/OJpQXjg/left -->
                          </b-card-text>
                        </b-card-body>

                        <template #footer>
                          <small class="text-muted">
                            <div style="display: flex; justify-content: space-between;">

                              <div class="authorDiv">
                                <li v-for='(author, index) in formatAuthors(itemDict["authors"])' :key="author + index" class="authorList">
                                  <span class=""> {{ author.replace("'", "").replace("'", "") }} </span>
                                </li>

                                <span class="rightSpan"> {{ formatDate(itemDict["timestamp"]) }} </span>
                              </div>

                            </div>
                          </small>
                        </template>
                        
                      </b-card>
                      </b-col>

                    </b-row>
                  </v-container>

                </li>
              </ul>


              <SummaryModal v-show="showSummaryModal" @close="closeSummaryModal"></SummaryModal>

              <!-- <Card v-for="result in results" :key="result" :result="result" /> -->
            </div>
            

            </div>
            </b-card>
          </b-col>

          <b-col></b-col>
        </b-row>
      </div>







      <div v-if="!showSearchResult"
        style="bottom: 0;"
      >

      
      <b-row align-v="center" align-h="center" class="justify-content-md-center">
          <b-col></b-col>

          <b-col cols="8">
            
            <b-row class="mb-4"></b-row>

            <div class="container-fluid">
            

              
              <ul class="list-group">
                <li
                  class="list-group-item"
                  v-for="(item, index) in tags"
                  :key="index"
                >

                  <v-container style="position:relative">
                    <label for="article-slider"> {{ item["tag"] }} </label>

                    <v-slide-group multiple show-arrows="always" id="article-slider">
                      <v-slide-item 
                        v-for="(itemDict, index) in item['articles']"
                        :key="index">

                      
                      <b-card no-body class="overflow-hidden mb-3 mx-3"
                      >
                        <b-card-header>
                          <b-card-img :src="itemDict['text']" alt="Image" bottom></b-card-img>
                        </b-card-header>
                        <b-card-body class="h-100 d-flex flex-column">
                            <b-card-text>
                            <p> {{ itemDict["text"] }} </p>
                            </b-card-text>
                        </b-card-body>
                      </b-card>

                  
                      </v-slide-item>
                    </v-slide-group>
                  </v-container>


                </li>
              </ul>
        <!--
              <ul class="horizontalList" style="position:relative; overflow-x:auto">
                <li
                  class="horizontalList"
                  v-for="(itemDict, index) in tags"
                  :key="index"
                >
                  <b-card no-body class="overflow-hidden mb-3">
                    Card
                    <b-card-body class="h-100 d-flex flex-column">
                          <b-card-text>
                          <p>{{ itemDict["text"] }}</p>
                          </b-card-text>
                        </b-card-body>
                  </b-card>

                </li>
              </ul>
-->

            </div>
          </b-col>

          <b-col></b-col>
        </b-row>

      </div>
      
    </main>

    <p>{{ loginStatus }}</p>
    <p>{{ msg }}</p>
  </div>
</template>

<script lang="ts">
// Imports
import Vue from "vue";
import { ref } from "vue";
import axios from "axios";
import dayjs from 'dayjs';

import FileUpload from "primevue/fileupload";
import FileUploadField from "@/components/FileUploadField.vue";
import SummaryModal from '@/components/SummaryModal.vue'
//import FileUpload from "primevue/fileupload"
//import Navigation from "@/components/NavigationBar.vue";
//import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

const dropzoneOpen = ref(false);

export default Vue.extend({
  name: "Home",

  components: {
    FileUpload,
    FileUploadField,
    SummaryModal,
  },

  data() {
    return {
      results: [],
      searchQuery: "",
      firstSearch: true,

      dropzoneOpen: false,
      mobileView: false,
      showSearchResult: false,
      show: false,

      fileSelected: false,
      showFileSelect: true,

      msg: [],
      loginStatus: false,
      showSummaryModal: false,

      tags: [
        {
          tag: "Health",
          articles: [
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1111111",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1111111",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1111111",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1111111",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1111111",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1111111",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1111111",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1111111",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1111111",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1111111",
            },
            {
              thumbnail: "https://placekitten.com/480/210",
              text: "222222",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "3333333",
            },
          ],
        },

        {
          tag: "Travel",
          articles: [
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "1",
            },
            {
              thumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
              text: "2",
            },
            {
              thumbnail: "https://placekitten.com/480/210",
              text: "3",
            },
          ],
        },
      ],

    };
  },


  created() {
    this.showSearchResult = false;

    this.getMessage();

    this.handleView();
    window.addEventListener("resize", this.handleView);

    const searchQuery = ref("");
    const results = ref([]);
    //await this.handleView();

    return {
      searchQuery,
      results,
    };
  },

  computed: {
    isLoggedIn: function () {
      this.loginStatus = this.$store.getters.isAuthenticated;
      console.log("status::::")
      console.log(this.$store.getters.isAuthenticated)
      console.log(this.$store.getters.getAccessToken)
      console.log(this.$store.getters.getRefreshToken)
      return this.$store.getters.isAuthenticated;
    },
  },

  beforeMount() {
    // this.fetch()
  },

  methods: {
    async login() {
      this.$router.push("/login");
    },

    async logout() {
      await this.$store.dispatch("logOut");
      this.$router.push("/");
    },

    formatDate(date: any) {
      const dateToFormat = dayjs(date);
      return dateToFormat.format('dddd MMMM D, YYYY');
    },

    formatTags(tags: any) {
      let temp = new Array(tags);
      let tagsArray = JSON.parse(temp[0]).replace("[", "").replace("]", "").split(",");
      return tagsArray
    },

    formatAuthors(authors: any){
      //authors = JSON.parse(authors.replace(/,]$/, ']').replace(/'/g, '"'))
      //authors.replace(/\[|\]/g,'').split(',')
      let temp = new Array(authors);
      let authorsArray = JSON.parse(temp[0]).replace("[", "").replace("]", "").split(",");
      return authorsArray
    },

    openSummaryModal() {
      this.showSummaryModal = true;
    },
    closeSummaryModal() {
      this.showSummaryModal = false;
    },

    getMessage() {
      axios
        .get("/")
        .then((res) => {
          this.msg = res.data["message"];
        })
        .catch((error) => {
          console.error(error);
        });
    },

    async handleSearch() {
      var res = 0;

      // async
      console.log("generating results ...");

      var query = this.searchQuery;
      if (query != null) {
        query = query.split(" ").join("_");
      }

      var endpoint = "/";
      var header = {};
      if(this.isLoggedIn) {
      console.log("user specific")
      var endpoint = endpoint + `search_his?query=${query}`;
      header["Authorization"] = this.$store.getters.getAccessToken;
      console.log(header)

      } else {
      console.log("regular")
      var endpoint = endpoint + `search?query=${query}`;

      }
      console.log(endpoint)

      await axios // await
        .get(endpoint, {
          headers: header,
        })
        .then((response) => {
          res = response.status
          console.log(res)

          if (response.data) {
            // return success
            if (response.status === 200 || response.status === 201) {
              this.getSearchResults(response.data["result"]);
            }
            this.firstSearch = false;
            this.showSearchResult = true;
              
            }
            // reject errors & warnings
        })
        .catch((error) => {
          console.log(error);
        });



      if(this.isLoggedIn && res === 401) {
        console.log("trying to refresh the token")


        header["Authorization"] = this.$store.getters.getRefreshToken;

        await axios
        .get(endpoint, {
          headers: header,
        })
        .then((response) => {
          res = response.status
          console.log(res)

          if (response.data) {
            // return success
            if (response.status === 200 || response.status === 201) {
              this.getSearchResults(response.data["result"]);
            }
            this.firstSearch = false;
            this.showSearchResult = true;
              
            }
            // reject errors & warnings
        })
        .catch((error) => {
          console.log(error);
        });
      }


      if(this.isLoggedIn && res === 400) { // Please pass the refresh token            Token is expired            some error
        this.logout();
      }

      console.log("print this when the request is finished!");
    },


    getSearchResults(data) {
      this.results = [];
      console.log(data)

      var titles = data["title"];
      var urls = data["urls"];
      var thumbnails = data["thumbnail"];
      var authors = data["authors"];
      var timestamps = data["timestamp"];
      var tags = data["tags"];
      var texts = data["text"];

      for (let i = 0; i < titles.length; i++) {
        titles[i] = titles[i]
        urls[i] = urls[i]
        thumbnails[i] = (thumbnails[i] != "https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png") ? thumbnails[i] : "https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png"
        authors[i] = JSON.stringify(authors[i])
        timestamps[i] = timestamps[i]
        tags[i] = JSON.stringify(tags[i])
        texts[i] = texts[i]

        var dict = {
          id: i,
          title: titles[i],
          url: urls[i],
          thumbnail: thumbnails[i],
          authors: authors[i],
          timestamp: timestamps[i],
          tags: tags[i],
          text: texts[i],

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        };

        this.results.push(dict);


        console.log("----------");
        console.log(titles);
        console.log("---");
        console.log(urls);
        console.log("---");
        console.log(authors);
        console.log("----------");
      }
    },

    onUpload() {
      console.log("uploaded");
    },


    handleView() {
      this.mobileView = window.innerWidth <= 990;
    },

    toggleDropzone() {
      this.dropzoneOpen = !dropzoneOpen;
      console.log("dropzone: " + String(this.dropzoneOpen));
    },
  },
});
</script>

<style lang="scss">
@import url("https://use.fontawesome.com/releases/v5.9.0/css/all.css");
* {
  font-size: 1rem;
}

.horizontalList {
    display:inline
}

.three-lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  white-space: normal;
}

body {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  font-family: "Segoe UI", Tahoma;
  background-color: #7ca971;
}
.top-bar {
  display: flex;
  width: 100%;
}
#navigation-icon {
  padding: 10px 10px 20px;
  margin-right: 10px;
  cursor: pointer;
  i {
    font-size: 2rem;
  }
}
.open {
  transform: translateX(300px);
}
.root {
  position: relative;
}
.modal {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.15);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal > div {
  background-color: #fff;
  padding: 50px;
  border-radius: 10px;
}

.resultRow {
  display: flex;
  flex-wrap: wrap;
}

.container {
  display: flex;
}

.item {
  margin-right: 10px;
}

a {
  cursor: pointer;
  margin-right: 60px;
}


.result-list {
}

.result-list-item {
}


.rightSpan {
  text-align: right;
}

.file-drop-area {
  position: relative;
  display: flex;
  align-items: center;
  width: 450px;
  max-width: 100%;
  padding: 25px;
  border: 1px dashed rgba(255, 255, 255, 0.4);
  border-radius: 3px;
  transition: 0.2s;
}

.choose-file-button {
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  padding: 8px 15px;
  margin-right: 10px;
  font-size: 12px;
  text-transform: uppercase;
}

.file-message {
  font-size: small;
  font-weight: 300;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-input {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  cursor: pointer;
  opacity: 0;
}

.vertical-center {
  margin: 0;
  position: absolute;
  top: 11%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  margin-right: 0 !important;
}

.v-slide-group__content {
  justify-content: center;
}

.authorList {
  list-style-type: none;
  list-style-position: inside;
  margin-right: 10px;
}

.authorDiv {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.titleDiv {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.wordBreak {
  word-break:break-word;
}

.cards
{
    display: inline;
}

.tagDiv {
  display: flex;
  width: 100%;
}

.no-bullet-points{ 
  list-style-type: none;
}

.tagsList {
  list-style-type: none;
  background: rgb(186, 81, 81);
  padding: 5px;
  border-radius: 4px;
  color: white;
  white-space: nowrap;
  transition: 0.1s ease background;

  margin-right: 10px;
}




/* Small devices (landscape phones, 544px and up) */
@media (min-width: 544px) {
  h1 {
    font-size: 1.5rem;
  } /*1rem = 16px*/
}

/* Medium devices (tablets, 768px and up) The navbar toggle appears at this breakpoint */
@media (min-width: 768px) {
  h1 {
    font-size: 2rem;
  } /*1rem = 16px*/
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  h1 {
    font-size: 2.5rem;
  } /*1rem = 16px*/
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  h1 {
    font-size: 3rem;
  } /*1rem = 16px*/
}

header {
  padding-top: 50px;
  padding-bottom: 50px;
  h1 {
    color: #888;
    font-size: 1.2rem;
    font-weight: 400;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 30px;
    strong {
      color: #313131;
    }
    &:hover {
      color: #313131;
    }
  }
  .search-box {
    display: flex;
    justify-content: center;
    padding-left: 30px;
    padding-right: 30px;
    .search-field {
      appearance: none;
      background: none;
      border: none;
      outline: none;
      background-color: #f3f3f3;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
      display: block;
      width: 100%;
      max-width: 600px;
      padding: 15px;
      border-radius: 8px;
      color: #313131;
      font-size: 20px;
      transition: 0.4s;
      &::placeholder {
        color: #aaa;
      }
      &:focus,
      &:valid {
        color: #fff;
        background-color: #313131;
        box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.15);
      }
    }
  }
}
</style>
