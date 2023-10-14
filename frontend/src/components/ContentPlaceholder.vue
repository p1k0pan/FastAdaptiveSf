<!-- Content loading placeholder to display instead of search results motivated by: https://codepen.io/neiya/pen/rNVQJMr -->
<template>
  <div id="content_placeholder">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">

      <!-- Animated gradient -->
      <defs>
        <linearGradient id="myGradient" gradientTransform="rotate(20)">
          <stop offset="5%" stop-color="#eee">
            <animate attributeName="stop-color" values="#EEEEEE; #CCCCCC; #EEEEEE" dur="2s" repeatCount="indefinite">
            </animate>
          </stop>
          <stop offset="95%" stop-color="#aaa">
            <animate attributeName="stop-color" values="#EEEEEE; #DDDDDD; #EEEEEE" dur="3s" repeatCount="indefinite">
            </animate>
          </stop>
        </linearGradient>
      </defs>


      <rect fill="url(#myGradient)" class="authors" y="0vh" x="0vw" />
      <rect fill="url(#myGradient)" class="date" y="0vh" x="30vw" />
      <rect fill="url(#myGradient)" class="image" y="2.6vh" />

      <rect fill="url(#myGradient)" class="title" y="35vh" />
      <rect fill="url(#myGradient)" class="example-button" y="35vh" x="30vw" />

      <rect fill="url(#myGradient)" class="description1" y="42vh" />
      <rect fill="url(#myGradient)" class="description2" y="45vh" />
      <rect fill="url(#myGradient)" class="description1" y="48vh" />

      <rect fill="url(#myGradient)" class="tags" y="52vh" rx="10" ry="10" x="0vw" />
      <rect fill="url(#myGradient)" class="tags" y="52vh" rx="10" ry="10" x="7vw" />
      <rect fill="url(#myGradient)" class="tags" y="52vh" rx="10" ry="10" x="14vw" />

    </svg>

  </div>
</template>





<script>
//Imports
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ContentPlaceholder',
  data() {
    return {
      // nothing
    };
  },

  methods: {
    // nothing
  }
});
</script>





<style>

.authors {
  width: 60%;
  height: 3%;
}

.date {
  width: 30%;
  height: 3%;
}

.image {
  width: 100%;
  height: 53%;
}

.title {
  width: 70%;
  height: 7%;
}

.example-button {
  width: 30%;
  height: 9%;
}

.description1 {
  width: 98%;
  height: 3%;
}

.description2 {
  width: 80%;
  height: 3%;
}

.tags {
  width: 15%;
  height: 6%;
}

</style>