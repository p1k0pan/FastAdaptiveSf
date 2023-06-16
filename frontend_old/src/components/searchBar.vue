<template>
    <div id="show-blogs">
        <h1>What would you like to know?</h1>
        <input type="text" v-model="search" placeholder="..." />
        <div v-for="blog in filteredBlogs" v-bind:key="blog" class="single-blog">
            <h2>{{ $filters.uppercase(blog.title) }}</h2>
            <article>{{ blog.body }}</article>
        </div>
    </div>
</template>

<script>
//import axios from "axios";

export default {
    data () {
        return {
            blogs: [],
            search: '',
        }
    },
    methods: {
    },
    created() { // mounted
        /*axios.get('http://jsonplaceholder.typicode.com/posts').then(function(data){
            console.log(this.blogs)
            this.blogs = data.body.slice(0,10);
        });*/
    },
    computed: {
        filteredBlogs: function(){
            return this.blogs.filter((blog) => {
                return blog.title.match(this.search);
            });
        },
    }
}
</script>

<style>
#show-blogs{
    max-width: 800px;
    margin: 0px auto;
}
.single-blog{
    padding: 20px;
    margin: 20px 0;
    box-sizing: border-box;
    background: #eee;
}
</style>
