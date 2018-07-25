// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import VueAxios from 'vue-axios'
import VueAuthenticate from 'vue-authenticate'
import axios from 'axios'
import '../static/css/vuetify.min.css'

Vue.use(VueAxios, axios)

Vue.use(VueAuthenticate, {
  baseUrl: 'http://localhost:3000',
  storage: 'localStorage',
  loginUrl:'/login',
  signupUrl:'/register'
})

Vue.use(Vuetify, { theme: {
  primary: '#107C10',
  secondary: '#4DB6AC',
  accent: '#00796B',
  error: '#E81123',
  warning: '#FFB900',
  info: '#607D8B',
  success: '#00E676'
}})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
