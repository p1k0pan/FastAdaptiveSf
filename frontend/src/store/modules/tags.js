// Store file handling tag/topic (same concept) related logic

import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
Vue.use(Vuex)


const state = {
  random_tags: [], // list of general, randomly chosen tags (because of the performance/ loading time currently just tags for ["TECH", "WELLNESS"])
  user_tags: [], // list of articles which are related to the users favorite tags
  loaded: 0, // state of the tag loading process --> -1, 0 or 1 (f.E. to display a loading icon)
};


const getters = {
  stateRandomTags: state => state.random_tags,
  stateUserTags: state => state.user_tags,
  stateBothTags: state => state.user_tags.concat(state.random_tags),
  tagsLoadingStatus: state => state.loaded,
};


const actions = {

  // Request general tags to display as recommendations (just two predefined ones, because it would take too much loading time otherwise)
  async loadTags(context) {
    context.commit('SET_RANDOM_TAGS', [])
    context.commit('SET_LOADED', 0)

    var res = "0"
    console.log("loading home page tags ...");

    // Just load two of the topics, because they are pre-calculated in the backend server (making a random selection would take too much time locally)
    var selection = ["TECH", "WELLNESS"]

    var results = []

    for (let i = 0; i < selection.length; i++) {
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

          if (response.data["code"] === "200" || response.data["code"] === "201") {
            var data = response.data["result"]
            this.results = [];
            console.log(data)

            if (data !== undefined && data !== 'undefined' && data !== null) {

              var titles = data["title"];
              var urls = data["urls"];
              var thumbnails = data["thumbnail"];
              var authors = data["authors"];
              var timestamps = data["timestamp"];
              var tags = data["topic2"];
              var texts = data["text"];

              // Convert the tags/topics into a format which is suitable for the frontend (a list of dicts)
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

                  // not used anymore
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


    // Create some mock data for testing
    var mock = false
    if (mock) {

      var testTagsData = [
        {
          tag: "TECH",
          sites: [
            {
              id: 9,
              title: "2 Is Your Loyalty Program Rewarding the Right Customers?",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
            {
              id: 10,
              title: "3 Is Your Loyalty Program Rewarding the Right Customers?",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
            {
              id: 8,
              title: "4 Is Your Loyalty Program Rewarding the Right Customers?",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
            {
              id: 9,
              title: "5 Is Your Loyalty Program Rewarding the Right Customers?",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
            {
              id: 10,
              title: "6 Is Your Loyalty Program Rewarding the Right Customers?",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['Food', 'Beverly Hills', 'Recipe']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
          ],
        },

        {
          tag: "WELLNESS",
          sites: [
            {
              id: 0,
              title: "Going Down the Restaurant Memory Lane of My Childhood",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
              authors: `"['Danna Reich Colman', 'Danna Reich Colman', 'Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['TECH', 'BUSINESS']"`,
              text: "Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlaboreetdoloremagnaaliquyamerat,seddiamvoluptua.Atveroetaccusametjustoduodoloresetearebum.Stetclitakasdgubergren,noseatakimatasanctusestLoremipsumdolorsitamet.Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlaboreetdoloremagnaaliquyamerat,seddiamvoluptua.Atveroetaccusametjustoduodoloresetearebum.Stetclitakasdgubergren,noseatakimatasanctusestLoremipsumdolorsitam",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
            {
              id: 1,
              title: "I ordered chole bhature and received customer experience in return",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['TECH']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
            {
              id: 2,
              title: "Is Your Loyalty Program Rewarding the Right Customers?",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['TECH', 'BUSINESS']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
          ],
        },
      ]

      var testTagsData2 = [
        {
          tag: "USER-PREF",
          sites: [
            {
              id: 1,
              title: "Special User menu 2",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['TECH']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
            {
              id: 2,
              title: "Just for user",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['TECH', 'BUSINESS']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
          ],
        },
      ]

      context.commit('SET_USER_TAGS', testTagsData2)
      results = testTagsData
    }


    console.log("list of loaded random tagas")
    console.log(results)

    // Commit the general tags to the store
    if (results.length > 0) {
      context.commit('SET_RANDOM_TAGS', results)
      context.commit('SET_LOADED', 1)

    } else {
      context.commit('SET_LOADED', -1)

    }
  },


  // Request some related articles specifically suited for the current user and its preferences (depending on its favorite tags/topics)
  async loadUserTags(context, formDict) {
    context.commit('SET_USER_TAGS', [])
    context.commit('SET_LOADED', 0)

    const username = formDict["username"]

    var res = "0"
    console.log("loading home page tags ...");

    var results = []
    var entry = {
      tag: "USER-PREF",
      sites: [],
    }

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

        if (response.data["code"] === "200" || response.data["code"] === "201") {
          var data = response.data["result"]
          this.results = [];
          console.log(data)

          if (data !== undefined && data !== 'undefined' && data !== null) {
            var titles = data["title"];
            var urls = data["urls"];
            var thumbnails = data["thumbnail"];
            var authors = data["authors"];
            var timestamps = data["timestamp"];
            var tags = data["topic2"];
            var texts = data["text"];

            // Convert the tags/topics into a format which is suitable for the frontend (a list of dicts)
            for (let i = 0; i < titles.length; i++) {
              titles[i] = titles[i]
              urls[i] = urls[i]
              thumbnails[i] = (thumbnails[i] != "https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png") ? thumbnails[i] : "https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png"
              authors[i] = authors[i] // JSON.stringify(
              timestamps[i] = timestamps[i]
              tags[i] = tags[i] // JSON.stringify(
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

                // not used anymore
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


    // Create some mock data for testing
    var mock = false
    if (mock) {

      var testTagsData = [
        {
          tag: "USER-PREF",
          sites: [
            {
              id: 1,
              title: "Special User menu 2",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['TECH']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
            {
              id: 2,
              title: "Just for user",
              url: "https://medium.com/p/c00c8cca394a",
              thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png',
              authors: `"['Danna Reich Colman']"`,
              timestamp: "2016-06-30 06:54:17.528000+00:00",
              tags: `"['TECH', 'BUSINESS']"`,
              text: "text1",

              summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
          ],
        },
      ]

      results = testTagsData
    }


    console.log("list of loaded user tagas")
    console.log(results)

    // Commit the user specific favorite tag related articles to the store
    if (results.length > 0) {
      context.commit('SET_USER_TAGS', results)
      context.commit('SET_LOADED', 1)

    } else {
      context.commit('SET_LOADED', -1)
    }

  },

};


// Change the state variables of this store
const mutations = {
  SET_RANDOM_TAGS(state, tags) {
    state.random_tags = tags
  },

  SET_USER_TAGS(state, tags) {
    state.user_tags = tags
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