<template>
  <div>
    <div
      class="main"
      style="bottom: 0;"
      >
      <b-row align-v="center" align-h="center" class="justify-content-md-center">
        <b-col></b-col>
        <b-col cols="6">

    <b-card class="" border-variant="dark">
    <b-card-title class="text-center custom-title">Sign up for the Adaptive Storyfinder!</b-card-title>
    <b-card-sub-title class="text-center">Browse articles according to your taste.</b-card-sub-title>
    <b-row class="mb-2"></b-row>
    
    <div>
    <b-form v-if="this.username.length < 1" @submit.stop.prevent>
      <label for="feedback-username">Username </label>
      <b-form-input v-model="username" :state="validationUsernameStatic" id="feedback-username"></b-form-input>
    </b-form>

    <b-form v-if="this.username.length > 0" @submit.stop.prevent>
        <label for="feedback-username">Username </label>
        <b-form-input v-model="username" :state="validationUsername" id="feedback-username"></b-form-input>

        <b-form-invalid-feedback :state="validationUsername">
        Your username must be 3-16 characters long.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validationUsername">
        This username is valid.
      </b-form-valid-feedback>
    </b-form>
    </div>
   
   <b-row class="mb-4"></b-row>


   <div v-if="!showPassword">
    <b-form v-if="this.password.length < 1" @submit.stop.prevent>
        <label for="feedback-password">Password</label>
        <span class="display-eye fa fa-eye-slash" @click="toggleShowPassword"></span>

        <b-form-input type="password" v-model="password" :state="validationPasswordStatic" id="feedback-password" aria-describedby="password-help-block"></b-form-input>
   </b-form>

    <b-form v-if="this.password.length > 0" @submit.stop.prevent>
        <label for="feedback-password">Password</label>
        <span class="display-eye fa fa-eye-slash" @click="toggleShowPassword"></span>

        <b-form-input type="password" v-model="password" :state="validationPassword" id="feedback-password" aria-describedby="password-help-block"></b-form-input>
        <b-form-invalid-feedback :state="validationPassword">
        Your username must be 6-20 characters long.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validationPassword">
        This password is valid.
      </b-form-valid-feedback>
    </b-form>
  </div>


  <div v-if="showPassword">
    <b-form v-if="this.password.length < 1" @submit.stop.prevent>
        <label for="feedback-password">Password</label>
        <span class="display-eye fa fa-eye-slash" @click="toggleShowPassword"></span>

        <b-form-input type="password" v-model="password" :state="validationPasswordStatic" id="feedback-password" aria-describedby="password-help-block"></b-form-input>
   </b-form>

    <b-form v-if="this.password.length > 0" @submit.stop.prevent>
        <label for="feedback-password">Password</label>
        <span class="display-eye fa fa-eye" @click="toggleShowPassword"></span>

        <b-form-input type="text" v-model="password" :state="validationPassword" id="feedback-password" aria-describedby="password-help-block"></b-form-input>
        <b-form-invalid-feedback :state="validationPassword">
        Your username must be 6-20 characters long.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validationPassword">
        This password is valid.
      </b-form-valid-feedback>
    </b-form>
  </div>


  
  <b-row class="mb-2"></b-row>

  <div class="extra">
    <span class="stay"> <input class="form-check-input" type="checkbox" id="checkbox" v-model="stayLoggedIn"/> Remember me? </span>
    <span class="reg"> Already have an account?   <a href="/login">Login</a> </span>
  </div>

  <b-row class="mb-4"></b-row>

  <div class="text-center">
    <b-button v-if="!validation" variant="outline-primary" size="lg" type="submit" disabled >Sign up</b-button>
    <b-button v-if="validation" variant="outline-primary" size="lg" type="submit" @click="submit" >Sign up</b-button>
  </div>


  <b-row class="mb-4"></b-row>


  <div class="separator"> or </div>

  
  <div class="text-center">
    <p class="mb-n1">Login with</p>

    <button type="button" class="btn btn-link btn-floating mx-1">
      <i class="fab fa-google"></i>
    </button>

    <button type="button" class="btn btn-link btn-floating mx-1">
      <i class="fab fa-github"></i>
    </button>

    <button type="button" class="btn btn-link btn-floating mx-1">
      <i class="fab fa-twitter"></i>
    </button>
    
    <button type="button" class="btn btn-link btn-floating mx-1">
      <i class="fab fa-facebook-f"></i>
    </button>
</div>



        </b-card>
        </b-col>

        <b-col></b-col>
      </b-row>
    </div>

  </div>
</template>



    

<script>
  import { defineComponent } from 'vue';
  //import { mapActions } from 'vuex';
  
  export default defineComponent({
    name: 'Register',
    data() {
      return {
        showPassword: false,
        stayLoggedIn: false,
        
        usernameValid: false,
        usernameExisting: false,
        passwordValid: false,

        username: '',
        password: '',
      };
    },

    computed: {
      usernameExisting() {
        // TODO: Check if it already exists

        return this.usernameExisting
      },


      validationUsername() {
        if(this.username.length > 2 && this.username.length < 17 && !this.usernameExisting) {
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
      },


      validation() {
        return this.usernameValid && this.passwordValid
      },

    },

    methods: {
      toggleShowPassword() {
        this.showPassword = !this.showPassword;
      },

      routeToLoginView() {
        this.$router.push('/login')
      },


      validationUsernameStatic() {
        return this.username.length > 2 && this.username.length < 17 && !this.usernameExisting
      },

      validationPasswordStatic() {
        return this.password.length > 5 && this.password.length < 21
      },


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
  

  <style scoped>
  .main {
    justify-content: center;
    vertical-align: middle;
    position: relative;
  }
  
  .display-eye {
  cursor:pointer;
  float: right;
  margin-top: 6px;
  margin-right: 1px;
  }
  
  .reg {
  float: right;
  }
  
  hr {
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .separator {
  display: flex;
  align-items: center;
  text-align: center;
  }
  
  .separator::before,
  .separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #000;
  }
  
  .separator:not(:empty)::before {
  margin-right: .25em;
  }
  
  .separator:not(:empty)::after {
  margin-left: .25em;
  }
  
  .custom-title {
  text-shadow:
    0px 1px 1px grey,
    0px 0px 0px grey;
  }
  
  </style>