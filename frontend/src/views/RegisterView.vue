<template>
    <div>
      RegisterView

      <b-form  @submit.stop.prevent>
        <label for="feedback-user">Username </label>
        <b-form-input v-model="username" :state="validationUsername" id="feedback-user"></b-form-input>
        <b-form-invalid-feedback :state="validationUsername">
        Your username must be 3-16 characters long.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validationUsername">
        This username is valid.
      </b-form-valid-feedback>
     </b-form>


     <b-form  @submit.stop.prevent>
        <label for="feedback-password">Password</label>
        <b-form-input type="password" v-model="password" :state="validationPassword" id="feedback-password" aria-describedby="password-help-block"></b-form-input>
        <b-form-invalid-feedback :state="validationPassword">
        Your username must be 6-20 characters long.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validationPassword">
        This password is valid.
      </b-form-valid-feedback>
     </b-form>

     <b-button v-if="!validation" variant="outline-primary" type="submit" disabled >Sign up</b-button>
     <b-button v-if="validation" variant="outline-primary" type="submit" @click="submit" >Sign up</b-button>


    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  //import { mapActions } from 'vuex';
  
  export default defineComponent({
    name: 'Register',
    data() {
      return {
        usernameValid: false,
        passwordValid: false,

        username: '',
        password: '',
      };
    },

    computed: {
      validationUsername() {
        var nonExistant = true // TODO: Check if it already exists

        if(this.username.length > 2 && this.username.length < 17 && nonExistant) {
          this.usernameValid = true
          return true

        } else {
          this.usernameValid = false
          return false
        }
      },

      validationPassword() {
        if(this.password.length > 5 && this.password.length < 21) {
          this.passwordValid = true
          return true

        } else {
          this.passwordValid = false
          return false
        }
        return this.password.length > 5 && this.password.length < 21
      },


      validation() {
        return this.usernameValid && this.passwordValid
      },
    },

    methods: {
      
      async submit() {
        const formDict = {
          username: this.username,
          password: this.password,
        }

        try {
          this.$store.dispatch("register", formDict);

          if(this.$store.getters.isAuthenticated) {
            this.$router.push('/');

          } else {
            console.log("Sign Up failed.")
          }
        } catch (error) {
          throw 'Error while signing up.';
        }

      },
    },
  });
  </script>
  