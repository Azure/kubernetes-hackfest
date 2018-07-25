<template>
    <v-card name="outercard" id="outercard">
        <v-container fluid>
        <v-layout row wrap>
            <v-flex v-for="(card, index) in sources" :key="index" v-bind="{ [`md${card.flex}`]: true }">
                <v-card>
                    <v-card-media v-bind:src="card.img" height="200px" contain>
                        <v-container fluid pa-2>
                            <v-layout>
                                <v-flex xs12 align-end flexbox>
                                    <h3 class="card-header">{{ card.title }}</h3>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-media>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn :href='card.link' :target='card.target' icon>
                            <v-icon>{{ card.icon }}</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
             </v-flex>
        </v-layout>
    </v-container>
    </v-card>
</template>

<script>

import axios from 'axios'

export default {
  data: () => ({
      sources:[]
  }),
  methods: {
  },
  created: function () {
    if (!this.$auth.isAuthenticated()){
        this.$router.push({ path: '/login' });
    }

    fetch('static/data/sources.json')
      .then(r => r.json())
      .then(json => {
        this.sources = json
      })
  },
}
</script>