<template>
  <v-app id="azure-kubernetes-hackfest" dark>
    <v-navigation-drawer v-model="drawer" clipped fixed app>
      <v-list v-if="$auth.isAuthenticated()">
        <v-list-tile :to="{path: '/'}">
          <v-list-tile-action>
            <v-icon medium>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Home</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{path: '/flights'}">
          <v-list-tile-action>
            <v-icon medium>flight</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Flights</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="logout">
          <v-list-tile-action>
            <v-icon medium>cancel</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Log out</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-list v-else>
        <v-list-tile :to="{path: '/login'}">
          <v-list-tile-action>
            <v-icon medium>fingerprint</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Log in</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{path: '/register'}">
          <v-list-tile-action>
            <v-icon medium>person_add</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Register</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <top/>
    <v-content>
      <v-container fluid fill-height>
        <v-layout justify-center align-center>
          <router-view/>
        </v-layout>
      </v-container>
    </v-content>
    <bottom/>

    <v-snackbar v-model="pageAlert" right top :timeout="timeout">
      {{ message }}
      <v-btn @click="pageAlert = false">
        Close
      </v-btn>
    </v-snackbar>

  </v-app>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Raleway:200,300,400,500');
@import url('https://use.fontawesome.com/releases/v5.0.13/css/all.css');


.container{
  padding: 8px;
  margin:0;
}

.container.grid-list-md .layout .flex{
  padding: 12px;
}
/* theme/color related */

/* top toolbar color */
.application .theme--dark.v-toolbar,.theme--dark .v-toolbar{background-color:#002050;}
/* bottom footer color */
.application .theme--dark.v-footer, .theme--dark .v-footer {background:#002050;}
/* left menu color */
.application .theme--dark.v-navigation-drawer, .theme--dark .v-navigation-drawer {background-color:#0078D4 !important;}
/* background/body color */
.application.theme--dark {background:#00BCF2;color:#fff;}
.v-form {background:#E6E6E6;color:#333; padding: 36px;}

.application .theme--dark.v-btn:not(.v-btn--icon):not(.v-btn--flat), .theme--dark .v-btn:not(.v-btn--icon):not(.v-btn--flat) {background-color:#107C10;}
.v-label {font-size: 18px;}

.v-label--active {font-size: 20px; font-weight:500;}
.v-label {color:#333 !important;}
input {color:#333 !important;}


.v-input__slot:hover:before{background-color:#107C10 !important}

.application .theme--dark.v-text-field .v-input__slot:before, .theme--dark .v-text-field .v-input__slot:before {
  background-color: #999;
}

.v-text-field .v-input__slot:after {
    background-color: #333;
    height: 1px;}
.v-messages__message{font-size:14px;}

.v-navigation-drawer>.v-list .v-list__tile--active .v-list__tile__title {
  color: #BAD80A;
}

.v-list__tile--active .v-list__tile__action:first-of-type .v-icon{
  color: #BAD80A;
}

.v-navigation-drawer>.v-list:not(.v-list--dense) .v-list__tile {font-size: 16px;}


.v-snack__wrapper{background-color:#6c6c6c;pointer-events:auto;box-shadow:0 3px 5px -1px rgba(0,0,0,.2),0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12)}


.application .theme--dark.v-card, .theme--dark .v-card { background-color: #333;}
.v-card__media {background-color: #777;}
/* .v-card__media__background {background-size: 200px 100px;} */
.headline{font-size: 16px !important; line-height: 10px !important}
.container.grid-list-md .layout .flex {padding:1px;}
.card-header{padding:10px; background-color:rgba(0, 0, 0, 0.5);;font-size: 22px; font-weight: 400;letter-spacing: normal!important;font-family: Raleway,sans-serif!important;}
#outercard{
   background-color: #fff; width:95%;
}
.md3{
  padding:3px;
}
</style>

<script>

import bottom from './components/layout/bottom.vue';
import top from './components/layout/top.vue';

export default {
  data: () => ({
    pageAlert: false,
    drawer: true,
    message: '',
    timeout: 25000
  }),
  created: function () {
    this.$root.$on('toast', (text) => {
        this.message = text;
        this.pageAlert = true
    })

    if (this.$auth.isAuthenticated()){
      //this.pageAlert = true;
    }
  },
  components: {
    bottom,
    top
  },
  props: {
    source: String
  },
  methods: {
    logout() {
      this.$auth.logout();
      this.$router.go('login');
    }
  }
}
</script>