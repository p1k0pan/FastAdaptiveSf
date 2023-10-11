import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store'
import axios from 'axios';

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Import Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Import PrimeVue
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice';
// Theme
import 'primevue/resources/themes/lara-light-indigo/theme.css'
// Core
import 'primevue/resources/primevue.min.css'

// Import Vuetify
import vuetify from './plugins/vuetify'
import 'vuetify/dist/vuetify.min.css'

import 'material-design-icons-iconfont/dist/material-design-icons.css'



// Some deployment variables and settings
var local = 'http://127.0.0.1:8000/';
var docker = 'http://localhost:5432/';
axios.defaults.baseURL = 'http://127.0.0.1:8000/'; // 'http://localhost:5000/';
axios.defaults.withCredentials = true;
Vue.config.productionTip = false



// Make BootstrapVue available throughout the project
Vue.use(BootstrapVue)
// Install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

// Use PrimeVue
Vue.use(PrimeVue)
// Use PrimeVue Toast
Vue.use(ToastService)



// Instantiate new Vue instance
new Vue({
  router,
  store,
  vuetify,
  
  render: (h) => h("frame", [h(App)]),
  created() {
    this.$store.dispatch("loadTags");
  },
}).$mount('#app')
