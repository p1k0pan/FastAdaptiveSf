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
            <a class="nav-link" href="#"
              >Home <span class="sr-only">(current)</span></a
            >
          </li>
          <li class="nav-item dropdown">
            <b-nav-item-dropdown right>
              <!-- Using 'button-content' slot -->
              <template #button-content> Import History </template>
              <!-- <b-dropdown-item href="#" disabled>
                <FileUpload
                  mode="basic"
                  name="model[]"
                  accept=".json"
                  :max-file-size="5000000000"
                  :auto="true"
                  :custom-upload="true"
                  choose-label="Upload file"
                  @uploader="onUpload"
                />
              </b-dropdown-item> -->

              <b-dropdown-item href="#" @click="toggleDropzone">
                <div>
                  <b-button v-b-modal.modal-1>Dropzone</b-button>

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
                        @file-upload="(file) => getUploadedFile(file)"
                      /> <!-- json,pdf,csv,txt -->
                    </div>

                    <div v-if="fileSelected">
                      Successfully Selected file: {{ file.name }}.{{
                        file.fileExtention
                      }}
                    </div>
                  </b-modal>
                </div>
              </b-dropdown-item>
            </b-nav-item-dropdown>
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

        <li class="nav-item active">
          <a class="nav-link" @click="logout">Log Out</a>
        </li>
      </div>
    </nav>

    <main>
      <div class="container-fluid" v-if="!isLoggedIn" id="logout">
        <div class="row display-flex no-gutters">
          <div class="col-xs-6 col-md-2">
            <div class="container"></div>
          </div>

          <div class="col-xs-6 col-md-7 ms-auto">
            <div class="cards" v-if="results.length > 0">
              <ul class="list-group">
                <li
                  class="list-group-item"
                  v-for="(itemDict, index) in results"
                  :key="index"
                >
                  <!--
                  <div class="card text-bg-white mb-3" style="max-width: 700px">
                    <div class="row g-0">
                      <div class="col-md-4">
                        <img
                          :src="exampleThumbnail"
                          class="img-fluid rounded-start"
                          alt="..."
                        />
                      </div>

                      <div class="col-md-8">
                        <div class="card-header">{{ itemDict["tags"] }}</div>
                        <div class="card-body">
                          <h5 class="card-title">{{ itemDict["title"] }}</h5>
                          <p class="card-text">{{ itemDict["summary"] }}</p>
                          <p class="card-text">
                            <small class="text-body-secondary">
                              {{ itemDict["authors"] }}</small
                            >
                            <small class="text-body-secondary">
                              {{ itemDict["timestamp"] }}</small
                            >
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  -->

                  <b-card no-body class="overflow-hidden mb-3" img-src="https://placekitten.com/300/300" img-alt="Card image" img-left>
                    <b-row no-gutters>
                        <b-card-header>
                          <div class="tag-input">
                            <ul class="tags">
                              <li v-for='(tag, index) in formatTags(itemDict["tags"])' :key="tag + index" class="tag">
                                {{ tag.replace("'", "").replace("'", "") }}
                              </li>
                            </ul>
                          </div>
                        </b-card-header>
                        <b-card-body class="h-100 d-flex flex-column">
                          <b-card-title title-tag="h5" :href="itemDict['url']">{{itemDict["title"]}}</b-card-title>
                          <b-card-text>
                          <p>{{ itemDict["summary"] }}</p>
                          </b-card-text>
                        </b-card-body>
                        
                        
                        <b-card-text class="small text-muted">
                            <div style="display: flex; justify-content: space-between;">
                              <li v-for='(author, index) in formatAuthors(itemDict["authors"])' :key="author + index" class="author">
                                {{ author.replace("'", "").replace("'", "") }}
                              </li>
                              <p> {{ formatDate(itemDict["timestamp"]) }} </p>
                            </div>
                        </b-card-text>

                        <b-card-footer>
                        </b-card-footer>
                    </b-row>
                  </b-card>

                </li>
              </ul>
              <!-- <Card v-for="result in results" :key="result" :result="result" /> -->
            </div>

            <div class="col-xs-6 col-md-7 ms-auto" v-else>
              <h3>Sorry, no results found for {{ searchQuery }} ...</h3>
            </div>
          </div>

          <div class="col-xs-6 col-md-3">Recommendations</div>
        </div>
      </div>

      <div class="container-fluid" v-else>
        <LoginForm />
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
import LoginForm from "@/components/LoginForm.vue";
//import FileUpload from "primevue/fileupload"
//import Navigation from "@/components/NavigationBar.vue";
//import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

const dropzoneOpen = ref(false);

export default Vue.extend({
  name: "Home",

  components: {
    FileUpload,
    FileUploadField,
    LoginForm,
  },

  data() {
    return {
      results: [],
      searchQuery: "",
      firstSearch: true,
      exampleThumbnail:
        "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",

      dropzoneOpen: false,
      mobileView: false,

      fileSelected: false,
      showFileSelect: true,

      msg: [],
      loginStatus: false,
    };
  },

  created() {
    // async --> API ERROR WITH AXIOS
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
      return this.$store.getters.isAuthenticated;
    },
  },

  beforeMount() {
    // this.fetch()
  },

  methods: {
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
      console.log(tagsArray )
      for (let i = 0; i < tagsArray.length; i++) {
        console.log(tagsArray [i])
      }
      return tagsArray
    },

    formatAuthors(authors: any){
      //authors = JSON.parse(authors.replace(/,]$/, ']').replace(/'/g, '"'))
      //authors.replace(/\[|\]/g,'').split(',')
      let temp = new Array(authors);
      let authorsArray = JSON.parse(temp[0]).replace("[", "").replace("]", "").split(",");
      console.log(authorsArray)
      for (let i = 0; i < authorsArray.length; i++) {
        console.log(authorsArray[i])
      }
      return authorsArray
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
      // async
      console.log("generating results ...");

      var query = this.searchQuery;
      if (query != null) {
        query = query.split(" ").join("_");
      }

      // ------------------
      var endpoint = "/" + `search_his?query=${query}`; // `http://127.0.0.1:8000/search_his?query=${query}`;
      //endpoint = `https://api.adviceslip.com/advice/search/${query}` // placeholder
      // ------------------

      await axios // await
        .get(endpoint, {
          headers: {
            //'Access-Control-Allow-Origin': '*', // NOT WORKING
            //'Content-type': 'application/json', // NOT WORKING
            // Authorization: 'Bearer ' + token //the token is a variable which holds the token
          },
        })
        .then((response) => {
          if (response.data) {
            // return success
            if (response.status === 200 || response.status === 201) {
              //this.results = response.data;

              this.results = [];
              const result: any[] = [];

              var titles = response.data["title"];
              var urls = response.data["urls"];
              var authors = response.data["authors"];
              var timestamps = response.data["timestamp"];
              var tags = response.data["tags"];
              // var texts = response.data["text"];

              for (let i = 0; i < titles.length; i++) {
                titles[i] = JSON.stringify(titles[i])
                urls[i] = JSON.stringify(urls[i])
                authors[i] = JSON.stringify(authors[i])
                timestamps[i] = JSON.stringify(timestamps[i])
                tags[i] = JSON.stringify(tags[i])
                // texts[i] = JSON.parse(text[i])

                var dict = {
                  id: i,
                  title: titles[i],
                  url: urls[i],
                  authors: authors[i],
                  timestamp: timestamps[i],
                  tags: tags[i],
                  //"texts": texts[0],
                  summary: 
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                };

                result.push(dict);
              }
              this.results = result;
              this.firstSearch = false;

              console.log("----------");
              console.log(titles);
              console.log("---");
              console.log(urls);
              console.log("---");
              console.log(authors);
              console.log("---");
              console.log(timestamps);
              console.log("---");
              console.log(tags);
              //console.log("---")
              //console.log(texts)
              console.log("----------");
              
              
            }
            // reject errors & warnings
          }
        })
        .catch((error) => {
          console.log(error);
        });

      console.log("print this when the request is finished!");
      console.log(this.results.length);
      console.log(this.results === undefined || this.results.length == 0);
      console.log("---");
      console.log(this.results);
      console.log("----------");
    },

    onUpload() {
      console.log("uploaded");
    },

    async getUploadedFile(file: any) {
      console.log("received uploaded file from component")
      this.fileSelected = true;
      this.showFileSelect = false;

      var file = file;
      var history = Array();
      history = file.urls;
      console.log("history")
      console.log(history)

      //const formData = new FormData();
      const data = JSON.stringify({
        user_name: "user1",
        upload_urls: history
      })
      const endpoint = "/" + `user`;
      const headers = { 
        // "Content-Type": "multipart/form-data",
        // Authorization: 'Bearer ' + token //the token is a variable which holds the token
      };

      await axios
        .post(endpoint, data, { headers })
        .then((response) => {
          if (response.data) {
            // return success
            if (response.status === 200 || response.status === 201) {
              // do something
              console.log("history uploaded successfully!")
            }
            // reject errors & warnings
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },



    fetch() {
      this.$store.dispatch("websocketChangeFunctionality", "all vaccinations");
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

.container {
  display: flex;
}

.item {
  margin-right: 10px;
}

a {
  cursor: pointer;
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

.cards
{
    display: inline;
}

.tag-input {
  position: relative;
}

ul{
  top: 0;
  bottom: 0;
  left: 10px;
  list-style: none;
  list-style-position: outside;
  display: flex;
  gap: 6px;
  max-width: 100%;
}


.tag {
  background: rgb(250, 104, 104);
  padding: 5px;
  border-radius: 4px;
  color: white;
  white-space: nowrap;
  transition: 0.1s ease background;
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
