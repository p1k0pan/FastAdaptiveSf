<!-- A custom tooltip component -->
<template>
  <div class="custom-tooltip" v-if="showTooltip" @mouseleave="hideTooltip">
    <div class="tooltip-content" :style="tooltipStyle">
      {{ content }}
    </div>
  </div>
</template>





<script>

export default {
  props: {
    content: String,
    position: String,
  },
  
  data() {
    return {
      showTooltip: false,
      tooltipStyle: {},
    };
  },


  methods: {

    // Show the tooltip
    show() {
      this.showTooltip = true;
      this.calculateTooltipPosition();
    },

    // Hide the tooltip
    hideTooltip() {
      this.showTooltip = false;
    },

    // Get the position of the tooltip
    calculateTooltipPosition() {
      if (this.position === 'top') {
        this.tooltipStyle = { top: '-100%' };
      } else if (this.position === 'bottom') {
        this.tooltipStyle = { top: '100%' };
      }
    },

  },
};
</script>
  




<style scoped>

.custom-tooltip {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.tooltip-content {
  position: absolute;
  z-index: 1000;
  padding: 5px;
  background-color: #333;
  color: #fff;
  border-radius: 4px;
  white-space: nowrap;
}

</style>