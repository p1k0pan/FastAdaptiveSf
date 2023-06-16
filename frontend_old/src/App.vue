<script setup>
import { RouterView } from 'vue-router' // RouterLink,
</script>


<template>
  
  <RouterView />

</template>

<script>
// lang="ts"

// Imports
//import home from './views/home.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components:{
    //'home-page': home,
    // home // with ts
  },
  name: 'App',
  data() {
    return {

    }
  },

  //props: {},
  //setup(props) {},
  //computed:{}
  //watch: {}
  //emits: 

  methods: {

  },
})
</script>


<style scoped lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

@import'~bootstrap/dist/css/bootstrap.css'
</style>

