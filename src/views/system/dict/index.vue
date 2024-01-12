<script setup lang="ts">
import { onActivated } from 'vue';

console.log('setup');

onActivated(() => {
  console.log('onActivated');
});
</script>

<template>
  <div class="text-18px text-red">
    dict
    <LookForward />
  </div>
</template>

<style scoped></style>
