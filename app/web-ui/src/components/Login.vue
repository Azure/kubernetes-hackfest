<template>
    <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
            <v-flex xs2></v-flex>
            <v-flex xs8>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-text-field v-model="email" :rules="emailRules" label="E-mail" name="email" required></v-text-field>
                    <v-text-field v-model="password" :append-icon="show1 ? 'visibility_off' : 'visibility'" :rules="[rules.required, rules.min]" :type="show1 ? 'text' : 'password'" name="password" label="Password" counter @click:append="show1 = !show1"></v-text-field>
                    <v-btn :disabled="!valid" @click="submit">LOGIN</v-btn>
                </v-form>
            </v-flex>
            <v-flex xs2></v-flex>
        </v-layout>
    </v-container>
</template>

<script>

import axios from 'axios'
import async from 'async'

export default {
  data: () => ({
    show1: false,
    valid: true,
    email: "",
    emailRules: [
      v => !!v || "email required",
      v => /.+@.+/.test(v) || "valid email required"
    ],
    password: "",
    rules: {
      required: value => !!value || "password required",
      min: v => v.length >= 8 || "minimum 8 characters"
    }
  }),
  methods: {
    redirectToHome() {
      console.log('redirecting');
      this.$router.push({ path: '/' });
    },
    submit() {
      var formValid = this.$refs.form.validate();
      var router = this.$router;
      var auth = this.$auth;

      var _email = this.email;
      var _pass = this.password;

      async.waterfall([
        function(cb) {

          if (formValid){
            cb(null);
          }
          else{
            cb('Form Invalid');
          }

        },
        function(cb) {

          auth.login({_email, _pass}).then(function (data) {
            console.log('authenticated');
            cb(null, data);
          });
        }
      ], function (err, result) {
          console.log(err);

          console.log(result);

          router.push('/');
      });






      // if (this.$refs.form.validate()) {
      //     // console.log(this.email,':',this.password);
      //     var _email = this.email;
      //     var _pass = this.password;
          
      //     this.$auth.login({_email, _pass}).then(function (data) {
      //       //console.log(data);
      //       console.log('authenticated');
      //       this.$router.push('/flights');

      //     });
      // }
    },
    clear() {
      this.$refs.form.reset();
    }
  }
};
</script>