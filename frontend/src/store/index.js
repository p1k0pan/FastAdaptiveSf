import Vue from 'vue'
import Vuex from 'vuex'
import users from './modules/users'
import history from './modules/history'
import tags from './modules/tags'

Vue.use(Vuex)

export const store = new Vuex.Store({
    modules: {
        users,
        history,
        tags,
    },
})