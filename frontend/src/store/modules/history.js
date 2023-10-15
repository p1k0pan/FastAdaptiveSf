// Store file handling user history related logic

import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
Vue.use(Vuex)


const state = {
    history: [], // list of links which make up the history to upload right now
    status_code: "0", // status code of the history upload --> either "0" or a specific number with a purpose (f.E. to display a loading icon)

    allHistories: [], // list of all of the users uploaded histories (for history management)
};


const getters = {
    stateHistory: state => state.history,
    historyStatusCode: state => state.status_code,

    getAllHistories: state => state.allHistories,
};


const actions = {

    // Set the history state temporarily to patch it later on with the next method
    async setHistory(context, urls) {
        var history = Array();
        history = urls;

        // Commit the temporary history to the store
        context.commit('SET_HISTORY', history)
    },


    // "Patch" the history --> upload it to the backend
    async patchHistory(context, data) {
        var historyUploaded = false
        context.commit('SET_STATUS_CODE', "0")
        var res = "0"

        const username = data["username"]
        const access_token = data["access_token"]
        const refresh_token = data["refresh_token"]

        console.log("history: ")
        console.log(state.history)

        const endpoint = "/" + `user`;
        console.log(endpoint)
        console.log("sending history to the backend ...")

        await axios
            .patch(
                endpoint,
                {
                    user_name: username,
                    upload_urls: state.history,
                },
                {
                    headers: { 'Authorization': access_token },
                })
            .then((response) => {
                console.log("after history has been patched then ...")
                res = response.data["code"]
                console.log(res)
                console.log(response.data["message"])

                if (response.data) {
                    if (response.data["code"] === "200" || response.data["code"] === "201") {
                        console.log("history uploaded successfully!")
                    }
                    // reject errors & warnings
                }
            })
            .catch((error) => {
                console.log(error);
            });


        // use the refresh token instead
        console.log(res)
        if (res === "401") {
            console.log("trying the refresh token")

            await axios
                .patch(
                    endpoint,
                    {
                        user_name: username,
                        upload_urls: state.history,
                    },
                    {
                        headers: { 'Authorization': refresh_token },
                    })
                .then((response) => {
                    res = response.data["code"]

                    if (response.data) {
                        if (response.data["code"] === "200" || response.data["code"] === "201") {
                            console.log("history uploaded successfully!")
                        }
                        // reject errors & warnings
                    }
                })
                .catch((error) => {
                    console.log(error);
                });

        }


        // Some more possible status codes
        if (res == "404") {
            res = "0"
            console.log("error 404 while trying to upload the history ...")
        }

        if (res == undefined || res == 'undefined' || res == null) {
            res = "0"
        }

        if (res !== "0" && res !== "402") {
            historyUploaded = true;
        }

        console.log("History uploaded? ")
        console.log(historyUploaded)

        // Commit the uploaded history to the store
        context.commit('SET_STATUS_CODE', res) // res might be 402 now
        context.commit('SET_HISTORY', state.history)
    },


    // Reset the local frontend history to prepare for another upload (because the current one has been uploaded successfully)
    async resetHistory(context) {
        // Commit the history reset to the store
        context.commit('RESET_HISTORY')
        console.log("history reset complete")
    },


    // Request all of a users uploaded histories for the history management
    async allHistories(context, data) {
        var res = "0"
        const histories = []

        const username = data["username"]
        const access_token = data["access_token"]
        const refresh_token = data["refresh_token"]

        const endpoint = "/" + `user/history?user_name=` + username;
        console.log(endpoint)
        console.log("fetching all histories of this user ...")

        await axios
            .get(
                endpoint,
                {
                    headers: { 'Authorization': access_token },
                })
            .then((response) => {
                res = response.data["code"]
                console.log(res)
                console.log(response.data["message"])

                if (response.data) {
                    if (response.data["code"] === "200" || response.data["code"] === "201") {
                        var result = response.data["result"]
                        console.log("result is ", result)

                        var counter = 1;
                        
                        // Convert the received histories of a user to a format which can be displayed in a datatable (list of dicts)
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

                        // Example of a specific uploaded history 
                        /*
                            example = {
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
                            }; 
                        */
                    }
                    // reject errors & warnings
                }
            })
            .catch((error) => {
                console.log(error);
            });


        // use the refresh token instead
        if (res === "401") {
            console.log("trying the refresh token")

            await axios
                .patch(
                    endpoint,
                    {
                        headers: { 'Authorization': refresh_token },
                    })
                .then((response) => {
                    res = response.data["code"]

                    if (response.data) {
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

        
        // Some more possible status codes
        if (res == "404") {
            console.log("file not exist")
        }

        if (res == "400") {
            console.log("not valid Json file")
        }

        // Commit all of a users uploaded history to the store (to display them later on history management)
        if (Object.keys(histories).length > 0) {
            context.commit('SET_ALL_HISTORIES', histories)
        }
    },


    // Delete a user history upload from the backend
    async deleteHistoryUpload(context, data) {
        var res = "0"

        const username = data["username"]
        const access_token = data["access_token"]
        const refresh_token = data["refresh_token"]

        const affectedUpload = data["affectedUpload"] // date, sites, upload_number
        var dateParts = affectedUpload["date"].split('.')
        var finalDate = affectedUpload["date"]

        if(dateParts.length === 3){
            var day = dateParts[0]
            var month = dateParts[1]
            var year = dateParts[2]
            finalDate = year + '-' + month + '-' + day;
        } else {
            console.log("could not format history upload date")
        }

        console.log("history to delete: ")
        console.log(affectedUpload["date"]) // original: 14.09.2023
        console.log(affectedUpload["sites"])
        console.log(affectedUpload["upload_number"])

        const endpoint = "/" + `user/history/delete?user_name=` + username + `&index=0&date_str=` + finalDate;
        console.log(endpoint)
        console.log("deleting a history upload from the backend ...")

        await axios
            .patch(
                endpoint,
                {
                    // nothing
                },
                {
                    headers: { 'Authorization': access_token },
                })
            .then((response) => {
                res = response.data["code"]
                console.log(res)
                console.log(response.data["message"])

                if (response.data) {
                    if (response.data["code"] === "200" || response.data["code"] === "201") {
                        console.log("history upload deleted successfully!")
                    }
                    // reject errors & warnings
                }
            })
            .catch((error) => {
                console.log(error);
            });


        // use the refresh token instead
        console.log(res)
        if (res === "401") {
            console.log("trying the refresh token")

            await axios
                .patch(
                    endpoint,
                    {
                        // nothing
                    },
                    {
                        headers: { 'Authorization': refresh_token },
                    })
                .then((response) => {
                    res = response.data["code"]

                    if (response.data) {
                        if (response.data["code"] === "200" || response.data["code"] === "201") {
                            console.log("history upload deleted successfully!")
                        }
                        // reject errors & warnings
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }

    },


    // Delete a single URL/Link from an uploaded user history (from the backend)
    async deleteHistoryURL(context, data) {
        var res = "0"
        
        const username = data["username"]
        const access_token = data["access_token"]
        const refresh_token = data["refresh_token"]

        const affected_upload_date = data["upload_date"]

        var dateParts = affected_upload_date.split('.')
        var finalDate = affected_upload_date

        if(dateParts.length === 3){
            var day = dateParts[0]
            var month = dateParts[1]
            var year = dateParts[2]
            finalDate = year + '-' + month + '-' + day;
            console.log("trying to delete a url from the history upload of the date: " + finalDate)
        } else {
            console.log("could not format history upload date")
        }

        const urlToDelete = data["urlToDelete"] // content, index, title, url

        console.log("affected history date: " + affected_upload_date)
        console.log("URL to delete from the user history: ")
        console.log(urlToDelete["content"])
        console.log(urlToDelete["index"])
        console.log(urlToDelete["title"])
        console.log(urlToDelete["url"])

        const endpoint = "/" + `user/history/delete?user_name=` + username + `&index=` + urlToDelete["index"];
        console.log(endpoint)
        console.log("deleting a single URL from a history upload in the backend ...")

        await axios
            .patch(
                endpoint,
                {
                    // nothing
                },
                {
                    headers: { 'Authorization': access_token },
                })
            .then((response) => {
                res = response.data["code"]
                console.log(res)
                console.log(response.data["message"])

                if (response.data) {
                    if (response.data["code"] === "200" || response.data["code"] === "201") {
                        console.log("URL from the affected history upload deleted successfully!")
                    }
                    // reject errors & warnings
                }
            })
            .catch((error) => {
                console.log(error);
            });


        // use the refresh token instead
        console.log(res)
        if (res === "401") {
            console.log("trying the refresh token")

            await axios
                .patch(
                    endpoint,
                    {
                        // nothing
                    },
                    {
                        headers: { 'Authorization': refresh_token },
                    })
                .then((response) => {
                    res = response.data["code"]

                    if (response.data) {
                        if (response.data["code"] === "200" || response.data["code"] === "201") {
                            console.log("URL from the affected history upload deleted successfully!")
                        }
                        // reject errors & warnings
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }

    },

};


// Change the state variables of this store
const mutations = {
    SET_STATUS_CODE(state, status_code) {
        state.status_code = status_code
    },

    SET_HISTORY(state, history) {
        state.history = history;
    },

    SET_ALL_HISTORIES(state, allHistories) {
        state.allHistories = allHistories;
    },

    RESET_HISTORY(state) {
        state.history = [];
    },
};


export default {
    state,
    getters,
    actions,
    mutations
};