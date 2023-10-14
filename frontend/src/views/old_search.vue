<!-- THIS IS AN OLD PAGE: It exists just to display an old search result UI (is not in use in the activte system) and is NOT cleaned up to the usual standard -->
<template>
  <div id="home" class="divide-y divide-gray-200">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand ml-4 mb-2">Adaptive Storyfinder</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">


          <v-spacer></v-spacer>

          <li class="nav-item active">
            <router-link class="nav-link" to="/" @click.native="backToHome">Home</router-link>
          </li>

          <li class="nav-item active">
            <router-link class="nav-link" to="/" @click.native="openHistoryTab">Histories</router-link>
          </li>

          <li class="nav-item">

            <div v-if="isLoggedIn">
              <b-button v-b-modal.modal-1 @click="$store.dispatch('resetHistory')" variant="outline-primary" class="mb-2">
                Upload History <b-icon icon="file-earmark-arrow-up" aria-hidden="true"></b-icon>
              </b-button>

              <b-modal id="modal-1" title="Upload your history!" @ok="sendHistory"
                @close="$store.dispatch('resetHistory')">
                <div>
                  <button @click="showFileSelect = !showFileSelect" v-if="!fileSelected">
                    Select a file
                  </button>
                </div>
                <div v-show="showFileSelect">
                  <FileUploadField :maxSize="1000000" accept="json,csv" />
                </div>
              </b-modal>
            </div>


            <div class="p-4" v-if="!isLoggedIn">
            </div>
          </li>

          <li class="nav-item active">
            <form class="search-bar form-inline mx-auto ml-4" @submit.prevent="handleSearch">
              <input class="form-control mr-sm-2 rounded" type="search" placeholder="Search" aria-label="Search"
                v-model.trim="searchQuery" />
            </form>

          </li>


          <li class="nav-item active">
            <button class="btn btn-outline-success my-2 my-sm-0 ml-2" color="indigo-darken-3" type="submit"
              @click="handleSearch">
              Search
            </button>
          </li>

        </ul>

        <li class="nav-item no-bullet-points">
          <v-container v-if="isLoggedIn">
            <span> {{ this.$store.getters.stateUser }} </span>
          </v-container>
        </li>

        <li class="nav-item active no-bullet-points" v-if="!isLoggedIn">
          <a class="nav-link" @click="login">Log In/ Sign Up</a>
        </li>

        <li class="nav-item active no-bullet-points" v-if="isLoggedIn">
          <a class="nav-link" @click="logout">Log Out</a>
        </li>
      </div>
    </nav>





    <main>

      <div style="bottom: 0;">
        <b-row align-v="center" align-h="center" class="justify-content-md-center overflow-hidden">
          <b-col></b-col>

          <b-col cols="6">
            <b-card>


              <div class="container-fluid">


                <div class="cards" v-if="testSearchData.length > 0">
                  <ul class="list-group result-list">
                    <li class="list-group-item result-list-item border-0" v-for="(itemDict, idx) in testSearchData"
                      :key="idx">
                      <v-container>

                        <b-row no-gutters>
                          <b-col md="4">
                            <a :href="itemDict['url']" target="_blank">
                              <b-card-img :src="itemDict['thumbnail']" alt="Image"
                                class="rounded-0 resultImg"></b-card-img>
                            </a>
                          </b-col>



                          <b-col md="8 position-relative"> <!-- https://www.codeply.com/p/TGtv6KDKvD -->
                            <b-card no-body class="mb-3 position-absolute top-0 bottom-0 start-0 end-0">
                              <b-card-header>


                                <div class="tagDiv overflow-auto">
                    <li v-for='(tag, index) in formatTags(itemDict["tags"])' :key="tag + index" class="tagsList">
                      {{ tag.replace("'", "").replace("'", "") }}
                    </li>
                </div>
                </b-card-header>


                <b-card-body class="h-100 d-flex flex-column">
                  <div class="titleDiv">

                    <a :href="itemDict['url']" target="_blank" class="linkAsText">
                      <b-card-title class="wordBreak" title-tag="h5"> {{ itemDict["title"] }} </b-card-title>
                    </a>

                  </div>

                  <b-card-text class="wordBreak overflow-auto">
                    <p class="three-lines"> {{ itemDict["text"] }} </p>
                    <!-- https://codepen.io/raevilman/pen/OJpQXjg/left -->
                  </b-card-text>
                </b-card-body>

                <template #footer>
                  <small class="text-muted">
                    <div style="display: flex; justify-content: space-between;">

                      <div class="authorDiv">
                        <li v-for='(author, index) in formatAuthors(itemDict["authors"])' :key="author + index"
                          class="authorList">
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

      </div>


  </div>
  </b-card>
  </b-col>

  <b-col></b-col>
  </b-row>
  </div>

  </main>
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

const dropzoneOpen = ref(false);

export default Vue.extend({
  name: "Old_search",

  components: {
    FileUpload,
    FileUploadField,
  },

  data() {
    return {
      loginStatus: this.$store.getters.isAuthenticated,

      results: [],
      searchQuery: "",
      firstSearch: true,

      dropzoneOpen: false,
      mobileView: false,
      showSearchResult: false,
      showHistories: false,
      showTopics: true,

      fileSelected: false,
      showFileSelect: true,

      msg: [],

      privacyDialog: false,
      searchHistory: '',
      loadingHistoryTable: false,
      expandedHistory: [],
      historyTableHeaders: [
        {
          text: 'Date',
          align: 'left',
          value: 'date',
        },
        { text: 'Upload', value: 'upload' },
      ],

      allHistories: [
      ],


      positive_index: 2,
      testSearchData: [
        {
          id: 0,
          title: "Going Down the Restaurant Memory Lane of My Childhood",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: "['Danna Reich Colman']",
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: "['Food', 'Beverly Hills', 'Recipe']",
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 1,
          title: "I ordered chole bhature and received customer experience in return",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: "['Danna Reich Colman']",
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: "['Business', 'Loyalty Program', 'Restaurant Business', 'Rewards Programs', 'Loyalty']",
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 2,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: "['Danna Reich Colman']",
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: "['Food', 'Beverly Hills', 'Recipe']",
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },



        {
          id: 3,
          title: "Going Down the Restaurant Memory Lane of My Childhood",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: "['Danna Reich Colman']",
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: "['Food', 'Beverly Hills', 'Recipe']",
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 4,
          title: "I ordered chole bhature and received customer experience in return",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: "['Danna Reich Colman']",
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: "['Business', 'Loyalty Program', 'Restaurant Business', 'Rewards Programs', 'Loyalty']",
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 5,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: "['Danna Reich Colman']",
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: "['Food', 'Beverly Hills', 'Recipe']",
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },

      ],
    };
  },





  beforeCreate() {
    // nothing
  },

  created() {
    this.showSearchResult = false;
    this.getMessage();

    this.handleView();
    window.addEventListener("resize", this.handleView);

    const searchQuery = ref("");
    const results = ref([]);

    return {
      searchQuery,
      results,
    };
  },

  computed: {
    isLoggedIn: function () {
      this.loginStatus = this.$store.getters.isAuthenticated;

      console.log("user status:")
      console.log(this.$store.getters.isAuthenticated)
      console.log(this.$store.getters.getAccessToken)
      console.log(this.$store.getters.getRefreshToken)
      return this.$store.getters.isAuthenticated;
    },

    tagsLoaded: function () {
      return this.$store.getters.tagsLoaded
    },
  },

  mounted() {
    this.showSearchResult = false
    this.showTopics = true
    this.showHistories = false
  },

  beforeMount() {
    // nothing
  },

  watch: {
    privacyDialog(val) {
      val || this.closePrivacyDialog()
    },

    loginStatus(val) {
      if (this.loginStatus) {
        this.getAllHistories()
      }
    }
  },



  methods: {
    async login() {
      this.$router.push("/login");
    },

    async logout() {
      await this.$store.dispatch("logOut");
    },

    formatDate(date: any) {
      const dateToFormat = dayjs(date);
      return dateToFormat.format('dddd MMMM D, YYYY');
    },

    formatTags(tags: any) {
      var temp = tags.replace(/'/g, '"');
      const tagsArray = JSON.parse(temp);
      return tagsArray
    },

    backToHome() {
      console.log("back to home")
      this.searchQuery = ""
      this.showSearchResult = false

      this.showTopics = true
      this.showHistories = false
    },

    openHistoryTab() {
      console.log("history management")
      this.searchQuery = ""
      this.showSearchResult = false

      this.showTopics = false
      this.showHistories = true
    },

    closePrivacyDialog() {
      this.privacyDialog = false
    },


    async getAllHistories() {
      console.log("GET ALL HISTORIES")
      const data = {
        username: this.$store.getters.stateUser,
        access_token: this.$store.getters.getAccessToken,
        refresh_token: this.$store.getters.getRefreshToken,
      }

      this.loadingHistoryTable = true

      try {
        await this.$store.dispatch("allHistories", data);

        this.allHistories = [
          {
            date: '14.09.2023',
            upload: "History 1",
            urls: ["https://www.libertyprim.com/en/lexique-familles/103/apple-lexique-des-fruits.htm", "https://www.healthline.com/nutrition/10-health-benefits-of-apples"],
          },
          {
            date: '18.09.2023',
            upload: "History 2",
            urls: [],
          },
        ]
        this.loadingHistoryTable = false

      } catch (error) {
        console.log(error)
        this.loadingHistoryTable = false
      }
    },



    formatAuthors(authors: any) {,
      var temp = authors.replace(/'/g, '"');
      const authorsArray = JSON.parse(temp);
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
      var res = "0"

      console.log("generating results ...");

      var query = this.searchQuery;
      if (query != null) {
        query = query.split(" ").join("_");
      }

      var endpoint = "/";
      if (this.isLoggedIn) {
        console.log("user specific")
        var endpoint = endpoint + `search_his?query=${query}`;

        await axios
          .get(endpoint,
            {
              headers: { 'Authorization': this.$store.getters.getAccessToken, "Access-Control-Allow-Origin": "*" },
            })
          .then((response) => {
            console.log("adwad")
            res = response.data["code"]
            console.log("res:")
            console.log(res)

            if (response.data) {
              // return success
              if (response.data["code"] === "200" || response.data["code"] === "201") {
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


      } else {
        console.log("regular")
        var endpoint = endpoint + `search?query=${query}`; // axiosConfig

        await axios
          .get(endpoint,
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
                'Access-Control-Allow-Credentials': true,
              },
              // withCredentials: true,
            })
          .then((response) => {
            res = response.data["code"]
            console.log("res:")
            console.log(res)

            if (response.data) {
              // return success
              if (response.data["code"] === "200" || response.data["code"] === "201") {
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



      if (res === "401" && this.isLoggedIn) {
        console.log("trying to use refresh the token ...")

        await axios
          .get(endpoint,
            {
              headers: { 'Authorization': this.$store.getters.getRefreshToken, "Access-Control-Allow-Origin": "*" },
            })
          .then((response) => {
            res = response.data["code"]
            console.log(res)

            if (response.data) {
              // return success
              if (response.data["code"] === "200" || response.data["code"] === "201") {
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


      if (this.isLoggedIn) {
        if (res === "402") {
          console.log("forcefully logging out")
          this.logout

        } else {
          var res = "0"
          const authorizationData = {
            username: this.$store.getters.stateUser,
            access_token: null,
            refresh_token: null,
          }

          console.log("verify tokens")
          console.log(this.$store.getters.getRefreshToken)

          const endpoint = "/" + `token_verify?refresh=true`;
          console.log(endpoint)

          await axios
            .get(endpoint, {
              headers: { 'Authorization': this.$store.getters.getRefreshToken, "Access-Control-Allow-Origin": "*" },
            })
            .then((response) => {
              res = response.data["code"]
              console.log("res:")
              console.log(res)

              if (response.data) {
                // return success
                if (response.data["code"] === "200" || response.data["code"] === "201") {
                  authorizationData["access_token"] = response.data["result"]["access_token"];
                  authorizationData["refresh_token"] = response.data["result"]["refresh_token"];

                  this.$store.dispatch("refreshTokens", authorizationData);
                }

              }
              // reject errors & warnings
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
      console.log("print this when the request is finished!");
    },


    getSearchResults(data) {
      this.results = [];
      console.log("search results:")
      console.log(data)

      var titles = data["title"];
      var urls = data["urls"];
      var thumbnails = data["thumbnail"];
      var authors = data["authors"];
      var timestamps = data["timestamp"];
      var tags = data["topic2"];
      var texts = data["text"];

      var indices = data["index"];
      var positive_index = data["positive_index"];

      //var img = new Image();
      var resizedImageURL = 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png';


      for (let i = 0; i < titles.length; i++) {
        titles[i] = titles[i]
        urls[i] = urls[i]
        thumbnails[i] = (thumbnails[i] != "https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png") ? thumbnails[i] : resizedImageURL
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
      }
    },






    async sendHistory() {
      console.log("send history to server ...")

      const data = {
        username: this.$store.getters.stateUser,
        access_token: this.$store.getters.getAccessToken,
        refresh_token: this.$store.getters.getRefreshToken,
      }

      if (!this.$store.getters.stateHistory) return;
      await this.$store.dispatch("patchHistory", data);
      console.log("history status code")
      console.log(this.$store.getters.historyStatusCode)

      if (this.$store.getters.historyStatusCode === "402") {
        this.logout

      } else {
        // Update history management list
        await this.$store.dispatch("allHistories", data);

        var res = "0"
        const authorizationData = {
          username: this.$store.getters.stateUser,
          access_token: null,
          refresh_token: null,
        }

        console.log("verify tokens")
        console.log(this.$store.getters.getRefreshToken)

        const endpoint = "/" + `token_verify?refresh=true`;
        console.log(endpoint)

        await axios
          .get(endpoint, {
            headers: { 'Authorization': this.$store.getters.getRefreshToken, "Access-Control-Allow-Origin": "*" },
          })
          .then((response) => {
            res = response.data["code"]
            console.log("res:")
            console.log(res)

            if (response.data) {
              // return success
              if (response.data["code"] === "200" || response.data["code"] === "201") {
                authorizationData["access_token"] = response.data["result"]["access_token"];
                authorizationData["refresh_token"] = response.data["result"]["refresh_token"];

                this.$store.dispatch("refreshTokens", authorizationData);
              }

            }
            // reject errors & warnings
          })
          .catch((error) => {
            console.log(error);
          });
      }



      if (this.$store.getters.isHistoryValid) {
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

img {
  width: 90%;
  height: 60%;
  object-fit: cover;
}

.thumbnail {
  width: 300px;
  height: 200px;

}

.titleOverflow {
  overflow-y: auto;
}

.resultImg {
  width: 270px;
  height: 270px;
  object-fit: cover;
}

h3 {
  display: block
}

.newline {
  clear: both;
}

.horizontalList {
  display: inline
}

a.linkAsText {
  text-decoration: none;
  color: black !important;
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

.topicDiv {
  width: 200px;
  height: 150px;
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

.no-border {
  border: none;
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

.modal>div {
  background-color: #fff;
  padding: 50px;
  border-radius: 10px;
}

.topicLink {
  color: black;
  text-decoration: none;
}

.resultRow {
  display: flex;
  flex-wrap: wrap;
}

.container {
  display: flex;
}

.search-bar {
  list-style-type: none;
  width: 1000px;
  float: left;
  margin-right: 10px;
  display: inline-block
}

.item {
  margin-right: 10px;
}

a {
  cursor: pointer;
  margin-right: 60px;
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
  word-break: break-word;
}

.overflowY {
  overflow-y: scroll;
  width: 100%;
  height: 100px;
  overflow-y: scroll;
}

.cards {
  display: inline;
}

.tagDiv {
  display: flex;
  width: 100%;
}

.no-bullet-points {
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



@media (min-width: 544px) {
  h1 {
    font-size: 1.5rem;
  }
}

@media (min-width: 768px) {
  h1 {
    font-size: 2rem;
  }
}

@media (min-width: 992px) {
  h1 {
    font-size: 2.5rem;
  }
}

@media (min-width: 1200px) {
  h1 {
    font-size: 3rem;
  }
}

</style>