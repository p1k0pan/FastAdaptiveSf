import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
Vue.use(Vuex)


const state = {
    history: [],
    isHistoryValid: false,
    status_code: 0,
};

const getters = {
  stateHistory: state => state.history,
  historyStatusCode: state => state.status_code,
  isHistoryValid: state => state.isHistoryValid,
};

const actions = {
    async setHistory(context, urls) {
        var history = Array();
        history = urls;

        context.commit('SET_HISTORY', history)
    },

    async patchHistory(context, data) {

        context.commit('SET_STATUS_CODE', 0)
        var res = "0"
        console.log("received uploaded file from component")

        const username = data["username"]
        const access_token = data["access_token"]
        const refresh_token = data["refresh_token"]
        console.log("access token")
        console.log(access_token)

        console.log("history: ")
        console.log(state.history)

        const endpoint = "/" + `user`;
        
        console.log(endpoint)
        const url = endpoint;

        
        console.log("iweik")
        console.log(JSON.stringify(access_token))
const headers = {
  'Authorization': JSON.stringify(access_token) //'Bearer your-token'
};

const data1 = {
    user_name: username,
    upload_urls: state.history,
};

axios.patch(url, data1, { headers })
  .then(response => {
    console.log("after then121211221")
    res = response.data["code"]
    console.log(res)
    console.log(response.data["message"])
    // Handle the response
    console.log(response.data);
  })
  .catch(error => {
    // Handle the error
    console.error(error);
  });

        await axios
            .patch(
                endpoint, 
                {
                    user_name: username,
                    upload_urls: state.history,
                },
                { headers: { 'Authorization': access_token }, 
                })
            .then((response) => {
            console.log("after then")
            res = response.data["code"]
            console.log(res)
            console.log(response.data["message"])

            if (response.data) {
                // return success
                if (response.data["code"] === "200" || response.data["code"] === "201") {
                // do something
                console.log("history uploaded successfully!")
                }
                // reject errors & warnings
            }
            })
            .catch((error) => {
            console.log(error);
            });
        
      console.log(res)
      if(res === "401") {
        console.log("trying to refresh the token")

        
        await axios
            .patch(
                endpoint, 
                {
                    user_name: username,
                    upload_urls: state.history,
                }, 
                { 
                    Authorization: refresh_token,
                })
            .then((response) => {
            res = response.data["code"]

            if (response.data) {
                // return success
                if (response.data["code"] === "200" || response.data["code"] === "201") {
                // do something
                console.log("history uploaded successfully!")
                }
                // reject errors & warnings
            }
            })
            .catch((error) => {
            console.log(error);
            });
        
      }

        if(res == "404") {
            
        }
        
        context.commit('SET_STATUS_CODE', res) // res might be 402 now
        context.commit('SET_HISTORY', state.history)
    },

    async resetHistory(context) {
        context.commit('RESET_HISTORY')
        console.log("history reset complete")
    },
};

const mutations = {
    SET_STATUS_CODE(state, status_code) {
        state.status_code = status_code
    },


    SET_HISTORY(state, history) {
        state.isHistoryValid = true;
        state.history = history;
    },

    RESET_HISTORY(state) {
        state.isHistoryValid = false;
        state.history = [];
    },
};

export default {
  state,
  getters,
  actions,
  mutations
};