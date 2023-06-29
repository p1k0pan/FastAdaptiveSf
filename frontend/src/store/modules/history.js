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
    async setHistory(context, file) {
        console.log("received uploaded file from component")
        var testUser = {}

        var history = Array();
        history = file.urls;
        console.log("history: ")
        console.log(history)

        //const formData = new FormData();
        const data = JSON.stringify({
            user_name: testUser,
            upload_urls: history
        })
        const endpoint = "/" + `user`;
        const headers = { 
            // "Content-Type": "multipart/form-data",
            // Authorization: 'Bearer ' + token //the token is a variable which holds the token
        };

        await axios
            .patch(endpoint, data, { headers })
            .then((response) => {

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