<template>
  <div class="file-upload">
    <div class="file-upload__area">
      <div v-if="!file.isUploaded">
        <input type="file" name="selectFiles" ref="doc" id="selectFiles" @change="importFile($event)" /> <!-- ($event) -->
        <div v-if="errors.length > 0">
          <div
            class="file-upload__error"
            v-for="(error, index) in errors"
            :key="index"
          >
            <span>{{ error }}</span>
          </div>
        </div>
      </div>
      <div v-if="file.isUploaded" class="upload-preview">
        <p v-if="file.isHistory"> Uploaded. </p>
        <div v-if="!file.isHistory" class="file-extention">
          {{ file.fileExtention }}
        </div>
        <span class="file-name">
          {{ file.name }}{{ file.isHistory ? `.${file.fileExtention}` : "" }}
        </span>
        
        <div class="">
          <button @click="resetFileInput">Change file</button>
        </div>
        <div class="" style="margin-top: 10px">
          <button id="import" @click="sendHistory">Select File</button>
        </div>

        <pre id="result"></pre>
      </div>
    </div>
  </div>
</template>


<script>
  export default {
    name: "FileUpload",

    props: {
    maxSize: {
      type: Number,
      default: 100,
      required: true,
    },
    accept: {
      type: String,
      default: "json,pdf,csv,txt",
    },
    },
    emits: ['file-upload'],

    data () {
    return {
      errors: [],
      content: {},

      isLoading: false,
      uploadReady: true,
      file: {
        name: "",
        urls: [],
        size: 0,
        type: "",
        body: [],
        fileExtention: "",
        metadata: [],
        isHistory: false,
        isUploaded: false,
      },
    };
    },


    methods: {

    isFileSizeValid(fileSize) {
      if (fileSize <= this.maxSize) {
        console.log("File size is valid");
      } else {
          this.errors.push(`File size should be less than ${this.maxSize} MB`);
      }
    },
    isFileTypeValid(fileExtention) {
      if (this.accept.split(",").includes(fileExtention)) {
        console.log("File type is valid");
      } else {
        this.errors.push(`File type should be ${this.accept}`);
      }
    },
    isFileValid(file) {
      this.isFileSizeValid(Math.round((file.size / 1024 / 1024) * 100) / 100);
      console.log(this.accept.split(","))
      this.isFileTypeValid(file.name.split(".").pop());
      if (this.errors.length === 0) {
        return true;
      } else {
        return false;
      }
    },


    resetFileInput() {
      this.uploadReady = false;
      this.$nextTick(() => {
        this.uploadReady = true;
        this.file = {
          name: "",
          urls: [],
          size: 0,
          type: "",
          body: [],
          fileExtention: "",
          metadata: [],
          isHistory: false,
          isUploaded: false,
        };
      });
    },
    


    async handleFileFormat(file) {
      // https://masteringjs.io/tutorials/vue/file
      const reader = new FileReader();
      var urls= [];

      if (file.name.includes(".json")) {
        console.log("json file is being processed ...")
        reader.onload = (res) => {
          //console.log(res.target.result);
          this.content = JSON.parse(res.target.result);
          console.log(this.content);
          
          if (("Browser History" in this.content)) {
            console.log("Browser History from Google takeout")
            
          } else if (this.content instanceof Array) {
            console.log("Browser History from Chrome Extension")
            for (let i = 0; i < this.content.length; i++) {
              urls.push(this.content[i]["url"]);
            } 

          } else {
            console.log("Format not found.")

          }
        };
        reader.onerror = (err) => console.log(err);
        reader.readAsText(file);



      } else if (file.name.includes(".csv")) {
        console.log("csv file is being processed ...")
        reader.onload = (res) => {
          //console.log(res.target.result);
          this.content = res.target.result;
        };
        reader.onerror = (err) => console.log(err);
        reader.readAsText(file);



      } else if (file.name.includes(".txt")) {
        console.log("txt file is being processed ...")
        reader.onload = (res) => {
          //console.log(res.target.result);
          this.content = res.target.result;
        };
        reader.onerror = (err) => console.log(err);
        reader.readAsText(file);


      } else if (file.name.includes(".pdf")) {
        console.log("pdf file is being processed ...")
        reader.onload = (res) => {
          //console.log(res.target.result);
          this.content = res.target.result;
        };
        reader.onerror = (err) => console.log(err);
        reader.readAsText(file);


      } else {
        console.log("error: wrong file format");
        reader.onload = (res) => {
          //console.log(res.target.result);
        };

      }

      //const result = JSON.parse(e.target.result);
      //const formatted = JSON.stringify(result, null, 2);
      //document.getElementById('result').innerHTML = formatted;
      
      return urls
    },



    async importFile(event) {
      this.errors = [];

      // Check if file is selected
      if (event.target.files && this.$refs.doc.files[0]) {
        // Check if file is valid
        if (this.isFileValid(event.target.files[0])) {
            // history
            var history = this.$refs.doc.files[0];
            var urls = await this.handleFileFormat(history);


            // Get uploaded file for more information
            const file = event.target.files[0],

            // Get file size
            fileSize = Math.round((file.size / 1024 / 1024) * 100) / 100,
            // Get file extension
            fileExtention = file.name.split(".").pop(),
            // Get file name
            fileName = file.name.split(".").shift(),
            // metadata
            metadata = [],
            // Check if file is of the correct type
            isHistory = ["json", "csv"].includes(fileExtention); // "json", "pdf", "csv", "txt"

          // Print to console
          console.log(fileSize, fileExtention, fileName, isHistory);

          /*
          // Load the FileReader API (DOES NOT WORK)
          let reader = new FileReader();
          reader.addEventListener(
            "load",
            () => {
              // Set file data
              this.file = {
                name: fileName,
                size: fileSize,
                type: file.type,
                body: file,
                fileExtention: fileExtention,
                metadata: metadata,
                isHistory: isHistory,
                fileUrl: reader.result,
                isUploaded: true,
              };
            },
            false
          );
          */

          // Set file data
          this.file = {
                name: fileName,
                urls: urls,
                size: fileSize,
                type: file.type,
                body: file,
                fileExtention: fileExtention,
                metadata: metadata,
                isHistory: isHistory,
                isUploaded: true,
          };
        } else {
          console.log("Invalid file");
        }
      }
    },



    sendHistory() {
      console.log("send history to server ...")

      const data = {
        file: this.file,

        username: this.$store.getters.stateUser,
        access_token: this.$store.getters.getAccessToken,
        refresh_token: this.$store.getters.getRefreshToken,
      }

      if (!this.file) return;
      this.$store.dispatch("setHistory", data);

      if(this.$store.getters.isHistoryValid) {
        this.fileSelected = true;
        this.showFileSelect = false;
      }
      
      //this.$emit("file-upload", this.file);
      this.resetFileInput();
      //this.$refs.form.reset(); RESET FORM TODO
    },
    
    },

  };
  </script>
  
  <style scoped>
.file-upload .file-upload__error {
  margin-top: 10px;
  color: #f00;
  font-size: 12px;
}
.file-upload .upload-preview {
  text-align: center;
}
.file-upload .upload-preview .file-image {
  width: 100%;
  height: 300px;
  object-fit: contain;
}
.file-upload .upload-preview .file-extension {
  height: 100px;
  width: 100px;
  border-radius: 8px;
  background: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5em auto;
  font-size: 1.2em;
  padding: 1em;
  text-transform: uppercase;
  font-weight: 500;
}
.file-upload .upload-preview .file-name {
  font-size: 1.2em;
  font-weight: 500;
  color: #000;
  opacity: 0.5;
}
  </style>