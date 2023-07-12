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
        console.log(access_token)

        console.log("history: ")
        console.log(state.history)

        const endpoint = "/" + `user`;

        await axios
            .patch(
                endpoint, 
                {
                    user_name: username,
                    upload_urls: state.history,
                }, 
                { 
                    Authorization: access_token,
                })
            .then((response) => {
            res = response.data["code"]

            if (response.data) {
                // return success
                if (response.status === 200 || response.status === 201) {
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
                if (response.status === 200 || response.status === 201) {
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