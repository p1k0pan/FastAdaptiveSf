<template>
  <div id="home" class="divide-y divide-gray-200">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand ml-4 mb-2">Adaptive Storyfinder</a>
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

                  <b-modal id="modal-1" title="Upload your history!" @ok="sendHistory" @close="$store.dispatch('resetHistory')">
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
                  </b-modal>
                </div>


                <div class="p-4" v-if="!isLoggedIn">
                </div>
          </li>

          <li class="nav-item active">
            <form class="search-bar form-inline mx-auto ml-4" @submit.prevent="handleSearch">
              <input
                class="form-control mr-sm-2 rounded"
                type="search"
                placeholder="Search"
                aria-label="Search"
                v-model.trim="searchQuery"
              />
            </form>
            
          </li>

          
          <li class="nav-item active">
            <button
              class="btn btn-outline-success my-2 my-sm-0 ml-2"
              color="indigo-darken-3"
              type="submit"
              @click="handleSearch"
            >
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


      <div 
        style="bottom: 0;"
      >
        <v-row align-v="center" align-h="center" class="justify-content-md-center overflow-hidden">
          <v-col cols="2">

            <div class="cards" v-if="results.length > 0">
              <v-container style="margin-left: -1%; margin-top: -1%;">
                <div class="container-fluid">
                  <h4 style="margin-top: 0%;">All topics </h4>

                  <div style="margin-bottom: 1%;">
                    <b-button style="border-radius: 8px; background-color: #d9dbd5; border: none; margin-right: 2%" @click="unselectAllTags">Unselect All</b-button>
                    <v-divider vertical></v-divider>
                    <b-button style="border-radius: 8px; background-color: #d9dbd5; border: none;" @click="selectAllTags">Select All</b-button>
                  </div>

                  <div v-for="(tag, index) in allTags" class="checkbox_div" :key="tag + index">
                    <label>
                      <input type="checkbox" v-model="selectedTags" :value="tag" @change="splitResults()">
                      <span class="checkbox-material">
                        <span class="check">
                        </span>
                      </span> {{tag}}
                      <span> ({{ tagCounts[tag] }})</span>
                    </label>
                  </div>

                </div>
              </v-container>
            </div>
          </v-col>



          <v-col cols="6">
            <b-card border-variant="light">


            <div class="container-fluid" style="margin-bottom:-1%;">

            <div class="cards" v-if="results.length > 0">
              <ul class="list-group">
                <li
                  class="list-group-item border-0"
                  v-for="(itemDict, idx) in visibleResults"
                  :key="idx"
                >

                <v-container class="bg-surface-variant">
                  <v-row no-gutters>
                    
                    <v-col cols="12">
                        <div class="authorDiv" style="margin-bottom:-1%;" v-if='getAuthorsLength(itemDict["authors"], idx)'>
                          <p style="display:inline" class=""> {{ formatAuthors(itemDict["authors"]) }} </p>

                          <span class="rightSpan"> {{ formatDate(itemDict["timestamp"]) }} </span>
                        </div>
                    </v-col>

                    <v-col cols="12">
                      <a :href="itemDict['url']"  target="_blank">
                        <b-card-img :src="itemDict['thumbnail']" alt="Image" class="rounded-0 resultImg"></b-card-img>
                      </a>
                    </v-col>

                    <v-col cols="12">
                      <div class="titleDiv" style="margin-top:1%;">
                        <a :href="itemDict['url']"  target="_blank" class="linkAsText">
                          <b-card-title class="wordBreak" title-tag="h4"> {{itemDict["title"]}} </b-card-title>
                        </a>

                        <span> 
                          <v-btn
                          class="summarizeButton"
                          style="margin-top:2%;"
                          @click="openSummaryModal"
                          prepend-icon="mdi-tooltip-text"
                              >
                        <template v-slot:prepend>
                              <v-icon color="success"></v-icon>
                                    </template>

                            Summarize
                            </v-btn>
                        </span>
                      </div>
                    </v-col>

                    <v-col cols="12">
                      <b-card-text class="wordBreak overflow-auto" style="margin-top: 0.1%;">
                        <p class="three-lines"> {{ itemDict["text"] }} </p> <!-- https://codepen.io/raevilman/pen/OJpQXjg/left -->
                      </b-card-text>
                    </v-col>
                    
                    <v-col cols="12">
                      <div>
                        <ul class="d-flex flex-wrap" style="margin-left: -3.5%; margin-top: -1.5%;">
                        <li v-for='(tag, index) in itemDict["tags"]' :key="tag + index" class="tag-list-item">
                          <b-button style="border-radius: 8px; background-color: #d9dbd5; border: none;"> {{ tag.replace("'", "").replace("'", "") }} </b-button>
                        </li>
                        </ul>
                      </div>
                    </v-col>

                  </v-row>
                </v-container>

                <div style="margin-top: 0%;" v-if="idx+1 === positive_index">
                  <hr class="dotted">
                  <hr class="dotted">
                </div>
                <div v-if="(idx+1 === positive_index || idx+1 === positive_index + loadingSteps) && loadingIndex < mainResults.length" class="centered"> <!-- v-if="loadMoreButton" -->
                  <b-button @click="loadingIndex += loadingSteps">More ...</b-button>
                </div>

                </li>


              </ul>


              <SummaryModal v-show="showSummaryModal" @close="closeSummaryModal"></SummaryModal>

              <!-- <Card v-for="result in results" :key="result" :result="result" /> -->
            </div>
            

            </div>
            </b-card>
          </v-col>


          
          <v-col cols="4" style="width: 90%;">
            
            <div class="cards" v-if="results.length > 0">
              <v-container style="margin-left: -2%;">
                <div class="container-fluid">
                  <h4 style="margin-top: 0%; margin-left: 0.1%;">Top topics</h4>

                  <div class="tag-container">
                  <ul class="d-flex flex-wrap" style="margin-left: -4%;">
                    <li
                      class="list-group-item border-0"
                      v-for="(tag, idx) in topTags"
                      :key="tag + idx"
                    >
                      <b-button style="border-radius: 8px; background-color: #d9dbd5; border: none;"> {{ tag.replace("'", "").replace("'", "") }} </b-button>
                      
                    </li>
                  </ul>
                  </div>
                </div>
              </v-container>
            </div>

            <v-divider class="border-opacity-20" style="margin-top: 2%;"> </v-divider>

            
            <div class="cards" v-if="results.length > 0">
              <v-container style="margin-left: -1%; margin-top: -1%;">
                <div class="container-fluid">
                  <h6 style="margin-top: 0%;">You might also be interested in ...</h6>
                </div>
              </v-container>
            </div>


            <div class="cards" v-if="results.length > 0">
              <ul class="list-group" style="margin-left: -4%; margin-top: -3%;">
                <li
                  class="list-group-item border-0"
                  v-for="(itemDict, idx) in sideResults"
                  :key="idx"
                >

                <v-container style="margin-left: -2%;">
                  <v-row no-gutters>
                    
                    <v-col cols="12">
                        <div class="authorDiv" style="margin-bottom:-1%;" v-if='getAuthorsLength(itemDict["authors"], idx)'>
                          <p class=""> {{ formatAuthorsForSideView(itemDict["authors"]) }} </p>

                          <span class="rightSpan"> {{ formatDate(itemDict["timestamp"]) }} </span>
                        </div>
                    </v-col>
                    
                    <v-col cols="12">
                      <a :href="itemDict['url']"  target="_blank">
                        <b-card-img :src="itemDict['thumbnail']" alt="Image" class="rounded-0 resultImg" style="width: 100%;"></b-card-img>
                      </a>
                    </v-col>

                    <v-col cols="12">
                      <div class="titleDiv" style="margin-top:1%;">
                        <a :href="itemDict['url']"  target="_blank" class="linkAsText">
                          <b-card-title class="wordBreak" title-tag="h5"> {{itemDict["title"]}} </b-card-title>
                        </a>
                      </div>
                    </v-col>

                    <v-col cols="12">
                      <b-card-text class="wordBreak overflow-auto" >
                        <p class="three-lines"> {{ itemDict["text"] }} </p> <!-- https://codepen.io/raevilman/pen/OJpQXjg/left -->
                      </b-card-text>
                    </v-col>
                    

                  </v-row>
                </v-container>

                </li>
              </ul>
            </div>

          </v-col>
        </v-row>
      </div>





    </main>

    <!-- <p>{{ loginStatus }}</p>
    <p>{{ msg }}</p> -->
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
  name: "SearchTest",

  components: {
    FileUpload,
    FileUploadField,
    SummaryModal,
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
      showSummaryModal: false,

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
      //topics: this.$store.dispatch("loadTags"),

      

        
      allTags: [],
      topTags: [],
      tagCounts: {},
      selectedTags: [],

      positive_index: 0, // side displays 2, 3, 4
      main_split_index: 0, 
      mainResults: [],
      sideResults: [],
      extendedResults: [],
      
      loadMoreButton: true,
      loadingIndex: 0,
      loadingSteps: 5,
      
      

      testSearchData: [
        {
          id: 0,
          title: "Going Down the Restaurant Memory Lane of My Childhood",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: ['Danna Reich Colman', 'Danna Reich Colman', 'Danna Reich Colman'],
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: ['Food', 'Beverly Hills', 'Recipe', 'Recipe', 'Recipe', 'Recipe', 'Recipe', 'Recipe', 'Recipe', 'Recipe', 'Recipe', 'Recipe', 'Recipe', 'Recipe'],
          text: "Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlaboreetdoloremagnaaliquyamerat,seddiamvoluptua.Atveroetaccusametjustoduodoloresetearebum.Stetclitakasdgubergren,noseatakimatasanctusestLoremipsumdolorsitamet.Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlaboreetdoloremagnaaliquyamerat,seddiamvoluptua.Atveroetaccusametjustoduodoloresetearebum.Stetclitakasdgubergren,noseatakimatasanctusestLoremipsumdolorsitam",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 1,
          title: "I ordered chole bhature and received customer experience in return",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg',
          authors: ['Danna Reich Colman'],
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: ['Business', 'Loyalty Program', 'Restaurant Business', 'Rewards Programs', 'Loyalty'],
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 2,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: ['Danna Reich Colman'],
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: ['Food', 'Beverly Hills', 'Recipe'],
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },



        {
          id: 3,
          title: "Going Down the Restaurant Memory Lane of My Childhood",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: ['Danna Reich Colman'],
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: ['Food', 'Beverly Hills', 'Recipe'],
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 4,
          title: "I ordered chole bhature and received customer experience in return",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: ['Danna Reich Colman'],
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: ['Business', 'Loyalty Program', 'Restaurant Business', 'Rewards Programs', 'Loyalty'],
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 5,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: ['Danna Reich Colman'],
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: ['Food', 'Beverly Hills', 'Recipe'],
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 6,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: ['Danna Reich Colman'],
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: ['Food', 'Beverly Hills', 'Recipe'],
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 7,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: ['Danna Reich Colman'],
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: ['Food', 'Beverly Hills', 'Recipe'],
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 8,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: ['Danna Reich Colman'],
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: ['Food', 'Beverly Hills', 'Recipe'],
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 9,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: ['Danna Reich Colman'],
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: ['Food', 'Beverly Hills', 'Recipe'],
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        
      ],
      authorsLength: {},

    };
  },

































  beforeCreate() {
    //this.$store.dispatch("loadTags");
  },

  created() {
    this.showSearchResult = false;
    //this.$store.dispatch("loadTags");

    this.getMessage();

    this.handleView();
    window.addEventListener("resize", this.handleView);

    const searchQuery = ref("");
    const results = ref([]);
    //await this.handleView();



    //////////////////////////////////////////
        
        this.positive_index = 2,
        this.results = this.testSearchData


        this.loadingIndex = this.positive_index

        var mainResults = this.results.slice(0, this.positive_index)
        this.main_split_index = this.positive_index + mainResults.length
        var extendedResults = this.results.slice(this.main_split_index, this.results.length)

        this.extendedResults = extendedResults
        this.sideResults = this.results.slice(this.positive_index, this.positive_index + mainResults.length)
        this.mainResults = mainResults.concat(extendedResults);

        var topTags = []
        var tagCounts = {};
        for (let i = 0; i < this.results.length; i++) {
          var articleTags = this.results[i]["tags"]

          for (let j = 0; j < articleTags.length; j++) {
            var tag = articleTags[j];
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }

        // sort tags in popularity order
        var sortedTags = Object.keys(tagCounts).sort(function(a, b) {
          return tagCounts[b] - tagCounts[a];
        });

        var amountOfTopTags = 8
        for (let i = 0; i < Math.min(sortedTags.length, amountOfTopTags); i++) {
          topTags.push(sortedTags[i]);
        }

        this.allTags = sortedTags
        this.topTags = topTags
        this.tagCounts = tagCounts
        this.selectedTags = [...this.allTags];

    //////////////////////////////////////////

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

    visibleResults: function (): any[] {
      return this.mainResults.slice(0, this.loadingIndex)
    },
  },

  mounted() {
    this.showSearchResult = false
    this.showTopics = true
    this.showHistories = false
  },

  beforeMount() {
    // this.fetch()
  },

  watch: {
      extendedResults(newExtendedResults) {
        if (this.loadingIndex < newExtendedResults.length) {
          this.loadMoreButton = true;
        } else {
          this.loadMoreButton = false;
        }
      },


      privacyDialog (val) {
        val || this.closePrivacyDialog()
      },

      loginStatus (val) {
        if(this.loginStatus){
          this.getAllHistories()
        }
      },
    },



  methods: {
    async login() {
      this.$router.push("/login");
    },

    async logout() {
      await this.$store.dispatch("logOut");
      // this.$router.push("/");
    },


    
    formatDate(date: any) {
      const dateToFormat = dayjs(date);
      return dateToFormat.format('dddd MMMM D, YYYY');
    },
    
    formatTags(tags: any) {
      //let temp = new Array(tags);
      //let tagsArray = JSON.parse(temp[0]).replace("[", "").replace("]", "").split(",");

      var temp = tags.replace(/'/g, '"');
      const tagsArray = JSON.parse(temp);
      return tagsArray
    },

    getAuthorsLength(authors: any, idx: any) {
      this.authorsLength[idx] = Object.keys(authors).length

      return true
    },

    backToHome(){
      console.log("back to home")
      this.searchQuery = ""
      this.showSearchResult = false

      this.showTopics = true
      this.showHistories = false
    },

    openHistoryTab(){
      console.log("history management")
      this.searchQuery = ""
      this.showSearchResult = false

      this.showTopics = false
      this.showHistories = true
    },

    closePrivacyDialog(){
        this.privacyDialog = false
    },


    splitResults() {
      //const isChecked = this.selectedTags.includes(tag);
      var selectedResults = this.results.slice();

      selectedResults = selectedResults.filter(itemDict => {
        const tags = itemDict["tags"];
        return this.selectedTags.some(tag => tags.includes(tag));
      });
      console.log(this.selectedTags)
      


      var mainResults = selectedResults.slice(0, this.positive_index)
      this.main_split_index = this.positive_index + mainResults.length
      var extendedResults = selectedResults.slice(this.main_split_index, selectedResults.length)

      this.extendedResults = extendedResults
      this.sideResults = selectedResults.slice(this.positive_index, this.positive_index + mainResults.length)
      this.mainResults = mainResults.concat(extendedResults);

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



    formatAuthors(authors: any){
      //authors = JSON.parse(authors.replace(/,]$/, ']').replace(/'/g, '"'))
      //authors.replace(/\[|\]/g,'').split(',')

      //let temp = new Array(authors);
      //let authorsArray = JSON.parse(temp[0]).replace("[", "").replace("]", "").split(",");

      //var temp = authors.replace(/'/g, '"');
      //const authorsArray= JSON.parse(temp);
      
      var authorsString = authors.join(", ").replace("'", "").replace("'", "");

      if (authorsString.endsWith(',')) {
        authorsString = authorsString.slice(0, -1);
      }
      return authorsString
    },

    formatAuthorsForSideView(authors: any){
      var authorsString = authors.join(", ").replace("'", "").replace("'", "");

      if (authorsString.endsWith(',')) {
        authorsString = authorsString.slice(0, -1);
      }

      var commaCount = authorsString.split(",").length - 1;
      let firstAuthor;
      if (commaCount > 0){
      firstAuthor = authorsString.split(", ")[0] + " et al.";
      } else {
      firstAuthor = authorsString;
      }

      return firstAuthor
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


    selectAllTags() {
      this.selectedTags = [...this.allTags];
      this.splitResults();
    },
    unselectAllTags() {
      this.selectedTags = [];
      this.splitResults();
    },



    async handleSearch() {
      var res = "0"

      // async
      console.log("generating results ...");

      var query = this.searchQuery;
      if (query != null) {
        query = query.split(" ").join("_");
      }

      var endpoint = "/";
      if(this.isLoggedIn) {
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
              'Access-Control-Allow-Credentials':true,
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



      if(res === "401" && this.isLoggedIn) {
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


    if(this.isLoggedIn) {
      if(res === "402") {
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



      if (typeof this.results !== 'undefined' && this.results.length > 0) {

        this.loadingIndex = this.positive_index

        var mainResults = this.results.slice(0, this.positive_index)
        this.main_split_index = this.positive_index + mainResults.length
        var extendedResults = this.results.slice(this.main_split_index, this.results.length)

        this.extendedResults = extendedResults
        this.sideResults = this.results.slice(this.positive_index, this.positive_index + mainResults.length)
        this.mainResults = mainResults.concat(extendedResults);

        var topTags = []
        var tagCounts = {};
        for (let i = 0; i < this.results.length; i++) {
          var articleTags = this.results[i]["tags"]

          for (let j = 0; j < articleTags.length; j++) {
            var tag = articleTags[j];
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }

        // sort tags in popularity order
        var sortedTags = Object.keys(tagCounts).sort(function(a, b) {
          return tagCounts[b] - tagCounts[a];
        });

        var amountOfTopTags = 8
        for (let i = 0; i < Math.min(sortedTags.length, amountOfTopTags); i++) {
          topTags.push(sortedTags[i]);
        }

        this.allTags = sortedTags
        this.topTags = topTags
        this.tagCounts = tagCounts
        this.selectedTags = [...this.allTags];

      }
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
      this.positive_index = positive_index

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

      if(this.$store.getters.historyStatusCode === "402") {
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



      if(this.$store.getters.isHistoryValid) {
        //this.fileSelected = true;
        //this.showFileSelect = false;
      }
      
      //this.$emit("file-upload", this.file);
      //this.$refs.form.reset(); RESET FORM TODO



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


.titleOverflow {
  overflow-y: auto;
}

.resultContainer {
  max-width: 100%;
  height: auto;
  width: auto\9; /* ie8 */
}

.resultImg {
  max-width: 100%;
  width: 100%;
  height: 60%;
  object-fit: cover;
}

h3 {
  display: block
}

.newline {
  clear: both;
}
.horizontalList {
    display:inline
}

a.linkAsText {
    text-decoration: none;
    color: black !important; /* Change the color here */
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
  background-color: #f7f7f7;
}

.topicDiv{
  width: 200px;  
  height: 150px;  
}


.summarizeButton {
  margin-top: -6px
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

.no-border{
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
.modal > div {
  background-color: #fff;
  padding: 50px;
  border-radius: 10px;
}

hr.dashed {
  border-top: 3px dashed #bbb;
}
hr.dotted {
  border-top: 3px dotted #bbb;
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
 display:inline-block
  }

.list-group-item{
  margin-right: 1%;
  margin-top: 1%;
}

.tag-list-item{
  padding-top: 1%;
  display: inline; 
  padding-right: 1%;
}
  
.item {
  margin-right: 10px;
}

a {
  cursor: pointer;
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
  //list-style-type: none;
  //list-style-position: inside;
  //margin-right: 20px;
  //white-space: nowrap;
}

.authorUL {
  display: flex;
  list-style-type: none;
  list-style-position: inside;
  margin-right: 20px;
  margin-left: -20px;
}


.side-results{
  width: 80%;
}

.nav-item{
  
}

.authorDiv {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.one-line {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  white-space: normal;
}

.titleDiv {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.wordBreak {
  word-break:break-word;
}

.overflowY {
  overflow-y: scroll;
  width: 100%;
  height: 100px;
  overflow-y: scroll;
}

.cards
{
    display: inline;
}

.tagDiv {
  display: flex;
}

.tag-container{
  max-height: 17vh;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
}

.tag-container::-webkit-scrollbar {
  background: rgba(0, 0, 0, 0.1);
}
.tag-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
}
.tag-container::-webkit-scrollbar-track {
  background-color: transparent;
}
.tag-container {
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
  -moz-appearance: none; /* Hide the scrollbar track in Firefox */
}


.no-bullet-points{ 
  list-style-type: none;
}

.tagsList {
  display: inline;

  list-style-type: none;
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
