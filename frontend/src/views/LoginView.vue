<template>
    <div>
      LoginView
      <LoginForm />

    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  import LoginForm from "@/components/LoginForm.vue";
  
  export default defineComponent({
    name: 'Login',

    components: {
        LoginForm,
    },

    data() {
      return {
      };
    },

    methods: {
    },

  });
  </script>
  