<template>
  <div class="file-upload">
    <div class="file-upload__area">

      <div v-if="!file.isUploaded">
        <input type="file" name="selectFiles" ref="doc" id="selectFiles" @change="importFile($event)" /> <!-- ($event) -->
      </div>

      <div v-if="file.isUploaded" class="upload-preview">
        
        <div v-if="!file.isHistory" class="file-extention">
          {{ file.fileExtention }}
        </div>

        <span class="file-name">
          {{ file.name }}{{ file.isHistory ? `.${file.fileExtention}` : "" }}
        </span>

        <div class="">
          <button @click="resetFileInput">Change file</button>
        </div>

        <div v-if="errors.length > 0">
          <div class="file-upload__error" v-for="(error, index) in errors" :key="index">
            <span>{{ error }}</span>
          </div>
        </div>

        <div class="" style="margin-top: 10px">
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

  data() {
    return {
      errors: [],
      content: {},

      showExampleFile: false,
      isFileValidBol: false,
      uploadReady: true,

      // file has a lot more variables that currently required, but this may come in handy in the future
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


  created() {
    this.resetFileInput();
  },


  methods: {

    // Check if the uploaded file has a valid size
    isFileSizeValid(fileSize) {
      if (fileSize <= this.maxSize) {
        console.log("File size is valid");
      } else {
        this.errors.push(`File size should be less than ${this.maxSize} MB`);
      }
    },

    // Check if the uploaded file has a valid type (f.E. csv)
    isFileTypeValid(fileExtention) {
      if (this.accept.split(",").includes(fileExtention)) {
        console.log("File type is valid");
      } else {
        this.errors.push(`File type should be: ${this.accept}`);
      }
    },

    // Check if the uploaded file is valid overall
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

    // Reset all of the inputs for the next file to be uploaded
    resetFileInput() {
      this.showExampleFile = false
      this.errors = []
      this.$emit('isFileValid', false);
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

    // Get the valid file (with the correct format) as an input and return a list of URLs (for now remove all of the remaining information regarding the file)
    async handleFileFormat(file) {
      // Motivated by: https://masteringjs.io/tutorials/vue/file
      const reader = new FileReader();
      var urls = [];

      if (file.name.includes(".json")) {
        console.log("json file is being processed ...")
        reader.onload = (res) => {
          //console.log(res.target.result);
          this.content = JSON.parse(res.target.result);
          console.log(this.content);

          if (("Browser History" in this.content)) {
            this.errors = []
            this.errors.push(`Google takeout currently not supported!`);
            this.showExampleFile = true;
            console.log("Browser History from Google takeout")

            this.isFileValidBol = false
            this.$emit('isFileValid', false);

          } else if (this.content instanceof Array) {
            console.log("Browser History from Chrome Extension")
            for (let i = 0; i < this.content.length; i++) {
              urls.push(this.content[i]["url"]);
            }

          } else {
            this.errors = []
            this.errors.push(`File format not compatible!`);
            this.errors.push(`Please ensure that the file is structured correctly. `);
            this.showExampleFile = true;
            console.log("Format not found.")

            this.isFileValidBol = false
            this.$emit('isFileValid', false);
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
      }

      else {
        console.log("error: wrong file format");
        this.errors = []
        this.errors.push(`File format is not compatible!`);
        this.showExampleFile = true;
        this.isFileValidBol = false
        this.$emit('isFileValid', false);

        reader.onload = (res) => {
          //console.log(res.target.result);
        };

      }

      return urls
    },


    // Deal with the upload of the history file´s URLs: Validating and uploading to the backend with helper methods
    async importFile(event) {
      this.errors = [];

      // Check if file is selected
      if (event.target.files && this.$refs.doc.files[0]) {

        // Check if file is valid
        if (this.isFileValid(event.target.files[0])) {
          this.isFileValidBol = true
          this.$emit('isFileValid', true);

          // Handle history URLs 
          var history = this.$refs.doc.files[0];
          var urls = await this.handleFileFormat(history);
          this.$store.dispatch("setHistory", urls);

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
          this.isFileValidBol = false
          this.$emit('isFileValid', false);

          console.log("Invalid file");
        }
      }
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