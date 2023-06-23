import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
//import axios from 'axios';



import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Import Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


import PrimeVue from 'primevue/config'
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


Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
