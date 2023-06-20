<template>
  <div>
    <button @click="sendRequest">Send Request</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  methods: {
    sendRequest() {
      // Specify the address to send the request
      const url = "http://127.0.0.1:8000/search_his?query=life"; // Replace with your desired address

      // Send the request using axios
      axios
        .get(url)
        .then((response) => {
          // Handle the response as needed
          console.log(response.data);
        })
        .catch((error) => {
          // Handle any errors that occur during the request
          console.error(error);
        });
    },
  },
};
</script>

<style>
/* Add your custom styles here */
</style>
