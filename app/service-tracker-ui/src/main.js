import Vue from "vue"
import App from "./App"
import router from "./router/index"

import PaperDashboard from "./plugins/paperDashboard"
import "vue-notifyjs/themes/default.css"


import VueAppInsights from 'vue-application-insights'
 
Vue.use(VueAppInsights, {
  id: process.env.APPINSIGHTS_INSTRUMENTATIONKEY
})

Vue.use(PaperDashboard)

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount("#app")
