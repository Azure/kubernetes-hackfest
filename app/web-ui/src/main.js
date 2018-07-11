// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
//import 'vuetify/dist/vuetify.min.css'
import '../static/css/vuetify.min.css'

Vue.use(Vuetify, { theme: {
  primary: '#85f48a',
  secondary: '#4DB6AC',
  accent: '#00796B',
  error: '#FF8A80',
  warning: '#ffeb3b',
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
