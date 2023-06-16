<script setup>
import { useHomeStore } from "@/store/modules/home"
//import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

//const { results, loading, error } = storeToRefs(useHomeStore())
//const { fetchSearchResults } = useHomeStore()

//fetchSearchResults("test")

</script>

<template>
  <div id="home" class="divide-y divide-gray-200">

    <header>
    <div class="container-fluid">
      
      <div class="row display-flex no-gutters">
        <div class="col-xs-6 col-md-2 bg-dark">
          <h1 class="vertical-center">Adaptive Storyfinder</h1>
        </div>
        
        <div class="col-xs-6 col-md-7 bg-white ms-auto">

              <div class="container">

                <div class="item">
                    <div class="vertical-center">
                      <button class="btn btn-primary" @click="dropzoneOpen = true">Upload</button>
                    </div>
                      <teleport to="body">
                        <div class="modal" v-if="dropzoneOpen">
                          <div>

                            <div class="file-drop-area">
                              <span class="choose-file-button">Choose files</span>
                              <span class="file-message">or drag and drop files here</span>
                              <input class="file-input" type="file" ref="history" @change="handleHistoryUploadWithEvent" multiple>
                            </div>
                            
                            <button class="btn btn-primary" @click="dropzoneOpen = false">Close</button>
                          </div>
                        </div>
                      </teleport>
                </div>

                <div class="item">
                  <form class="search-box" @submit.prevent="handleSearch">
            <input 
            type="search"
            class="search-field rounded" 
            placeholder="Search ..."
            aria-label="Search"
            required
            v-model.trim="searchQuery" />
            <span class="input-group-text border-0 bg-transparent" id="search-addon">
              <i class="fas fa-search"></i>
            </span>
            </form>
                </div>
              </div>
                
                

                <!--<div class="dropdown">
                  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Dropdown button
                  </button>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                    <a class="dropdown-item" href="#">Action</a>
                    <a class="dropdown-item" href="#">
                      <button @click="dropzoneOpen = true"> Open </button>
                
                      <teleport to="body">
                        <div class="modal" v-if="dropzoneOpen">
                          <div>

                            <div class="file-drop-area">
                              <span class="choose-file-button">Choose files</span>
                              <span class="file-message">or drag and drop files here</span>
                              <input class="file-input" type="file" ref="history" v-on:input="handleHistoryUpload" multiple>
                            </div>

                            <button @click="dropzoneOpen = false"> Close </button>
                          </div>
                        </div>
                      </teleport>
                    </a>
                    <a class="dropdown-item" href="#">
                      <FileUpload mode="basic" name="demo[]" url="./upload.php" accept="image/*" :maxFileSize="1000000000" @upload="handleHistoryUpload" :auto="true" chooseLabel="Browse" />
                    </a>
                  </div>
                </div> -->

            

        </div>
         <div class="col-xs-6 col-md-3">
        </div>
    </div>

    </div>
    </header>

    <main>
    <div class="container-fluid">

        <div class="row display-flex no-gutters">
          <div class="col-xs-6 col-md-2">
            <div class="container">
            </div>
          </div>

          <div class="col-xs-6 col-md-7 ms-auto" v-if="noResult != null">
            <div class="cards" v-if="results && results.length > 0">
              <ul class="list-group">
              <li class="list-group-item" v-for="(item) in this.results" :key="item">

                <div class="card text-bg-white mb-3" style="max-width: 700px;">
                  <div class="row g-0">
                    <div class="col-md-4">
                      <img :src="exampleThumbnail" class="img-fluid rounded-start" alt="...">
                    </div>
                    <div class="col-md-8">
                      <div class="card-header "> {{ item.advice }} </div>
                      <div class="card-body">
                        <h5 class="card-title"> {{ item.advice }}</h5>
                        <p class="card-text"> {{ item.views }} </p>
                        <p class="card-text"><small class="text-body-secondary"> {{ item.date }}</small></p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
            <!-- <Card v-for="result in results" :key="result" :result="result" /> -->
            </div>

            <div class="col-xs-6 col-md-7 ms-auto" v-else>
              <h3>Sorry, no results found for {{ searchQuery }} ...</h3>
          </div>
          </div>

          <div class="col-xs-6 col-md-7 ms-auto" v-else>
          </div>

          <div class="col-xs-6 col-md-3">
            Recommendations
          </div>

        </div>

      </div>
    </main>

    <!-- <div class="top-bar">
    <div class="d-md-flex d-block flex-row mx-md-auto mx-0">
            <div class="search">
                <input type="text" placeholder="Search ..." v-model.trim="searchValue" @keyup="fetchSearchResults"/>
                <i class="fas fa-search"></i>
            </div>
    </div> 
    </div> -->
    
  </div>
    
    
</template>

<script>
// Imports
import { defineComponent } from "vue";
import { ref } from 'vue';
import Card from '@/components/resultCard.vue';
import axios from "axios";
//import FileUpload from "primevue/fileupload"
//import Navigation from "@/components/NavigationBar.vue";
//import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

const dropzoneOpen = ref(false)

//const totalSize = ref(0);
//const totalSizePercent = ref(0);
//const files = ref([]);
export default defineComponent({
  name: "HomeView",
    components: {
      //FileUpload,
    },
    data: () => {
      return {
        results: {},
        searchQuery: null,
        exampleThumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
        noResult: null,

        history: null,

        //dropzoneOpen: false,
        mobileView: false,
      };
    },
  
  methods: {
    handleView() {
      this.mobileView = window.innerWidth <= 990;
    },

    handleHistoryUpload(event) {
      this.history = this.$refs.history.files[0];
      
      const formData = new FormData();
        formData.append('history', this.history);
        const headers = { 'Content-Type': 'multipart/form-data' };
        axios.post('https://httpbin.org/post', formData, { headers }).then((res) => {
          res.data.files; // binary representation of the file
          res.status; // HTTP status
        });

      console.log(this.history)
      console.log("history uploaded")
      for (let i = 0; i < this.history.length; i++) {
        console.log(this.history[i])
      } 

      this.$refs.dropzoneOpen = false
    },

    handleHistoryUploadWithEvent(event) {
      this.history = event.target.files[0]; //event.files;

      const formData = new FormData();
        formData.append('history', this.history);
        const headers = { 'Content-Type': 'multipart/form-data' };
        axios.post('https://httpbin.org/post', formData, { headers }).then((res) => {
          console.log(res)
          res.data.files; // binary representation of the file
          res.status; // HTTP status
        });

      console.log(this.history)
      console.log("history uploaded")
    },

    async handleSearch() {
      console.log("search results: ")
      await axios.get(`https://api.adviceslip.com/advice/search/${this.searchQuery}`)
      .then((response)=>{
        this.results = response.data.slips
        console.log(this.results)

        this.noResult = false
      })
      .catch((error)=>{
        console.log(error)
      })

      
      //this.results.value = fetch(`https://api/?q=${this.searchQuery.value}`)
      //  .then(res => res.json())
      //  .then(data => data.results);
      //this.searchQuery = "";
    },


  },

  async created() {
    this.handleView();
    window.addEventListener('resize', this.handleView);

    const searchQuery = ref("");
    const results = ref([]);
    //await this.handleView();

    return {
      Card,
      searchQuery,
      results,
    }
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
  margin: 5px;
  margin-right: 70px;
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
  h1 {font-size:1.5rem;} /*1rem = 16px*/
}
 
/* Medium devices (tablets, 768px and up) The navbar toggle appears at this breakpoint */
@media (min-width: 768px) {  
  h1 {font-size:2rem;} /*1rem = 16px*/
}
 
/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) { 
  h1 {font-size:2.5rem;} /*1rem = 16px*/
}
 
/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {  
  h1 {font-size:3rem;} /*1rem = 16px*/    
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
      background-color: #F3F3F3;
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
        color: #AAA;
      }
      &:focus, &:valid {
        color: #FFF;
        background-color: #313131;
        box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.15);
      }
    }
  }
}
</style>