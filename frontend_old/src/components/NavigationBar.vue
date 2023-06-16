<script setup>
import { useHomeStore } from "../store/modules/home";
//import { RouterLink } from 'vue-router'
//import { storeToRefs } from 'pinia'

//const { results, loading, error } = storeToRefs(useHomeStore())
const { fetchSearchResults } = useHomeStore()
</script>

<template>
    <div id="navigation">
        
      <div class="d-md-flex d-block flex-row mx-md-auto mx-0">
            <div class="search">
                <input type="text" placeholder="Search ..." v-model.trim="searchValue" @keyup="fetchSearchResults"/>
                <i class="fas fa-search"></i>
            </div>
      </div>

    </div>
  </template>
  
<script>

// Imports
import { defineComponent } from "vue";

export default defineComponent({
    name: "NavBar",
    components: {
    },
    data: () => {
      return {
        results: [],
        searchValue: ""
      };
    },

    mounted() {
      console.log("Component mounted.");
    },

    methods: {
    },

    created() {
      //this.handleView();
      //window.addEventListener('resize', this.handleView);
    },
  });
</script>
  
  <style lang="scss" scoped>
  #navigation {
    display: flex;
    width: 100%;
    margin-bottom: 50px;
    ul {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0 20px 0 0;
      li {
        font-size: 2rem;
        padding: 2px 10px;
        cursor: pointer;
        &:hover {
          color: #7ca971;
        }
      }
    }
    .search {
      position: relative;
      width: 100%;
      max-width: 400px;
      input {
        border: none;
        outline: none;
        width: calc(100% - 80px);
        padding: 15px 60px 15px 20px;
        margin: 0;
        border-radius: 20px;
        background-color: #efefef;
        font-family: "Segoe UI", Tahoma;
        font-size: 1rem;
      }
    }
  }
  </style>