// Store file handling user management related logic

import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
Vue.use(Vuex)


const state = {
  user: null, // the current user

  access_token: null, // access token
  refresh_token: null, // refresh token
};


const getters = {
  isAuthenticated: state => !!state.user,
  stateUser: state => state.user,

  getAccessToken: state => state.access_token,
  getRefreshToken: state => state.refresh_token,
};


const actions = {

  // Register a new user in the system
  async register(context, formDict) {
    const res = await context.dispatch('createUser', formDict);

    if (res === "200" || res === "201") {
      await context.dispatch('logIn', formDict);

    } else {
      console.log("could not log in: there was an error while creating a user during the user registration")

      // Commit the logout
      context.commit('LOGOUT')
    }
  },


  // Create a new user
  async createUser(context, formDict) {
    var res = "0"
    const username = formDict["username"]
    const password = formDict["password"]

    const endpoint = "/" + `user`;
    const headers = {
      //"Access-Control-Allow-Origin": "*",
      //"Content-Type": "application/json",
      // Authorization: 'Bearer ' + token //the token is a variable which holds the token
    };

    await axios
      .post(
        endpoint,
        {
          user_name: username,
          password: password,
          histories: null,
        },
        { headers })
      .then((response) => {
        console.log("Response:")
        console.log(response.data["code"])

        if (response.data) {
          res = response.data["code"]

          if (response.data["code"] === "200" || response.data["code"] === "201") {
            console.log("created user successfully!")
          }

          // reject errors & warnings
        }
      })
      .catch((error) => {
        console.log(error);
      });

    return res
  },


  // Log a user in
  async logIn(context, formDict) {
    var res = "0"
    const username = formDict["username"]
    const password = formDict["password"]

    const authorizationData = {
      username: username,
      access_token: null,
      refresh_token: null,
    }

    const endpoint = "/" + `login`;
    const headers = {
      // "Content-Type": "multipart/form-data",
      // Authorization: 'Bearer ' + token //the token is a variable which holds the token
    };

    await axios
      .post(
        endpoint,
        {
          user_name: username,
          password: password,
        },
        { headers })
      .then((response) => {

        if (response.data) {
          res = response.data["code"]

          if (response.data["code"] === "200" || response.data["code"] === "201") {
            console.log("user login successful!")

            var result = response.data["result"]
            console.log(result["access_token"])

            authorizationData["access_token"] = result["access_token"]
            authorizationData["refresh_token"] = result["refresh_token"]

          } else if (response.data["code"] === "400") {
            console.log("user login not successful!")

            if (response.data["message"] === "Invalid user name or user not found") {
              console.log("Invalid user name or user not found!")
            }

            if (response.data["message"] === "Invalid password") {
              console.log("Invalid password!")
            }

          }

          // reject errors & warnings
        }
      })

      .catch((error) => {
        console.log(error);
      });

    console.log("res:")
    console.log(res)
    if (res === "200" || res === "201") {
      // Commit the user to the store
      context.commit('SET_USER', authorizationData)

    } else {
      // Commit the logout
      context.commit('LOGOUT')

    }
  },


  // Refresh user authorization tokens
  async refreshTokens(context, authorizationData) {
    // Commit the new tokens to the store
    context.commit('SET_USER', authorizationData)
  },


  // User logout (remove the user locally)
  async logOut(context) {
    console.log("logging user out")

    // Commit the logout
    context.commit('LOGOUT')
  }

};


// Change the state variables of this store
const mutations = {
  SET_USER(state, authorizationData) {
    console.log("setting user state")
    state.user = authorizationData["username"];

    state.access_token = authorizationData["access_token"];
    state.refresh_token = authorizationData["refresh_token"];
  },

  LOGOUT(state) {
    console.log("removing user from state")
    state.user = null;

    state.access_token = null;
    state.refresh_token = null;
  },
};


export default {
  state,
  getters,
  actions,
  mutations
};