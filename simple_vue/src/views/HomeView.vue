<template>
  <div>
    
    <p>{{ msg }}</p>

  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import axios from "axios";

  export default Vue.extend({
    name: 'Home',

    components: {
      //HelloWorld,
    },

    data() {
      return {
        msg: [],
      };
    },

    created() { // async --> API ERROR WITH AXIOS
      this.getMessage();
    },

    methods: {
      getMessage() {
        axios
          .get("http://127.0.0.1:8000/")
          .then((res) => {
            this.msg = res.data["message"];
          })
          .catch((error) => {
            console.error(error);
          });
      },

      


    },

})
</script>