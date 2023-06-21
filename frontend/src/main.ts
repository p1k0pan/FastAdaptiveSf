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
// import 'jquery/src/jquery.js';
// import 'popper.js/dist/popper.min.js';


import PrimeVue from 'primevue/config'
// import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';

// theme
import 'primevue/resources/themes/lara-light-indigo/theme.css'
// core
import 'primevue/resources/primevue.min.css'


import vuetify from './plugins/vuetify'



// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

// PrimeVue
Vue.use(PrimeVue)
// PrimeVue Toast
Vue.use(ToastService)


axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://127.0.0.1:8000/'; // 'http://localhost:5000/';  // the FastAPI backend
Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
