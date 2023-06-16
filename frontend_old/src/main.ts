// import { createApp } from 'vue'
// createApp(App).mount('#app')



//import vuetify from './plugins/vuetify'
//import Vuesax from 'vuesax'
//import 'vuesax/dist/vuesax.css' //Vuesax styles

//Import Bootstrap an BootstrapVue CSS files (order is important)
//import 'jquery/src/jquery.js'
//import 'bootstrap/dist/css/bootstrap.min.css'
//import 'bootstrap/dist/css/bootstrap.css'
//import 'bootstrap-vue/dist/bootstrap-vue.css'
//import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js'

//import 'bootstrap/dist/js/bootstrap.min.js'

//import { BootstrapVue } from 'bootstrap-vue' // , IconsPlugin 
//import BootstrapVue3 from 'bootstrap-vue-3'
// Import Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

//import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'


//import '@/assets/css/tailwind.css'
import axios from 'axios'
import VueAxios from 'vue-axios'

import PrimeVue from 'primevue/config';
//theme
import "primevue/resources/themes/lara-light-indigo/theme.css";     
    
//core
import "primevue/resources/primevue.min.css";

//import "primeicons/primeicons.css"; //icons

//import Vuetify from 'vuetify'
//import 'vuetify/dist/vuetify.min.css'

//import Vuesax from 'vuesax'
//import 'vuesax/dist/vuesax.css' //Vuesax styles

// "http://localhost:8000"

// Make Vuesax available throughout your project
//Vue.use(Vuesax)
// Make BootstrapVue available throughout your project
//Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
//Vue.use(IconsPlugin)

import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'

import router from './router'
//import store from './store'
//import './assets/main.css'

//eslint-disable-next-line
const app = createApp(App)
app.use(createPinia()) // Create the root store
app.use(router)
app.use(PrimeVue)
//app.use(Vuesax)
//app.use(BootstrapVue)
//app.use(IconsPlugin)
app.use(VueAxios, axios) // 👈

app.mount('#app')

//import "bootstrap/dist/js/bootstrap.js"
console.log(app)



/*app.config.warnHandler = function (msg, vm, trace) {
  msg, vm, trace = null
  return trace
}*/
//Vue.config.productionTip = false

/*app.config.globalProperties.$filters = {
    uppercase(value) {
      return value.toUpperCase()
    }
  }*/
//Vue.filter('uppercase', function (value){
//        return value.toUpperCase()
//});

// eslintrc.js
/*module.exports = {
  globals: {
    ref: true,
    reactive: true,
    computed: true,
  }
}*/