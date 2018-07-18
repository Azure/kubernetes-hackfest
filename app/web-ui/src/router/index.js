import Vue from 'vue'
import Router from 'vue-router'
import Flights from '@/components/Flights'
import UnitedStates from '@/components/UnitedStates'
import Canada from '@/components/Canada'
import Login from '@/components/Login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/flights',
      name: 'Flights',
      component: Flights
    },
    {
      path: '/flights/us',
      name: 'UnitedStates',
      component: UnitedStates
    },
    {
      path: '/flights/ca',
      name: 'Canada',
      component: Canada
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})
