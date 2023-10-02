import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
Vue.use(Vuex)


const state = {
    tags: [],
    loaded: 0,
};

const getters = {
  stateTags: state => state.tags,
  tagsLoadingStatus: state => state.loaded,
};

const actions = {

    async loadTags(context) {
      context.commit('SET_LOADED', 0)

      var res = "0"
      console.log("loading home page tags ...");

      var selection = ["TECH", "WELLNESS"] // "Life", "Animal",
      
      var results = []

      for(let i=0; i<selection.length; i++){
        var val = selection[i]
        var entry = {
            tag: val,
            sites: [],
        };

        var endpoint = "/"
        endpoint = endpoint + `next_tag_story?tag=${val}`;
        console.log(endpoint)

        await axios.get(endpoint)
        .then(response => {
            console.log("tag request for " + val)
            console.log(response.data["code"])
            var message = response.data["message"]
            console.log("message")
            console.log(message)

            if(response.data["code"] === "200" || response.data["code"] === "201") {
                  var data = response.data["result"]
                  this.results = [];
                  console.log(data)

                  if(data !== undefined && data !== 'undefined' && data !== null) {
              
                    var titles = data["title"];
                    var urls = data["urls"];
                    var thumbnails = data["thumbnail"];
                    var authors = data["authors"];
                    var timestamps = data["timestamp"];
                    var tags = data["topic2"];
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
                }
         })
        .catch(error => {
            // Handle the error
            console.error(error);
        });
        } 

      console.log("list of loaded tagas")
      console.log(results)
      if (results.length > 0) {
        context.commit('SET_TAGS', results)
        context.commit('SET_LOADED', 1)
      } else {
        context.commit('SET_LOADED', -1)
      }

    },

    async loadUserTags(context, formDict) {
      context.commit('SET_LOADED', 0)
      const username = formDict["username"]
      var res = "0"
      console.log("loading home page tags ...");

      
        var results = []


        var endpoint = "/"
        endpoint = endpoint + `next_tag_story?user_name=${username}`;
        console.log(endpoint)

        await axios.get(endpoint)
        .then(response => {
            console.log("tag request for " + username)
            console.log(response.data["code"])
            var message = response.data["message"]
            console.log("message")
            console.log(message)

            if(response.data["code"] === "200" || response.data["code"] === "201") {
                  var data = response.data["result"]
                  this.results = [];
                  console.log(data)

                  if(data !== undefined && data !== 'undefined' && data !== null) {
              
                    var titles = data["title"];
                    var urls = data["urls"];
                    var thumbnails = data["thumbnail"];
                    var authors = data["authors"];
                    var timestamps = data["timestamp"];
                    var tags = data["topic2"];
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
              
                      // entry["sites"].push(dict);
                    }
                    results.push(entry);
                  }
                }
         })
        .catch(error => {
            // Handle the error
            console.error(error);
        });


      console.log("list of loaded tagas")
      console.log(results)
      if (results.length > 0) {
        context.commit('SET_TAGS', results)
        context.commit('SET_LOADED', 1)
      } else {
        context.commit('SET_LOADED', -1)
      }

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