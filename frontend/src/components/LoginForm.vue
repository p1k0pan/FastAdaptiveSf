<!-- https://mdbootstrap.com/docs/standard/extended/login/#! -->
<template>
<div id="login" >

<form @submit.prevent="submit">
  <!-- Email input -->
  <div class="form-outline mb-4">
    <input type="email" id="username" name="username" v-model="form.username" class="form-control" />
    <label class="form-label" for="username">Email address</label>
  </div>

  <!-- Password input -->
  <div class="form-outline mb-4">
    <input type="password" id="password" name="password" v-model="form.password" class="form-control" />
    <label class="form-label" for="password">Password</label>
  </div>

  <!-- 2 column grid layout for inline styling -->
  <div class="row mb-4">
    <div class="col d-flex justify-content-center">
      <!-- Checkbox -->
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="" id="form2Example31" checked />
        <label class="form-check-label" for="form2Example31"> Remember me </label>
      </div>
    </div>

    <div class="col">
      <!-- Simple link -->
      <a href="#!">Forgot password?</a>
    </div>
  </div>

  <!-- Submit button -->
  <button type="submit" @click="submit" class="btn btn-primary btn-block mb-4">Sign in</button>

  <!-- Register buttons -->
  <div class="text-center">
    <p>Not a member? <a href="/register">Register</a></p>
    <p>or sign up with:</p>
    <button type="button" class="btn btn-link btn-floating mx-1">
      <i class="fab fa-facebook-f"></i>
    </button>

    <button type="button" class="btn btn-link btn-floating mx-1">
      <i class="fab fa-google"></i>
    </button>

    <button type="button" class="btn btn-link btn-floating mx-1">
      <i class="fab fa-twitter"></i>
    </button>

    <button type="button" class="btn btn-link btn-floating mx-1">
      <i class="fab fa-github"></i>
    </button>
  </div>
</form>
</div>
</template>

<script>
import { defineComponent } from 'vue';
//import { mapActions } from 'vuex';

export default defineComponent({
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password:'',
      }
    };
  },
  methods: {
    
    async submit() {
      try {
        const userForm = new FormData();
        userForm.append('user_name', this.form.username);
        userForm.append('password', this.form.password);

        this.$store.dispatch("logIn", userForm);

        if(this.$store.getters.isAuthenticated) {
          this.$router.push('/');

        } else {
          console.log("Login failed.")
        }
      } catch (error) {
          throw 'Error while logging in.';
      }

    }
  }
});
</script>
