<template>
  <div id="home" class="divide-y divide-gray-200">
    
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand ml-4" href="#">Adaptive Storyfinder</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
        <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
      </li>
      <li class="nav-item dropdown">

        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template #button-content>
            Import History
          </template>
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
                  <button @click="showFileSelect = !showFileSelect">Select a file</button>
                </div>
                <div v-show="showFileSelect">
                  <FileUploadField :maxSize="1000000" accept="json,pdf,csv" @file-uploaded="getUploadedData" />
                </div>

                <div v-if="fileSelected">
                  Successfully Selected file: {{ file.name }}.{{ file.fileExtention }}
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
          <input class="form-control mr-sm-2 rounded" type="search" placeholder="Search" aria-label="Search" v-model.trim="searchQuery">
        </form>
      </div>
      <div class="item">
        <form class="form-inline">
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit" @click="handleSearch">Search</button>
        </form>
      </div>
    </div>
    
  </div>
</nav>



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
              <li class="list-group-item" v-for="item in results" :key="item.id">

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

    <p>{{ msg }}</p>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
// Imports
import { ref } from 'vue';
import axios from "axios";
import FileUpload from 'primevue/fileupload';
import FileUploadField from "@/components/FileUploadField.vue";
//import FileUpload from "primevue/fileupload"
//import Navigation from "@/components/NavigationBar.vue";
//import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

const dropzoneOpen = ref(false)


export default Vue.extend({
    name: 'Home',

    components: {
      FileUpload,
      FileUploadField,
    },

    data () {
      return {
        results: [],
        searchQuery: "",
        exampleThumbnail: "https://englishlive.ef.com/blog/wp-content/uploads/sites/2/2015/05/how-to-give-advice-in-english.jpg",
        noResult: false,

        history: [],

        dropzoneOpen: false,
        mobileView: false,


        file: {},
        fileSelected: false,
        showFileSelect: true,

        msg: [],
      }
    },

    async created() {
      this.getMessage();

      this.handleView();
      window.addEventListener('resize', this.handleView);

      const searchQuery = ref("");
      const results = ref([]);
      //await this.handleView();

      return {
        searchQuery,
        results,
      }
    },

    beforeMount () {
      // this.fetch()
    },


    methods: {
      getMessage() {
      axios.get('/')
        .then((res) => {
          this.msg = res.data["message"];
        })
        .catch((error) => {
          console.error(error);
        });
      },




      async handleSearch() {
        console.log("generating results ...")

        var query = this.searchQuery
        if (query != null){
          query = query.split(' ').join('_')
        }

        var endpoint = `http://127.0.0.1:8000/search_his?query=${query}`
        //endpoint = `https://api.adviceslip.com/advice/search/${query}` // TODO


        // ------------------
        // ------------------
        // ------------------
        axios.get('/' + `search_his?query=${query}`)
        .then((res) => {
          this.results = res.data;
        })
        .catch((error) => {
          console.error(error);
        });

        console.log("-------------")
        console.log("-------------")
        console.log("-------------")
        console.log("-------------")
        console.log("-------------")
        console.log(this.results)
        console.log("-------------")
        console.log("-------------")
        console.log("-------------")
        console.log("-------------")
        console.log("-------------")
        console.log("-------------")
        // ------------------


        await axios.get(endpoint, {
          headers: {
            //'Access-Control-Allow-Origin': '*', // NOT WORKING
            //'Content-type': 'application/json', // NOT WORKING
            // Authorization: 'Bearer ' + token //the token is a variable which holds the token
          }
        })
        .then((response)=>{

          if (response.data) {
          // return success
            if (response.status === 200 || response.status === 201) {
              this.results = response.data
              console.log(this.results)

              this.noResult = false
            }
            // reject errors & warnings
          }
        })
        .catch((error)=>{
          console.log(error)
        })
      
      console.log("send to: " + (endpoint))
      console.log(this.results)

      /*
      axios.post('https://example.com/postSomething', {
 email: varEmail, //varEmail is a variable which holds the email
 password: varPassword
},
{
  headers: {
    Authorization: 'Bearer ' + varToken
  }
}) */


/*
axios({
  method: 'post', //you can set what request you want to be
  url: 'https://example.com/request',
  data: {id: varID},
  headers: {
    Authorization: 'Bearer ' + varToken
  }
})
*/
      },



      onUpload(){
        console.log("uploaded")
      },

      getUploadedData(file: any) {
        this.fileSelected = true;
        this.showFileSelect = false;
        this.file = file;

        console.log(file)

        var data = file.body // TODO
        this.history = data; //event.files;

        const formData = new FormData();
        formData.append('history', data);
        const headers = { 'Content-Type': 'multipart/form-data' };
        axios.post('https://httpbin.org/post', formData, { headers }).then((res) => {
            console.log(res)
            res.data.files; // binary representation of the file
            res.status; // HTTP status
        });
        console.log("history uploaded")

        this.history = []
      },

    /*onUpload({
      event: Event) {
      // EventTarget; // currentTarget

      if ((event.target as HTMLInputElement) != null && (event.target as HTMLInputElement).files != null) {

        this.history = (event.target as HTMLInputElement).files[0]; //event.files;
        return;
      }

      
    

      const target = event.target as Element;
      if (target) console.log(target.value);
      this.history = event.files[0]; //event.files;
      let file = (event.target as HTMLInputElement).files[0];

      const formData = new FormData();
        formData.append('history', this.history);
        const headers = { 'Content-Type': 'multipart/form-data' };// "application/json"
        axios.post('https://httpbin.org/post', formData, { headers }).then((res) => {
          console.log(res)
          res.data.files; // binary representation of the file
          res.status; // HTTP status
        });

      console.log(this.history)
      console.log("history uploaded")
    },*/


      fetch () {
        this.$store.dispatch('websocketChangeFunctionality', 'all vaccinations')
      },

      handleView() {
        this.mobileView = window.innerWidth <= 990;
      },

      toggleDropzone() {
        this.dropzoneOpen = !dropzoneOpen;
        console.log("dropzone: " + String(this.dropzoneOpen))
      },

    /*handleHistoryUpload(event) {
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
    },*/

    


    },


  })
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

.dropzone{
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