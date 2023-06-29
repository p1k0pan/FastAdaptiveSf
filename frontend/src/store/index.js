import Vue from 'vue'
import Vuex from 'vuex'
import users from './modules/users'
import history from './modules/history'

Vue.use(Vuex)

export const store = new Vuex.Store({ // default
    modules: {
        users,
        history,
    },
})