import Vue from 'vue'
import Vuex from 'vuex'
import users from './modules/users'

Vue.use(Vuex)

export const store = new Vuex.Store({ // default
    modules: {
        users,
    },
})