<template>
  <v-app id="azure-kubernetes-hackfest" dark>
    <v-navigation-drawer v-model="drawer" clipped fixed app>
      <v-list>
        <v-list-tile :to="{path: '/flights'}">
          <v-list-tile-action>
            <v-icon medium>flight</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>All flights</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{path: '/flights/ca'}">
          <v-list-tile-action>
            <v-icon medium>flight</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Canada</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{path: '/flights/us'}">
          <v-list-tile-action>
            <v-icon medium>flight</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>United States</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class="hidden-sm-and-down">Flight Tracker</v-toolbar-title>
      <v-spacer></v-spacer>
        <v-avatar size="22" tile>
          <img src="static/images/msft_logo_sm.png" alt="Microsoft">
        </v-avatar>&nbsp;&nbsp;&nbsp;
        <v-icon size="22" color="red">fas fa-heart</v-icon>
      <span class="hidden-sm-and-down">&nbsp;&nbsp;Open Source</span>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-layout justify-center align-center>
          <router-view/>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer app fixed>
      <v-layout row wrap justify-center>
        <v-flex xs12 p-8 text-xs-center white--text subheading>
          &copy;2018 <img
            src="static/images/msft_logo_sm.png"
            alt="Microsoft" height="14px"
          > Intelligent Cloud Global Blackbelt Team
        </v-flex>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Raleway:200,300,400,500');
@import url('https://use.fontawesome.com/releases/v5.0.13/css/all.css');


.container{
  padding: 0px;
  margin:0;
}
</style>

<script>
export default {
  data: () => ({
    drawer: true
  }),
  props: {
    source: String
  }
}
</script>