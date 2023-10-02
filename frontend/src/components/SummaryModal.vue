<template>
  <div class="modal">
    <div class="modal-inner">      
      <button @click="close">&times;</button>
      <p>Hello World!</p>      
    </div>
  </div>
</template>



<script>
export default {  
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>


<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: lightseagreen;
}
.modal-inner {  
  background-color: white;
  border-radius: 0.5em;
  padding: 2em;
  margin: auto;
}
</style>