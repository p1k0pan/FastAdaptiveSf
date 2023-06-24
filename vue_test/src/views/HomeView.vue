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
              <b-dropdown-item href="#" disabled>
                <FileUpload
                  mode="basic"
                  name="model[]"
                  accept=".json"
                  :max-file-size="5000000000"
                  :auto="true"
                  :custom-upload="true"
                  choose-label="Upload image"
                  @uploader="onUpload"
                />
              </b-dropdown-item>

              <b-dropdown-item href="#" @click="toggleDropzone">
                <div>
                  <b-button v-b-modal.modal-1>Dropzone</b-button>

                  <b-modal id="modal-1" title="Upload your history!">
                    <div>
                      <button @click="showFileSelect = !showFileSelect">
                        Select a file
                      </button>
                    </div>
                    <div v-show="showFileSelect">
                      <FileUploadField
                        :maxSize="1000000"
                        accept="json,pdf,csv"
                        @file-uploaded="getUploadedData"
                      />
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

          <li class="nav-item active">
            <a class="nav-link" @click="logout">Log Out</a>
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
            <form class="form-inline">
              <button
                class="btn btn-outline-success my-2 my-sm-0"
                type="submit"
                @click="handleSearch"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>

    <main></main>
    edsfds
    <p>{{ msg }}</p>
  </div>
</template>

<script lang="ts">
// Imports
import Vue from "vue";
import { ref } from "vue";
import axios from "axios";
import FileUpload from "primevue/fileupload";
import FileUploadField from "@/components/FileUploadField.vue";
//import FileUpload from "primevue/fileupload"
//import Navigation from "@/components/NavigationBar.vue";
//import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

const dropzoneOpen = ref(false);

export default Vue.extend({
  name: "Home",

  components: {
    FileUpload,
    FileUploadField,
  },

  data() {
    return {
      results: [],
      searchQuery: "",
      firstSearch: true,
      exampleThumbnail:
        "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",

      history: [],

      dropzoneOpen: false,
      mobileView: false,

      file: {},
      fileSelected: false,
      showFileSelect: true,

      msg: [],
      loginStatus: false,
    };
  },

  created() {
    // async --> API ERROR WITH AXIOS
    this.getMessage();
  },

  computed: {
    isLoggedIn: function () {},
  },

  methods: {
    async logout() {
      await this.$store.dispatch("logOut");
      this.$router.push("/");
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
      // TODO for tests: remove async
      console.log("generating results ...");

      var query = this.searchQuery;
      if (query != null) {
        query = query.split(" ").join("_");
      }

      // ------------------
      var endpoint = "/" + `search_his?query=${query}`;
      // ------------------

      await axios // TODO for tests: remove await
        .get(endpoint, {
          headers: {},
        })
        .then((response) => {
          if (response.data) {
            // return success
            if (response.status === 200 || response.status === 201) {
              console.log("request successful");
              this.results = [];
              const result: any[] = [];

              var titles = response.data["title"];
              var urls = response.data["urls"];
              var authors = response.data["authors"];
              var timestamps = response.data["timestamp"];
              var tags = response.data["tags"];
              // var texts = response.data["text"];

              for (let i = 0; i < titles.length; i++) {
                var dict = {
                  id: i,
                  title: titles[i],
                  urls: urls[i],
                  authors: authors[i],
                  timestamps: timestamps[i],
                  tags: tags[i],
                  //"texts": texts[0],
                };

                result.push(dict);
              }
              this.results = result;
              this.firstSearch = false;

              console.log("----------");
              console.log("titles:");
              console.log(titles);
              console.log("---");
              console.log("urls:");
              console.log(urls);
              console.log("---");
              console.log("authors:");
              console.log(authors);
              console.log("---");
              console.log("timestamps:");
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
      console.log("length of results array: ");
      console.log(this.results.length);
      console.log("Empty condition of results array: ");
      console.log(this.results === undefined || this.results.length == 0);
      console.log("---");
      console.log("Complete results array: ");
      console.log(this.results);
      console.log("----------");
    },

    onUpload() {
      console.log("uploaded");
    },

    getUploadedData(file: any) {},

    fetch() {},

    handleView() {},

    toggleDropzone() {},
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
