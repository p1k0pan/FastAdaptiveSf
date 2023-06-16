<script setup>
import { useHomeStore } from "../store/modules/home";
//import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

const { results, loading, error } = storeToRefs(useHomeStore())
const { fetchSearchResults } = useHomeStore()

fetchSearchResults("test")
</script>

<template>
  <div id="show-results" class="divide-y divide-gray-200">
    <div class="top-bar">
    <div class="d-md-flex d-block flex-row mx-md-auto mx-0">
            <div class="search">
                <input type="text" placeholder="Search ..." v-model.trim="searchValue" @keyup="fetchSearchResults"/>
                <i class="fas fa-search"></i>
            </div>
    </div>
    </div>
    
    
    
    <div class="container">

      <p v-if="loading">Loading posts...</p>
      <p v-if="error">{{ error.message }}</p>
      
      <div class="row">

        <div class="col-md-auto">
          
          <div class="container">
          </div>

        </div>

        <div class="col-8" v-if="results">
          <div class="container">
            <ul class="list-group">
              <li class="py-12" v-for="(item) in results" :key="item">

                <div class="card text-bg-white mb-3" style="max-width: 700px;">
                  <div class="row g-0">
                    <div class="col-md-4">
                      <img :src="item.thumbnail" class="img-fluid rounded-start" alt="...">
                    </div>
                    <div class="col-md-8">
                      <div class="card-header ">Header</div>
                      <div class="card-body">
                        <h5 class="card-title"> {{ item.title }}</h5>
                        <p class="card-text"> {{ item.views }} </p>
                        <p class="card-text"><small class="text-body-secondary"> {{ item.date }}</small></p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="col-8" v-else>
          No results found for {{ searchValue }}
        </div>

        <div class="col col-lg-2">

          Recommendations

        </div>
      </div>

      <div class="row">
        <div class="col">

        </div>
      </div>
    </div>


    



    <div class="container">

    </div>
    
  </div>
</template>



<script>
// Imports
//import axios from "axios";
//import wikihowapi_pk as wha
import { defineComponent } from "vue";
//import { onMounted, reactive } from "vue";

export default defineComponent({
    name: "showResults",
    components: {
    },
    data: () => {
      return {
        results: [],
        searchValue: "",
      };
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
ul {
  list-style-type: none;
}

.card-img{
   width: 100%!important;
   height: 200px!important;
   object-fit: cover;
}

p {
  margin-bottom: 20px;
  font-size: 20px;
}
button {
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  margin-left: 20px;
  border-radius: 5px;
  color: white;
}

button.increase {
  background-color: green;
}

button.decrease {
  background-color: red;
}

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