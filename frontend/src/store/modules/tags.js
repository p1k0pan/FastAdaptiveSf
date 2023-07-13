import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
Vue.use(Vuex)


const state = {
    tags: [],
    loaded: false,
};

const getters = {
  stateTags: state => state.tags,
  tagsLoaded: state => state.loaded,
};

const actions = {

    async loadTags(context) {
      context.commit('SET_LOADED', false)

      var res = "0"
      console.log("loading home page tags ...");

      var selection = ["Technology", "Life", "Animal",]
      
      var results = []

      for(let i=0; i<selection.length; i++){
        var val = selection[i]
        var entry = {
            tag: val,
            sites: [],
        };

        var endpoint = "/"
        endpoint = endpoint + `random?tag=${val}`;
        console.log(endpoint)

        await axios.get(endpoint)
        .then(response => {
            console.log("tag request for " + val)
            console.log(response.data["code"])

            if(response.data["code"] === "200" || response.data["code"] === "201") {
                var data = response.data["result"]
                    this.results = [];
                    console.log(data)
              
                    var titles = data["title"];
                    var urls = data["urls"];
                    var thumbnails = data["thumbnail"];
                    var authors = data["authors"];
                    var timestamps = data["timestamp"];
                    var tags = data["tags"];
                    var texts = data["text"];
              
                    for (let i = 0; i < titles.length; i++) {
                      titles[i] = titles[i]
                      urls[i] = urls[i]
                      thumbnails[i] = (thumbnails[i] != "https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png") ? thumbnails[i] : "https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png"
                      authors[i] = JSON.stringify(authors[i])
                      timestamps[i] = timestamps[i]
                      tags[i] = JSON.stringify(tags[i])
                      texts[i] = texts[i]
              
                      var dict = {
                        id: i,
                        title: titles[i],
                        url: urls[i],
                        thumbnail: thumbnails[i],
                        authors: authors[i],
                        timestamp: timestamps[i],
                        tags: tags[i],
                        text: texts[i],
              
                        summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
                      };
              
                      entry["sites"].push(dict);
                    }
                    results.push(entry);
                }
         })
        .catch(error => {
            // Handle the error
            console.error(error);
        });
        } 

      console.log("list of loaded tagas")
      console.log(results)
      context.commit('SET_TAGS', results)
      context.commit('SET_LOADED', true)

    },

};

const mutations = {
    SET_TAGS(state, tags) {
        state.tags = tags
    },
    
    SET_LOADED(state, loaded) {
        state.loaded = loaded;
    },


    RESET_TAGS(state) {
        state.tags = [];
    },
};

export default {
  state,
  getters,
  actions,
  mutations
};