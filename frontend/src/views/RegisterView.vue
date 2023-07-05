<template>
    <div>
      RegisterView

      <form @submit.prevent="submit">
        <div class="mb-3">
          <label for="username" class="form-label">Username:</label>
          <input type="text" name="username" v-model="form.username" class="form-control" />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password:</label>
          <input type="password" name="password" v-model="form.password" class="form-control" />
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  //import { mapActions } from 'vuex';
  
  export default defineComponent({
    name: 'Register',
    data() {
      return {
        form: {
          username: '',
          password: '',
        },
      };
    },
    methods: {

      async submit() {

        try {
          const userForm = new FormData();
          userForm.append('user_name', this.form.username);
          userForm.append('password', this.form.password);

          this.$store.dispatch("register", userForm);

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
  