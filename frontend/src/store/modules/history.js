import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
Vue.use(Vuex)


const state = {
    history: [],
    isHistoryValid: false,
    status_code: 0,

    allHistories: [],
};

const getters = {
  stateHistory: state => state.history,
  historyStatusCode: state => state.status_code,
  isHistoryValid: state => state.isHistoryValid,

  getAllHistories: state => state.allHistories,
};

const actions = {
    async setHistory(context, urls) {
        var history = Array();
        history = urls;

        context.commit('SET_HISTORY', history)
    },

    async patchHistory(context, data) {

        context.commit('SET_STATUS_CODE', "0")
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
        console.log("sending history to the backend ...")
        const url = endpoint;

        

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
                { headers: { 'Authorization': refresh_token }, 
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



    async allHistories(context, data) {
        var res = "0"
        const histories = {}


        const username = data["username"]
        const access_token = data["access_token"]
        const refresh_token = data["refresh_token"]
        console.log("access token")
        console.log(access_token)


        const endpoint = "/" + `user/history?user_name=` + String(username);
        console.log(endpoint)
        console.log("fetching all histories of this user ...")


        await axios
            .get(
                endpoint, 
                { headers: { 'Authorization': access_token }, 
                })
            .then((response) => {
            res = response.data["code"]
            console.log(res)
            console.log(response.data["message"])

            if (response.data) {
                // return success
                if (response.data["code"] === "200" || response.data["code"] === "201") {
                    var result = response.data["result"]

                    var counter = 1;
                    for (const [key, value] of Object.entries(result)) {
                        for (let i = 0; i < value.length; i++) {
                            value[i].index = value[i].index + 1;
                        }

                        var dict = {
                            date: key,
                            upload_number: counter,
                            sites: value,
                        };

                        
                        histories.push(dict);
                        counter = counter + 1;
                    }
                    
                    histories.push( 
                        {
                            date: '',
                            upload_number: '...',
                            sites: [],
                        },
                    );

                    console.log("get all histories: success!")
                    console.log(response.data["result"])
                    

                    /*example = {
                        '14.09.2023': 
                        [
                             {
                                "index": 0,
                                "title": "Apple - Fruits",
                                "url": "https://www.libertyprim.com/en/lexique-familles/103/apple-lexique-des-fruits.htm",
                                "content": "\nAn apple is a sweet, edible fruit produced by an apple tree (Malus domestic). In France, it is the most consumed edible fruit and the third in the planet. The main types of apples come from the domestic apple or common apple. The species of Malus Domestica has about 20,000 varieties and cultivars around the world. The fruit has a characteristic stocky shape and often spherical, it is eaten when ripe, raw, cooked, or dried. Its juice is drunk fresh or pasteurized. When fermented, it becomes cider. Associated with the fruit forbidden in the Book of Genesis, it often symbolizes original sin. The fruit we consume today is descended from the Malus Sieversii species; it has been consumed by humans since the Neolithic age in the Central. Kazakhstan claims its origin, but the apple was already consumed by the Chinese 3,000 years ago. From a botanical point of view, it is a complex fruit, something between the berry and the drupe, often called a false fruit. Because a real fruit is formed from the ovary of a flower. An apple's flesh is not derived from the ovary but instead it is a swollen receptacle (or part of the stem). The actual fruit is in the core, the bit we throw away. The same is true of pears. Its colors at maturity change from green to red, passing through a wide variety of intermediate shades: pale green, yellow, or orange. The success of this fruit is undisputed, because today there are more than 20,000 varieties of apples of which 7,000 are regularly cultivated across the globe. China, the United States and Poland are the three largest producers of apples. China harvests 44 million tons, the United States 4.6 million tons and Poland 3.6 million tons. The EU is also one of the leading producers, has increased its production by 33% on average for the past three years. France harvests 1.5 million tons."
                            },
                            {
                                "index": 1,
                                "title": "",
                                "url": "https://www.healthline.com/nutrition/10-health-benefits-of-apples",
                                "content": ""
                            },
                       ],
                    }; */
                }
                // reject errors & warnings
            }
            })
            .catch((error) => {
            console.log(error);
            });
        
            
      if(res === "401") {
        console.log("trying to refresh the token")

        
        await axios
            .patch(
                endpoint, 
                { headers: { 'Authorization': refresh_token }, 
                })
            .then((response) => {
            res = response.data["code"]

            if (response.data) {
                // return success
                if (response.data["code"] === "200" || response.data["code"] === "201") {
                    histories = response.data["result"]
                    console.log("get all histories: success!")
                    console.log(response.data["result"])
                }
                // reject errors & warnings
            }
            })
            .catch((error) => {
            console.log(error);
            });
        
      }

    if(res == "404") {
        console.log("file not exist")
            
    }

    if(res == "400") {
        console.log("not valid Json file")
            
    }
    
    if (Object.keys(histories).length > 0) {
        context.commit('SET_ALL_HISTORIES', histories)
    }
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

    SET_ALL_HISTORY(state, allHistories) {
        state.allHistories = allHistories;
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