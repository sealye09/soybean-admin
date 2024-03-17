<script setup lang="ts">
import { ref } from 'vue';

import { getDeptsByDepth } from '@/service';

const depth = ref<string>('0');

function request() {
  console.log('request');
  getDeptsByDepth(Number(depth.value));
}
</script>

<template>
  <div>
    <NCard>
      <NInput v-model:value="depth" />
      <NButton @click="request">
        获取
      </NButton>
      <NCalendar />
    </NCard>
  </div>
</template>

<style scoped></style>
