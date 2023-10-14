<!-- Home page which contains the topic recommendations in its default state. Conditionally, it displays the search results, the history management section or opens a modal for uploading a user history -->
<template>
  <div>
    <div class="container-fluid" id="top-div" style="text-align: center;">

      <v-row align-v="center" class="text-align: center; overflow-hidden nav-text align-center"
        style="padding-top: 0.2vh; padding-bottom: 0.2vh;">

        <v-col cols="3">
          <a class="navbar-brand" @click="backToHome" style="font-weight: bold; color: black; font-size: 22px;">Adaptive
            Storyfinder</a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
        </v-col>

        <v-col cols="1">
          <div class="nav-item active" style="margin-left: -10%">
            <b-button variant="outline-primary" @click="openHistoryTab" :disabled="!isLoggedIn" class=""
              style="padding: 1%;">
              <div style="text-align: center; padding-top: 9%; padding-bottom: 9%;">
                <b-icon icon="file-earmark-ruled" aria-hidden="true"></b-icon>
                <span style="font-size: 16px;">My histories</span>
              </div>
            </b-button>
          </div>
        </v-col>

        <v-col cols="1">
          <div class="nav-item active">
            <div>

              <b-button v-b-modal.modal-1 @click="resetHistory" variant="outline-primary" :disabled="!isLoggedIn" class=""
                style="padding: 1%;">
                <div style="text-align: center;">
                  Upload History
                  <b-icon style="display: block; margin: 0 auto;" icon="file-earmark-arrow-up"
                    aria-hidden="true"></b-icon>
                </div>
              </b-button>

              <b-modal ref="historyModal" style="overflow-y: auto;" id="modal-1" title="Upload your browser history!"
                @ok="sendHistory" ok-title="Confirm"
                :ok-disabled="!((uploadHistoryTab === 1 && isHistoryTextValid) || (uploadHistoryTab === 2 && isUploadedHistoryFileValid))"
                @close="resetHistory">

                <template #modal-title>
                  <div>
                    <a href="https://chrome.google.com/webstore/category/extensions?utm_source=ext_app_menu"
                      target="_blank">
                      <b-icon icon="info-circle" id="info-icon" v-b-tooltip.hover.top="tooltipContentPlugin"></b-icon>
                    </a>
                    Upload your browser history!
                  </div>
                </template>

                <div v-if="uploadHistoryTab === 1" style="margin-bottom: 2%; margin-top: -1%;">
                  Enter relevant website URLs that you have visited or that represent your preferences in the text box
                  below and click on Confirm.
                </div>

                <div v-if="uploadHistoryTab === 2" style="margin-bottom: 2%; margin-top: -1%;">
                  Upload a .json or a .csv file containing relevant URLs of the websites you visited and click on Confirm.
                </div>

                <div style="height: 100%;" v-if="!uploadModalLoading">
                  <b-tabs content-class="mt-3" fill>
                    <b-tab title="Text" active @click="changeUploadTab('Text')" class="text-tab" style="height: 100%;">
                      <b-form-textarea id="textarea" v-model="historyUserInput" @input="validateUserHistoryInput"
                        :placeholder="multiLinePlaceholder" rows="10" max-rows="10"></b-form-textarea>
                    </b-tab>

                    <b-tab title="File" @click="changeUploadTab('File')" class="file-tab" style="height: 100%;">
                      <div>
                        <button v-if="!fileSelected">
                          Select a file!
                        </button>
                      </div>
                      <div v-show="showFileSelect">
                        <FileUploadField :maxSize="1000000" accept="json, csv" @isFileValid="checkUploadedFile" />
                      </div>
                    </b-tab>
                  </b-tabs>

                  <div v-if="uploadHistoryTab === 1" style="margin-bottom: 9.8%;">
                  </div>

                  <div v-if="uploadHistoryTab === 2">
                    <div class="border-top my-3"></div>

                    <div v-if="uploadHistoryTab === 2" style="margin-bottom: 2%; margin-top: -1%;">
                      <p> Please make sure that the file uses this format: </p>
                      <pre style="white-space: pre-line; text-align: left; font-size: 12px; margin-bottom: -6%;">
                            [
                              &nbsp;&nbsp; {
                                &nbsp;&nbsp;&nbsp;&nbsp; "url": "https://www.google.com",
                              &nbsp;&nbsp; },
                              &nbsp;&nbsp; {
                                &nbsp;&nbsp;&nbsp;&nbsp; "url": "https://www.github.com",
                              &nbsp;&nbsp; },
                              &nbsp;&nbsp; {
                                &nbsp;&nbsp; ...
                              &nbsp;&nbsp; },
                            ]
                          </pre>
                    </div>
                  </div>

                  <div style="height: 100%; margin-top: 1%; color: red;" class="centered"
                    v-if="!uploadModalLoading && historyUploadStatus === -1">
                    <v-divider></v-divider>
                    Could not upload the history!
                  </div>
                </div>

                <div style="height: 100%;" v-if="uploadModalLoading">
                  <div class="loading-container"
                    style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="margin-bottom: 1%;">
                      Uploading history
                    </div>
                    <div class="loader" style="display: block; text-align: center;"></div>
                  </div>
                </div>

              </b-modal>

            </div>
          </div>
        </v-col>

        <v-col cols="4" style="width: 100%;">
          <div class="nav-item active" style="width: 100%;">
            <form class="search-bar form-inline mx-auto ml-4" style="min-width: 100%; max-width: 100%;"
              @submit.prevent="handleSearch">
              <b-form-input class="form-control mr-sm-2 rounded" v-model="searchQuery" placeholder="Search ..."
                aria-label="Search"></b-form-input>

            </form>
          </div>
        </v-col>

        <v-col cols="1">
          <div class="nav-item active" style="margin-left: -10%;">
            <b-button variant="outline-primary" class="btn btn-outline-success my-2 my-sm-0 ml-2" color="indigo-darken-3"
              type="submit" @click="handleSearch">
              Search
            </b-button>
          </div>
        </v-col>

        <v-col cols="1">
          <div class="nav-item active">

            <div v-if="isLoggedIn">
              {{ this.$store.getters.stateUser }}
            </div>

            <div v-if="!isLoggedIn">
              <b-button variant="outline-primary" @click="login" class="" style="padding: 1%;">
                <div style="text-align: center; padding-top: 9%; padding-bottom: 9%;">
                  <b-icon icon="box-arrow-in-right" aria-hidden="true"
                    style="padding-right: 4%; padding-top: 2%; padding-left: 1%;"></b-icon>
                  <span style="font-size: 16px;">Log In</span>
                </div>
              </b-button>
            </div>

            <div v-if="isLoggedIn">
              <b-button variant="outline-primary" @click="logout" class="" style="padding: 1%;">
                <div style="text-align: center; padding-top: 9%; padding-bottom: 9%;">
                  <b-icon icon="box-arrow-in-left" aria-hidden="true"
                    style="padding-right: 1%; padding-top: 2%; padding-left: 4%;"></b-icon>
                  <span style="font-size: 16px;">Log Out</span>
                </div>
              </b-button>
            </div>

          </div>
        </v-col>

      </v-row>
    </div>





    <main style="margin-top: 1vh;">

      
      <!-- Use this homepage to show search results -->
      <div v-if="showSearchResult" style="bottom: 0;">

        <!-- Load search results -->
        <v-row align-v="center" align-h="center" class="justify-content-md-center overflow-hidden"
          v-if="searchStatus === 0">

          <v-col cols="2"></v-col>

          <v-col cols="6">
            <b-card border-variant="light">
              <div class="container-fluid" style="margin-bottom:-1%;">
                <div class="cards">
                  <ul class="list-group">
                    <li class="list-group-item border-0" v-for="idx in 6" :key="idx">
                      <v-container class="bg-surface-variant" style="height: 60vh;">
                        <content-placeholder style="width: 100%; height: 100%;"></content-placeholder>
                      </v-container>
                    </li>
                  </ul>
                </div>
              </div>
            </b-card>
          </v-col>

          <v-col cols="4" style="width: 90%;">
            <div class="cards">
              <v-container style="margin-left: -2%; width: 100%; height: 5%;">
                <div class="placeholder-div" style="width: 50%; height: 50%;">
                </div>
              </v-container>
            </div>

            <v-divider class="border-opacity-20" style="margin-top: 2%;"> </v-divider>

            <div class="cards"></div>
          </v-col>

        </v-row>


        <!-- No results found -->
        <v-row align-v="center" align-h="center" class="justify-content-md-center overflow-hidden"
          v-if="searchStatus === -1" style="margin-top: 3%;">

          <div class="centered">
            Could not find any related articles ...
          </div>

        </v-row>


        <!-- Display the search results section (if a user searched for a query) -->
        <v-row align-v="center" align-h="center" class="justify-content-md-center overflow-hidden"
          v-if="searchStatus === 1">

          <!-- Sort after topic section -->
          <v-col cols="2">
            <div class="cards" v-if="results.length > 0">
              <v-container style="margin-left: -1%; margin-top: -1%;">
                <div class="container-fluid">

                  <h4 style="margin-top: 0%;" class="text-shadowed">All topics </h4>

                  <div style="margin-bottom: 1%;">
                    <b-button
                      style="border-radius: 4px; background-color: rgb(184, 199, 235); border: none; margin-right: 2%"
                      @click="unselectAllTags">Unselect All</b-button>
                    <v-divider vertical></v-divider>
                    <b-button style="border-radius: 4px; background-color: rgb(184, 199, 235); border: none;"
                      @click="selectAllTags">Select All</b-button>
                  </div>

                  <div v-for="(tag, index) in allTags" class="checkbox_div" :key="tag + index">
                    <label>
                      <input type="checkbox" v-model="selectedTags" :value="tag" @change="splitResults()"
                        class="custom-checkbox">
                      <span class="checkbox-material">
                        <span class="check">
                        </span>
                      </span> {{ displayTag(tag) }}
                      <span> ({{ tagCounts[tag] }})</span>
                    </label>
                  </div>

                </div>
              </v-container>
            </div>
          </v-col>

          <!-- Main results (in the middle) -->
          <v-col cols="6">
            <b-card border-variant="light">
              <div class="container-fluid" style="margin-bottom:-1%;">
                <div class="cards" v-if="results.length > 0">
                  <ul class="list-group">
                    <li class="list-group-item border-0" v-for="(itemDict, idx) in visibleResults" :key="idx">

                      <v-container class="bg-surface-variant">
                        <v-row no-gutters>

                          <v-col cols="12">
                            <div class="authorDiv" style="margin-bottom:-1%;"
                              v-if='getAuthorsLength(itemDict["authors"], idx)'>
                              <p style="display:inline" class=""> <i class="fas fa-user"></i> {{
                                formatAuthors(itemDict["authors"]) }} </p>

                              <span class="rightSpan"> <i class="far fa-clock"></i> {{ formatDate(itemDict["timestamp"])
                              }} </span>
                            </div>
                          </v-col>

                          <v-col cols="12">
                            <a :href="itemDict['url']" target="_blank">
                              <b-card-img :src="itemDict['thumbnail']" alt="Image"
                                class="rounded-0 resultImg"></b-card-img>
                            </a>
                          </v-col>

                          <v-col cols="12">
                            <div class="titleDiv" style="margin-top:1%;">
                              <a :href="itemDict['url']" target="_blank" class="linkAsText">
                                <b-card-title class="wordBreak" title-tag="h4"> {{ itemDict["title"] }} </b-card-title>
                              </a>
                              <span>
                                <!-- Nothing (we thought about adding a summary feature here, but the realization was not sufficiently possible)-->
                              </span>
                            </div>
                          </v-col>

                          <v-col cols="12">
                            <b-card-text class="wordBreak overflow-auto" style="margin-top: 0.1%;">
                              <p class="three-lines"> {{ itemDict["text"] }} </p>
                            </b-card-text>
                          </v-col>

                          <v-col cols="12">
                            <div>
                              <ul class="d-flex flex-wrap" style="margin-left: -3.5%; margin-top: -1.5%;">
                                <li v-for='(tag, index) in itemDict["tags"]' :key="tag + index" class="tag-list-item">
                                  <b-button class="btn-primary"
                                    style="border-radius: 8px; background-color: #F2F2F2; border: none;"> {{
                                      displayTag(tag) }} </b-button>
                                </li>
                              </ul>
                            </div>
                          </v-col>

                        </v-row>
                      </v-container>

                      <div style="margin-top: 0%;" v-if="idx + 1 === positive_index">
                        <hr class="dotted">
                        <hr class="dotted">
                      </div>

                      <div v-if="(idx + 1 === positive_index) && (!showExtendedResults)" class="centered">
                        <b-button @click="handleLoadMoreButton"
                          style="background-color: rgb(184, 199, 235); border-radius: 4px;">Load more of the less relevant
                          results</b-button>
                      </div>

                    </li>
                  </ul>
                </div>
              </div>
            </b-card>
          </v-col>

          <!-- Sidebar results -->
          <v-col cols="4" style="width: 90%;">

            <div class="cards" v-if="results.length > 0">
              <v-container style="margin-left: -2%;">
                <div class="container-fluid">
                  <h4 style="margin-top: 0%; margin-left: 0.1%;" class="text-shadowed">Top topics</h4>
                  <div class="tag-container">
                    <ul class="d-flex flex-wrap" style="margin-left: -4%;">
                      <li class="list-group-item border-0" v-for="(tag, idx) in topTags" :key="tag + idx">
                        <b-button class="btn-primary"
                          style="border-radius: 8px; background-color: #F2F2F2; border: none;"> {{ displayTag(tag) }}
                        </b-button>
                      </li>
                    </ul>
                  </div>
                </div>
              </v-container>
            </div>

            <v-divider class="border-opacity-20" style="margin-top: 1%;"> </v-divider>

            <div class="cards" v-if="results.length > 0">
              <v-container style="margin-left: -1%; margin-top: -1%;">
                <div class="container-fluid">
                  <h6 style="margin-top: 0%;" v-if="sideResults.length > 0">You might also be interested in ...</h6>
                </div>
              </v-container>
            </div>

            <div class="cards" v-if="results.length > 0">
              <ul class="list-group" style="margin-left: -4%; margin-top: -3%;">
                <li class="list-group-item border-0" v-for="(itemDict, idx) in sideResults" :key="idx">
                  <v-container style="margin-left: -2%;">
                    <v-row no-gutters>

                      <v-col cols="12">
                        <div class="authorDiv" style="margin-bottom:-1%;"
                          v-if='getAuthorsLength(itemDict["authors"], idx)'>
                          <p class="" style="font-family: Arial, Helvetica, sans-serif;"> <i class="far fa-clock"></i> {{
                            formatAuthorsForSideView(itemDict["authors"]) }} </p>

                          <span class="rightSpan"> <i class="far fa-clock"></i> {{ formatDate(itemDict["timestamp"]) }}
                          </span>
                        </div>
                      </v-col>

                      <v-col cols="12">
                        <a :href="itemDict['url']" target="_blank">
                          <b-card-img :src="itemDict['thumbnail']" alt="Image" class="rounded-0 resultImg"
                            style="width: 100%;"></b-card-img>
                        </a>
                      </v-col>

                      <v-col cols="12">
                        <div class="titleDiv" style="margin-top:1%;">
                          <a :href="itemDict['url']" target="_blank" class="linkAsText">
                            <b-card-title class="wordBreak" title-tag="h5"> {{ itemDict["title"] }} </b-card-title>
                          </a>
                        </div>
                      </v-col>

                      <v-col cols="12">
                        <b-card-text class="wordBreak overflow-auto">
                          <p class="three-lines"> {{ itemDict["text"] }} </p>
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





      <!-- Display something else than the search results -->
      <div v-if="!showSearchResult" style="bottom: 0;">



        <!-- Use this homepage to display the topic recommendation section (default) -->
        <div v-if="showTopics && !showHistories" style="bottom: 0;">
          <b-row align-v="center" align-h="center" class="justify-content-md-center">

            <b-col></b-col>

            <b-col cols="9">
              <b-row class="mb-4 mt-4"></b-row>

              <div class="container-fluid">

                <div v-if="this.$store.getters.tagsLoadingStatus === 0" class="centered">
                  <div class="loading-container"
                    style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="margin-bottom: 2%;">
                      Loading topics
                    </div>
                    <div class="loader" style="display: block; text-align: center;"></div>
                  </div>
                </div>

                <ul class="list-group"
                  v-if="this.$store.getters.stateBothTags.length > 0 && this.$store.getters.tagsLoadingStatus === 1">
                  <li class="list-group-item no-border mb-1" v-for="(item, index) in this.$store.getters.stateBothTags"
                    :key="index">

                    <h3 class="text-shadowed"> {{ displayTag(item["tag"]) }} </h3>
                    <b-row class="mb-4"></b-row>

                    <v-container style="position:relative">

                      <v-slide-group show-arrows="never" id="article-slider" v-if="item['sites'].length < 3"
                        style="margin-left: 4%;">
                        <v-slide-item v-for="(sites, index) in item['sites']" :key="index">


                          <b-card class="mr-6">
                            <div class="thumbnail">
                              <a :href="sites['url']" target="_blank" class="linkAsText">
                                <img :src="sites['thumbnail']" alt="..." style="width:100%">
                                <div class="wordBreak overflowY">
                                  <h5 class="mt-2" style="word-wrap: break-word;white-space: normal;"> {{ sites["title"]
                                  }} </h5>


                                </div>
                              </a>
                            </div>
                          </b-card>
                        </v-slide-item>
                      </v-slide-group>

                      <!--https://codepen.io/kasia123/pen/xxEmgmG-->
                      <v-carousel v-if="item['sites'].length > 2" height="300" hide-delimiters progress="primary"
                        show-arrows="hover">
                        <template v-for="(sites, index) in item['sites']">
                          <v-carousel-item v-if="(index + 1) % columns_per_slide === 1 || columns_per_slide === 1"
                            :key="index" style="">
                            <v-row class="flex-nowrap" style="height: 100%; margin-left: 3.2%; width: 90%;">
                              <template v-for="(n, i) in columns_per_slide">
                                <template>

                                  <v-col :key="i">
                                    <b-card class="" v-if="(+index + i) < item['sites'].length" style="height: 100%;">
                                      <div class="thumbnail">
                                        <a :href="item['sites'][+index + i]['url']" target="_blank" class="linkAsText">
                                          <img :src="item['sites'][+index + i]['thumbnail']" alt="..." style="width:100%">
                                          <div class="wordBreak overflowY">
                                            <h5 class="mt-2" style="word-wrap: break-word;white-space: normal;"> {{
                                              item['sites'][+index + i]["title"] }} </h5>


                                          </div>
                                        </a>
                                      </div>
                                    </b-card>
                                  </v-col>

                                </template>
                              </template>
                            </v-row>
                          </v-carousel-item>
                        </template>
                      </v-carousel>
                    </v-container>
                  </li>
                </ul>

                <div v-if="this.$store.getters.tagsLoadingStatus === -1" class="centered">
                  Could not load a selection of related topics!
                </div>

              </div>
            </b-col>

            <b-col></b-col>

          </b-row>
        </div>



        <!-- Use this homepage to display the history management section -->
        <div v-if="showHistories && !showTopics" style="bottom: 0;">
          <v-card>

            <v-card-title>
              <v-text-field v-model="searchHistory" label="Search" single-line hide-details></v-text-field>
            </v-card-title>

            <v-responsive class="overflow-y-auto">
              <v-data-table :headers="historyTableHeaders" :items="allHistories" :expanded.sync="expandedHistory"
                :loading="loadingHistoryTable" show-expand single-expand item-key="upload_number"
                :hide-default-footer="true" :search="searchHistory">

                <template v-slot:top>

                  <v-dialog v-model="deleteHistoryDialog" max-width="600px">
                    <v-card>
                      <v-card-title class="text-h5">Are you sure you want to fully remove this history<br> upload and all
                        of its URLs?</v-card-title>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green-darken-1" variant="text" @click="abortDeletion">
                          No
                        </v-btn>
                        <v-btn color="green-darken-1" @click="deleteHistoryUpload">
                          Yes, remove this history upload!
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-icon v-if='item.upload_number !== "..." && rowIsExpanded(item)' small color="red"
                    @click.stop="prepareToDelete(item)">
                    mdi-delete
                  </v-icon>
                </template>

                <template v-slot:expanded-item="{ headers, item: upload }">
                  <td :colspan="headers.length" v-if='upload.upload_number !== "..."'>
                    <div class="row sp-details" style="margin-top: 0.2%; margin-bottom: -2%;">
                      <v-card class="mx-auto">
                        <v-data-table :headers="URLTableHeaders" :items="upload.sites"
                          :sort-by="[{ key: 'index', order: 'asc' }]" class="">

                          <template v-slot:top>

                          </template>
                          <template v-slot:item.actions="{ item: item }">
                            <v-icon v-if='item.upload_number !== "..."' small color="red"
                              @click.stop="deleteHistoryURL(upload, item)">
                              mdi-delete
                            </v-icon>
                          </template>

                        </v-data-table>
                      </v-card>
                    </div>
                  </td>

                  <td :colspan="headers.length" v-else>
                    Upload more histories for a more comprehensive experience!
                  </td>
                </template>

              </v-data-table>
            </v-responsive>

          </v-card>
        </div>

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
import ContentPlaceholder from '@/components/ContentPlaceholder.vue'

export default Vue.extend({
  name: "Home",

  components: {
    FileUpload,
    FileUploadField,
    ContentPlaceholder,
  },

  data() {
    return {
      // display mock data
      not_connected: false,


      // variables regarding the home page in general
      loginStatus: this.$store.getters.isAuthenticated,
      mobileView: false,


      // variables for the topic recommendation section
      showTopics: true,


      // variables for displaying the search results
      searchQuery: "",
      results: [],

      showSearchResult: false,
      searchStatus: 0,
      authorsLength: {},

      positive_index: 0,
      main_split_index: 0,
      mainResults: [],
      sideResults: [],
      extendedResults: [],

      allTags: [],
      topTags: [],
      tagCounts: {},
      selectedTags: [],

      loadMoreButton: true,
      loadingIndex: 0,
      loadingSteps: 5,
      showExtendedResults: false,


      // variables for uploading a user history/ prefered websites
      uploadHistoryTab: 1,
      historyUploadStatus: 1,
      showHistories: false,

      isUploadedHistoryFileValid: false,
      fileSelected: false,
      showFileSelect: true,
      historyUserInput: "",
      validUrls: [],
      isHistoryTextValid: false,

      uploadModalLoading: false,
      multiLinePlaceholder: "URL1\nURL2\nURL3,\nURL4 URL5,\nURL6\n...",
      tooltipContentPlugin: `
        Alternatively, you can download our Chrome extension to automatically upload your browsing history!

        Click on the icon.
      `,


      // variables for the history management
      allHistories: [],
      expandedHistory: [],
      searchHistory: '',

      loadingHistoryTable: false,
      itemToDelete: null,
      deleteUrlDialog: false,
      deleteHistoryDialog: false,
      historyTableHeaders: [
        {
          text: 'Date',
          align: 'left',
          value: 'date',
        },
        { text: 'Upload Number', value: 'upload_number' },
        { text: 'Delete', value: 'actions', sortable: false, align: 'right', },
      ],
      URLTableHeaders: [
        {
          text: 'Number',
          align: 'left',
          value: 'index',
        },
        { text: 'Title', value: 'title' },
        { text: 'URL', value: 'url' },
        { text: 'Delete', value: 'actions', sortable: false, align: 'right', },
      ],


      // Mock data to simulate some search results & the history management when the not_connected variable is true
      testSearchData: [
        {
          id: 0,
          title: "Going Down the Restaurant Memory Lane of My Childhood",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: `"['Danna Reich Colman', 'Danna Reich Colman', 'Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['TECH', 'BUSINESS']"`,
          text: "Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlaboreetdoloremagnaaliquyamerat,seddiamvoluptua.Atveroetaccusametjustoduodoloresetearebum.Stetclitakasdgubergren,noseatakimatasanctusestLoremipsumdolorsitamet.Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlaboreetdoloremagnaaliquyamerat,seddiamvoluptua.Atveroetaccusametjustoduodoloresetearebum.Stetclitakasdgubergren,noseatakimatasanctusestLoremipsumdolorsitam",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 1,
          title: "I ordered chole bhature and received customer experience in return",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg',
          authors: `"['Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['TECH']"`,
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 2,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: `"['Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['TECH', 'BUSINESS']"`,
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 3,
          title: "Going Down the Restaurant Memory Lane of My Childhood",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: `"['Danna Reich Colman', 'Danna Reich Colman', 'Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 4,
          title: "I ordered chole bhature and received customer experience in return",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: `"['Danna Reich Colman', 'Danna Reich Colman', 'Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['Business', 'Loyalty Program', 'Restaurant Business', 'Rewards Programs', 'Loyalty']"`,
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 5,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: `"['Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 6,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: `"['Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 7,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: `"['Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 8,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: `"['Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 9,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: `"['Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
          id: 10,
          title: "Is Your Loyalty Program Rewarding the Right Customers?",
          url: "https://medium.com/p/c00c8cca394a",
          thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
          authors: `"['Danna Reich Colman']"`,
          timestamp: "2016-06-30 06:54:17.528000+00:00",
          tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
          text: "text1",

          summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
      ],

      testHistoryData: [
        {
          date: '14.09.2023',
          upload_number: 1,
          sites: [
            {
              index: 0,
              title: "Medizin-Nobelpreis für Wegbereiter der Covid-19-Impfung",
              url: "https://www.libertyprim.com/en/lexique-familles/103/apple-lexique-des-fruits.htm",
              content: "\nAn apple is a sweet, edible fruit produced by an apple tree (Malus domestic). In France, it is the most consumed edible fruit and the third in the planet. The main types of apples come from the domestic apple or common apple. The species of Malus Domestica has about 20,000 varieties and cultivars around the world. The fruit has a characteristic stocky shape and often spherical, it is eaten when ripe, raw, cooked, or dried. Its juice is drunk fresh or pasteurized. When fermented, it becomes cider. Associated with the fruit forbidden in the Book of Genesis, it often symbolizes original sin. The fruit we consume today is descended from the Malus Sieversii species; it has been consumed by humans since the Neolithic age in the Central. Kazakhstan claims its origin, but the apple was already consumed by the Chinese 3,000 years ago. From a botanical point of view, it is a complex fruit, something between the berry and the drupe, often called a false fruit. Because a real fruit is formed from the ovary of a flower. An apple's flesh is not derived from the ovary but instead it is a swollen receptacle (or part of the stem). The actual fruit is in the core, the bit we throw away. The same is true of pears. Its colors at maturity change from green to red, passing through a wide variety of intermediate shades: pale green, yellow, or orange. The success of this fruit is undisputed, because today there are more than 20,000 varieties of apples of which 7,000 are regularly cultivated across the globe. China, the United States and Poland are the three largest producers of apples. China harvests 44 million tons, the United States 4.6 million tons and Poland 3.6 million tons. The EU is also one of the leading producers, has increased its production by 33% on average for the past three years. France harvests 1.5 million tons."
            },
            {
              index: 1,
              title: "Taktische Züge 1",
              url: "https://www.spiegel.de/politik/deutschland/news-des-tages-eu-aussenminister-in-kiew-aerztestreik-nobelpreis-fuer-medizin-a-1494d6e8-689c-48df-9d26-be635b06061a",
              content: ""
            },
          ]
        },
        {
          date: '18.09.2023',
          upload_number: 2,
          sites: [
            {
              index: 0,
              title: "Medizin-Nobelpreis für Wegbereiter der Covid-19-Impfung",
              url: "https://www.welt.de/wissenschaft/article247774502/Medizin-Nobelpreis-fuer-Grundlagenforschung-zu-Covid-19-Impfung.html",
              content: "\nAn apple is a sweet, edible fruit produced by an apple tree (Malus domestic). In France, it is the most consumed edible fruit and the third in the planet. The main types of apples come from the domestic apple or common apple. The species of Malus Domestica has about 20,000 varieties and cultivars around the world. The fruit has a characteristic stocky shape and often spherical, it is eaten when ripe, raw, cooked, or dried. Its juice is drunk fresh or pasteurized. When fermented, it becomes cider. Associated with the fruit forbidden in the Book of Genesis, it often symbolizes original sin. The fruit we consume today is descended from the Malus Sieversii species; it has been consumed by humans since the Neolithic age in the Central. Kazakhstan claims its origin, but the apple was already consumed by the Chinese 3,000 years ago. From a botanical point of view, it is a complex fruit, something between the berry and the drupe, often called a false fruit. Because a real fruit is formed from the ovary of a flower. An apple's flesh is not derived from the ovary but instead it is a swollen receptacle (or part of the stem). The actual fruit is in the core, the bit we throw away. The same is true of pears. Its colors at maturity change from green to red, passing through a wide variety of intermediate shades: pale green, yellow, or orange. The success of this fruit is undisputed, because today there are more than 20,000 varieties of apples of which 7,000 are regularly cultivated across the globe. China, the United States and Poland are the three largest producers of apples. China harvests 44 million tons, the United States 4.6 million tons and Poland 3.6 million tons. The EU is also one of the leading producers, has increased its production by 33% on average for the past three years. France harvests 1.5 million tons."
            },
            {
              index: 1,
              title: "Taktische Züge 2",
              url: "https://www.spiegel.de/politik/deutschland/news-des-tages-eu-aussenminister-in-kiew-aerztestreik-nobelpreis-fuer-medizin-a-1494d6e8-689c-48df-9d26-be635b06061a",
              content: ""
            },
          ]
        },
        {
          date: '',
          upload_number: '...',
          sites: [
          ]
        },
      ],

    };
  },



  beforeCreate() {
    // nothing
  },

  created() {
    this.showSearchResult = false;

    this.handleView();

    window.addEventListener("resize", this.handleView);

    const searchQuery = ref("");
    const results = ref([]);

    return {
      searchQuery,
      results,
    };
  },


  beforeMount() {
    // nothing
  },

  mounted() {
    this.showSearchResult = false
    this.showTopics = true
    this.showHistories = false
  },


  computed: {

    // Is a user currently logged in?
    isLoggedIn: function () {
      this.loginStatus = this.$store.getters.isAuthenticated;

      console.log("user status:")
      console.log(this.$store.getters.isAuthenticated)
      console.log(this.$store.getters.getAccessToken)
      console.log(this.$store.getters.getRefreshToken)
      return this.$store.getters.isAuthenticated;
    },

    // Calculate the columns per slide page of the topic recommendation carousel
    columns_per_slide() {
      if (this.$vuetify.breakpoint.xl) {
        return 4;
      }

      if (this.$vuetify.breakpoint.lg) {
        return 3;
      }

      if (this.$vuetify.breakpoint.md) {
        return 2;
      }

      return 1;
    },

    // Are the topics already fetched from the Backend? 
    tagsLoadingStatus: function () {
      return this.$store.getters.tagsLoadingStatus
    },

    // Split all of the visible search results into a relevant section and less important one by an index. The less relevant ones need to be displayed by clicking on a Loading button
    visibleResults: function (): any[] {
      return this.mainResults.slice(0, this.loadingIndex)
    },

  },


  beforeDestroy() {
    // nothing
  },



  methods: {

    // Switch to the login view
    async login() {
      this.$router.push("/login");
      this.$bvToast.toast('Login successful', {
        title: `Variant ${'success' || 'default'}`,
        variant: 'success',
        solid: true
      })
    },

    // Log a user out of the local system
    async logout() {
      await this.$store.dispatch("logOut");
      this.$store.dispatch("removeUserTags");

      // close everything relevant and return to the default homepage view (topic recommendation)
      this.backToHome();
      this.resetHistory();

      this.uploadModalLoading = false
      this.$bvModal.hide('modal-1')
    },

    // Cchange between the Text Upload (individual websites) and the File Upload Tab for user histories
    changeUploadTab(tab) {
      if (tab === "Text") {
        this.uploadHistoryTab = 1
      } else if (tab === "File") {
        this.uploadHistoryTab = 2
      }
    },

    // Display the date for a given search result in a better looking manner
    formatDate(date: any) {
      const dateToFormat = dayjs(date);
      return dateToFormat.format('dddd MMMM D, YYYY');
    },

    // How many authors does an article have? (its usually just one anyways)
    getAuthorsLength(authors: any, idx: any) {
      this.authorsLength[idx] = Object.keys(authors).length

      return true
    },

    // Return back to the original home view with just the topic recommendations
    backToHome() {
      console.log("back to home ...")
      this.searchQuery = ""
      this.showSearchResult = false

      this.showTopics = true
      this.showHistories = false

      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
    },

    // Load the history management tab and therefore request all the uploaded histories of a user to display them in a datatable
    openHistoryTab() {
      console.log("opening history management ...")
      this.searchQuery = ""
      this.showSearchResult = false

      this.showTopics = false
      this.showHistories = true
      this.getAllHistories();
    },

    // Split the re-ranked search results into one main list with the most important ones, one extented list which follows the main list and one sidebar list which contains articles which are still more relevant than the extended ones (but still not really meaningful)
    splitResults() {
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

    // Preparation to delete an upload history by assigning one (called item)
    prepareToDelete(item) {
      this.itemToDelete = item;
      this.deleteHistoryDialog = true
    },

    // Abort the deletion of an uploaded history
    abortDeletion() {
      this.itemToDelete = null;
      this.deleteHistoryDialog = false
    },

    // Delete a complete uploaded history
    deleteHistoryUpload() {
      this.allHistories = this.allHistories.filter(item =>
        JSON.stringify(item) !== JSON.stringify(this.itemToDelete)
      );

      this.deleteHistoryDialog = false
    },

    // Delete just one URL/ website from an uploaded history
    deleteHistoryURL(upload, itemToDelete) {
      const index = this.allHistories.findIndex(item =>
        JSON.stringify(item) === JSON.stringify(upload)
      );

      if (index !== -1) {
        this.allHistories[index].sites = this.allHistories[index].sites.filter(item =>
          JSON.stringify(item) !== JSON.stringify(itemToDelete)
        );
      }

      this.deleteUrlDialog = false
    },

    // Change the behavior of some datatable elements when a row is expanded to show more details on a specific history upload
    rowIsExpanded(item) {
      if (this.expandedHistory.length > 0) {
        if (item["upload_number"] === this.expandedHistory[0]["upload_number"]) {
          return true
        }

        return false
      } else {
        return true
      }
    },

    // Display the authors for the search results in a better looking manner for the main results list
    formatAuthors(authors: any) {
      var authorsString = authors

      var authorArray = JSON.parse(authorsString);
      var charArray = [];
      for (var j = 0; j < authorArray.length; j++) {
        var author = authorArray[j];

        var authorChars = author.split('');
        charArray.push(authorChars);
      }

      var concatenatedString = charArray.join('');
      var cleanedString = concatenatedString.replace(/[\[\]"]/g, '');

      var finalArray = cleanedString.split(',')
      var finalArray = finalArray.map(function (element) {
        return element.trim().replace(/^'(.*)'$/, '$1');
      });


      var concatenatedString = finalArray.join(', ');

      if (concatenatedString.length === 0) {
        return "/";
      }
      return concatenatedString
    },

    // Display the authors for the search results in a better looking manner for the sidebar results
    formatAuthorsForSideView(authors: any) {
      var authorsString = authors

      var authorArray = JSON.parse(authorsString);
      var charArray = [];
      for (var j = 0; j < authorArray.length; j++) {
        var author = authorArray[j];

        var authorChars = author.split('');
        charArray.push(authorChars);
      }

      var concatenatedString = charArray.join('');
      var cleanedString = concatenatedString.replace(/[\[\]"]/g, '');

      var finalArray = cleanedString.split(',')
      var finalArray = finalArray.map(function (element) {
        return element.trim().replace(/^'(.*)'$/, '$1');
      });


      let firstAuthor;
      if (finalArray.length > 1) {
        firstAuthor = String(finalArray[0]) + " et al.";

      } else if (finalArray.length === 1) {
        firstAuthor = String(finalArray[0])

      } else if (finalArray.length === 1) {
        firstAuthor = "Anonymous"
      }

      if (concatenatedString.length === 0) {
        return "/";
      }
      return firstAuthor
    },

    // Select all tags/topics
    selectAllTags() {
      this.selectedTags = [...this.allTags];
      this.splitResults();
    },

    // Unselect all tags/topics
    unselectAllTags() {
      this.selectedTags = [];
      this.splitResults();
    },

    // Reset all of the local history related variables back to the original state (after the upload has been completed)
    resetHistory() {
      this.isUploadedHistoryFileValid = false
      this.isHistoryTextValid = false
      this.fileSelected = false
      this.showFileSelect = true
      this.uploadHistoryTab = 1
      this.historyUploadStatus = 1

      this.$store.dispatch('resetHistory')
    },

    // Load more of the less relevant results
    handleLoadMoreButton() {
      this.showExtendedResults = !this.showExtendedResults
      this.loadingIndex += this.loadingSteps // not used anymore, but still a potentially useful feature
    },

    // Display a topic in a better looking manner
    displayTag(tag) {
      if (String(tag) === "USER-PREF") {
        tag = "These articles might be interesting for you"
      }

      return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
    },

    // Can this file be uploaded? Confirmation of its validity
    checkUploadedFile(isValid) {
      this.isUploadedHistoryFileValid = isValid;
    },

    // Window view size
    handleView() {
      this.mobileView = window.innerWidth <= 990;
    },


    // Check if the websites given by a user are valid and can be processed --> does the input contain actual urls?
    validateUserHistoryInput() {
      var urls = []
      urls = this.historyUserInput.split(/[\n\s]+/)
        .filter((url) => url.trim() !== "")
        .map((url) => url.trim());

      if (urls.length <= 1) {
        urls = [this.historyUserInput.trim()];
      }


      const possible_separators = ["'", '"', ",", " ", "", ";"];
      urls.forEach((url, index) => {
        const startsWithSeparator = possible_separators.some((separator) =>
          url.startsWith(separator)
        );
        const endsWithSeparator = possible_separators.some((separator) =>
          url.endsWith(separator)
        );

        if (startsWithSeparator) {
          urls[index] = url.substring(1);
        }
        if (endsWithSeparator) {
          urls[index] = url.substring(0, url.length - 1);
        }
      });


      if (urls.length <= 0) {
        console.log("The list of URLs is empty.");
        this.isHistoryTextValid = false
        return
      }

      var validUrls = urls.filter((url) => {
        try {
          new URL(url);
          return true;

        } catch (error) {
          return false;
        }
      });


      if (validUrls.length > 0) {
        this.isHistoryTextValid = true
      } else {
        this.isHistoryTextValid = false
      }

      this.validUrls = validUrls
      console.log(validUrls)
      console.log(this.isHistoryTextValid)
    },


    // Send a given user history to the backend. The history contains of a list of urls which can be uploaded as a file or written as single website urls by the user.
    async sendHistory(evt) {
      this.uploadModalLoading = true
      evt.preventDefault()

      this.historyUploadStatus = 0
      console.log("send history to server ...")

      if (this.validUrls.length > 0 && this.uploadHistoryTab === 1) {
        this.$store.dispatch("setHistory", this.validUrls);

        this.historyUserInput = ""
        this.validUrls = []
      }

      const data = {
        username: this.$store.getters.stateUser,
        access_token: this.$store.getters.getAccessToken,
        refresh_token: this.$store.getters.getRefreshToken,
      }

      if (!this.$store.getters.stateHistory) return;


      await this.$store.dispatch("patchHistory", data);
      console.log("history status code")
      console.log(this.$store.getters.historyStatusCode)

      // Handle the request response code
      if (this.$store.getters.historyStatusCode !== "0" && this.$store.getters.historyStatusCode !== "402") {
        console.log("upload his done")
        this.historyUploadStatus = 1;

        if (this.$store.getters.historyStatusCode === "200" || this.$store.getters.historyStatusCode === "201") {
          console.log("success")
        }

        if (this.$store.getters.historyStatusCode === "402") {
          console.log("error while uploading history")
        } else if (this.$store.getters.historyStatusCode === "404") {
          console.log("error while uploading history")
        }

      } else {
        this.historyUploadStatus = -1;
      }


      if (this.$store.getters.historyStatusCode === "402") {
        this.logout()

      } else {
        // Update history management list
        await this.getAllHistories();

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

        // Request new tokens  (token verify)
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

      if (this.not_connected) {
        this.historyUploadStatus = 1
      }

      if (this.historyUploadStatus === 1) {
        this.backToHome();
        this.resetHistory();

        this.uploadModalLoading = false
        this.$bvModal.hide('modal-1')
      }
    },


    // Request all of the stored histories from a certain user for the history management
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

        this.$store.getters.getAllHistories = this.allHistories
        console.log("all histories", this.allHistories)

        this.loadingHistoryTable = false

      } catch (error) {
        console.log(error)
        this.loadingHistoryTable = false
      }

      if (this.not_connected) {
        this.allHistories = this.testHistoryData;
      }
    },


    // Process a query input from a user. This method requests the re-ranked results from the Backend and handles special cases of conduct. The search feature does not need a separate store.
    async handleSearch() {
      var res = "0"
      this.showSearchResult = true;
      this.showExtendedResults = false;
      this.searchStatus = 0;

      console.log("generating results ...");

      var query = this.searchQuery;
      if (query != null) {
        query = query.split(" ").join("_");
      }

      var endpoint = "/";

      // If user is logged in request the search results WITH the user preferences
      if (this.isLoggedIn) {
        console.log("user specific search ...")
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

            }
            // reject errors & warnings
          })
          .catch((error) => {
            console.log(error);
          });


      // If there is NO user logged in, request the search results WITHOUT the specific user preferences
      } else {
        console.log("regular search ...")
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

            }
            // reject errors & warnings
          })
          .catch((error) => {
            console.log(error);
          });

      }


      // Reponse can be 401, then use the refresh token
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
              //this.showSearchResult = true;

            }
            // reject errors & warnings
          })
          .catch((error) => {
            console.log(error);
          });
      }


      if (this.isLoggedIn) {
      // Reponse can be 402, then log out because the tokens are not valid
        if (res === "402") {
          console.log("forcefully logging out")
          this.logout()
        
          // Else the request worked and we want to refresh the tokens (token verify)
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


      // Format the search results: Build topics/tags for the search (top and most popular) + divide the search result list into main, side and extended lists
      if (typeof this.results !== 'undefined' && this.results.length > 0) {
        this.searchStatus = 1;

        this.loadingIndex = this.positive_index

        var mainResults = this.results.slice(0, this.positive_index)
        this.main_split_index = this.positive_index + mainResults.length
        var extendedResults = this.results.slice(this.main_split_index, this.results.length)

        this.extendedResults = extendedResults
        this.sideResults = this.results.slice(this.positive_index, this.positive_index + mainResults.length)
        this.mainResults = mainResults.concat(extendedResults);
        console.log("side results: ", this.sideResults, this.sideResults.length)
        console.log("main results: ", this.mainResults, this.mainResults.length)

        var topTags = []
        var tagCounts = {};
        for (let i = 0; i < this.results.length; i++) {
          var articleTagsString = this.results[i]["tags"]

          var tagArray = JSON.parse(articleTagsString);
          var charArray = [];
          for (var j = 0; j < tagArray.length; j++) {
            var tag = tagArray[j];

            var tagChars = tag.split('');
            charArray.push(tagChars);
          }

          var concatenatedString = charArray.join('');
          var cleanedString = concatenatedString.replace(/[\[\]"]/g, '');

          var finalArray = cleanedString.split(',')
          var finalArray = finalArray.map(function (element) {
            return element.trim().replace(/^'(.*)'$/, '$1');
          });

          this.results[i]["tags"] = finalArray

          for (let j = 0; j < this.results[i]["tags"].length; j++) {
            var tag = this.results[i]["tags"][j];
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }


        // Sort tags in popularity order
        var sortedTags = Object.keys(tagCounts).sort(function (a, b) {
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


      } else {
        this.searchStatus = -1;
      }


      // Display mock data
      if (this.not_connected) {
        this.positive_index = 2,
          this.results = this.testSearchData
        this.searchStatus = 1;


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
          var articleTagsString = this.results[i]["tags"]

          var tagArray = JSON.parse(articleTagsString);
          var charArray = [];
          for (var j = 0; j < tagArray.length; j++) {
            var tag = tagArray[j];

            var tagChars = tag.split('');
            charArray.push(tagChars);
          }

          var concatenatedString = charArray.join('');
          var cleanedString = concatenatedString.replace(/[\[\]"]/g, '');

          var finalArray = cleanedString.split(',')
          var finalArray = finalArray.map(function (element) {
            return element.trim().replace(/^'(.*)'$/, '$1');
          });

          this.results[i]["tags"] = finalArray



          for (let j = 0; j < this.results[i]["tags"].length; j++) {
            var tag = this.results[i]["tags"][j];
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }

        // sort tags in popularity order
        var sortedTags = Object.keys(tagCounts).sort(function (a, b) {
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

      // -------------------------------------

      console.log("search request finished!");
      console.log(this.searchStatus);
    },


    // Bring the raw search results in a form which we can work with
    getSearchResults(data) {
      this.results = [];
      if (data === undefined || data === 'undefined' || data === null) {
        this.searchStatus = -1;
        return
      }

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

      // default image in case there is none present
      var resizedImageURL = 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png';

      // Convert Backend response to a useable data structure (list of dicts)
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

  },
});
</script>





<style lang="scss">

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #000000;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.thumbnail {
  width: 300px;
  height: 200px;

}

.resultImg {
  max-width: 100%;
  width: 100%;
  height: 60%;
  object-fit: cover;
}

.three-lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  white-space: normal;
}

.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.no-border {
  border: none;
}

.custom-checkbox {
  transform: scale(1.2);
  margin-right: 4px;
}

.container {
  display: flex;
}

.search-bar {
  list-style-type: none;
  width: 100%;
  float: left;
  margin-right: 10px;
  display: inline-block
}

.list-group-item {
  margin-right: 1%;
  margin-top: 1%;
}

.item {
  margin-right: 10px;
}

.custom-cancel-color {
  background-color: rgba(255, 0, 0, 0.5);
  border-color: rgba(255, 0, 0, 0.5);
  color: #de4a4a;
}

.rightSpan {
  text-align: right;
}

.v-slide-group__content {
  justify-content: center;
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

.tag-container {
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
  -moz-appearance: none;
}

.v-data-table__expanded.v-data-table__expanded__content {
  box-shadow: none !important;
}

.text-tab .b-tab-content {
  overflow-y: auto;
}

.file-tab .b-tab-content {
  overflow-y: auto;
}

.text-shadowed {
  text-shadow: 0px 0.2px 1px grey, 0px 0px 1px grey;
}

.btn-primary:hover {
  background-color: rgb(122, 122, 122) !important;
}



a {
  cursor: pointer;
  margin-right: 60px;
}

a.linkAsText {
  text-decoration: none;
  color: black !important;
}

hr.dashed {
  border-top: 3px dashed #bbb;
}

hr.dotted {
  border-top: 3px dotted #bbb;
}

h3 {
  display: block
}

img {
  width: 90%;
  height: 60%;
  object-fit: cover;
}

body {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  font-family: "Segoe UI", Tahoma;
  background-color: #ffffff;
}

header {
  padding-top: 20px;
  padding-bottom: 20px;

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



/*
@import url("https://use.fontawesome.com/releases/v5.9.0/css/all.css");
* {
  font-size: 1rem;
}
*/

// Small devices (landscape phones, 544px and up)
@media (min-width: 544px) {
  h1 {
    font-size: 1.5rem;
  }
}

// Medium devices (tablets, 768px and up) The navbar toggle appears at this breakpoint
@media (min-width: 768px) {
  h1 {
    font-size: 2rem;
  }
}

// Large devices (desktops, 992px and up)
@media (min-width: 992px) {
  h1 {
    font-size: 2.5rem;
  }
}

// Extra large devices (large desktops, 1200px and up)
@media (min-width: 1200px) {
  h1 {
    font-size: 3rem;
  }
}



#modal-1 .modal-footer .btn-secondary {
  background-color: rgb(215, 157, 157);
  color: white;
}

#info-icon:hover {
  cursor: pointer;
  color: blue;
}

#navigation-icon {
  padding: 10px 10px 20px;
  margin-right: 10px;
  cursor: pointer;

  i {
    font-size: 2rem;
  }
}

#nav a {
  font-weight: bold;
  color: #000000;
}

#nav a.router-link-exact-active {
  color: #ffffff;
}

#home {
  margin: 0;
  padding: 0;
}

#top-div {
  position: sticky;
  top: 0;
  z-index: 999;
  //background: linear-gradient(to left, rgb(184, 199, 235), rgb(145, 162, 202));
  background: white;
  text-align: center;
  max-height: 15vh;
}

</style>