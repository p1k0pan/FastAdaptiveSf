import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import TestView from '../views/testSearch.vue'
import TestView_copy from '../views/testSearch_copy.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    /*beforeEnter: (to, from, next) => {
      // Call your function here
      console.log("entering home page")

    }, */
  },
  {
    path: '/searchtest',
    name: 'SearchTest',
    component: TestView
  },
  {
    path: '/searchtest_copy',
    name: 'SearchTest_copy',
    component: TestView_copy
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
