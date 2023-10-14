<!-- Form to log a user into the system -->
<template>
  <div style="padding-top: 2%;">
    <div class="main" style="bottom: 0;">
      <b-row align-v="center" align-h="center" class="justify-content-md-center">

        <b-col></b-col>

        <b-col cols="6">
          <b-card class="custom-card" border-variant="dark">
            <b-card-title class="text-center">Welcome back!</b-card-title>
            <b-row class="mb-2"></b-row>

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

            <div class="separator"> or </div>

            <b-form @submit.stop.prevent>
              <label for="username">Username </label>
              <b-form-input v-model="username" id="username"></b-form-input>
            </b-form>

            <b-row class="mb-2"></b-row>

            <div class="extra">
              <span class="rightSpan"> <b-button variant="link" @click="forgotUsername">Forgot username?</b-button>
              </span>
            </div>

            <b-row class="mb-4"></b-row>
            <b-row class="mb-4"></b-row>
            <b-row class="mb-4"></b-row>

            <div v-if="!showPassword">
              <b-form @submit.stop.prevent>
                <label for="password">Password</label>
                <span class="display-eye fa fa-eye-slash" @click="toggleShowPassword"></span>

                <b-form-input type="password" v-model="password" id="password"
                  aria-describedby="password-help-block"></b-form-input>
              </b-form>
            </div>

            <div v-else>
              <b-form @submit.stop.prevent>
                <label for="password">Password</label>
                <span class="display-eye fa fa-eye" @click="toggleShowPassword"></span>

                <b-form-input type="text" v-model="password" id="password"
                  aria-describedby="password-help-block"></b-form-input>
              </b-form>
            </div>

            <b-row class="mb-2"></b-row>

            <div class="extra">
              <span class="checkboxSpan"> 
                <input class="form-check-input" type="checkbox" id="checkbox"
                  v-model="stayLoggedIn">
                  Remember me? 
                </span>
              <span class="rightSpan"> <b-button variant="link" @click="forgotPassword">Forgot password?</b-button>
              </span>
            </div>

            <b-row class="mb-4"></b-row>
            <b-row class="mb-4"></b-row>

            <div class="text-center">
              <b-button variant="outline-primary" type="submit" size="lg" @click="submit">Login</b-button>
            </div>

            <b-row class="mb-4"></b-row>
            <b-row class="mb-4"></b-row>

            <div class="text-center">
              <span class=""> No account yet? <b-button variant="link" @click="routeToRegisterView">Sign up</b-button>
              </span>
            </div>

            <b-row class="mb-2"></b-row>
            <b-row class="mb-2"></b-row>

          </b-card>
        </b-col>

        <b-col></b-col>

      </b-row>
    </div>

  </div>
</template>





<script>
// Imports
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Login',

  components: {
    //nothing
  },

  data() {
    return {
      showPassword: false,
      stayLoggedIn: false,

      username: '',
      password: '',
    };
  },

  methods: {
    // Show or hide the password
    toggleShowPassword() {
      this.showPassword = !this.showPassword;
    },

    forgotUsername() {
      // nothing (not relevant)
    },

    forgotPassword() {
      // nothing (not relevant)
    },

    // Redirect to the register form
    routeToRegisterView() {
      this.$router.push('/register')
    },

    // Submit the login form
    async submit() {
      const formDict = {
        username: this.username,
        password: this.password,
      }

      try {
        await this.$store.dispatch("logIn", formDict);

        console.log("isAuthenticated:")
        if (this.$store.getters.isAuthenticated) {
          this.$router.push('/');

          this.$store.dispatch("loadUserTags", formDict);
          console.log("login status is true")

        } else {
          console.log("Login failed.")
        }
      } catch (error) {
        throw 'Error while logging in.';
      }
    },

  }

});
</script>





<style scoped>

.main {
  justify-content: center;
  vertical-align: middle;
  position: relative;
}

.display-eye {
  cursor: pointer;
  margin-top: 6px;
  margin-right: 1px;
  margin-left: 10px;
}

.rightSpan {
  float: right;
}

.checkboxSpan {
  margin-top: 10px;
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

.custom-card .card-title {
  text-shadow:
    0px 1px 1px grey,
    0px 0px 0px grey;
}



hr {
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

</style>