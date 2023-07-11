import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
Vue.use(Vuex)


const state = {
    history: [],
    isHistoryValid: false,
};

const getters = {
  stateHistory: state => state.history,
  isHistoryValid: state => state.isHistoryValid,
};

const actions = {
    async setHistory(context, data) {
        var res = 0
        console.log("received uploaded file from component")

        const username = data["username"]
        const access_token = data["access_token"]
        const refresh_token = data["refresh_token"]
        console.log(access_token)

        var history = Array();
        history = data["file"].urls;
        console.log("history: ")
        console.log(history)

        /*const data = JSON.stringify({
            user_name: testUser,
            upload_urls: history
        })*/
        const endpoint = "/" + `user`;
        const headers = { 
            // "Content-Type": "multipart/form-data",
            // Authorization: 'Bearer ' + token //the token is a variable which holds the token
        };

        await axios
            .patch(
                endpoint, 
                {
                    user_name: username,
                    upload_urls: history,
                }, 
                { 
                    Authorization: access_token,
                })
            .then((response) => {
            res = response.status

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


        context.commit('SET_HISTORY', history)
    },

    async resetHistory(context) {
        context.commit('RESET_HISTORY')
        console.log("history reset complete")
    },
};

const mutations = {
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