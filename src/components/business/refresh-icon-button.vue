<script setup lang="ts">
const props = defineProps<{
  loading: boolean;
}>();

const emits = defineEmits<{
  (e: 'refresh'): void;
}>();

function handleRefresh() {
  emits('refresh');
}
</script>

<template>
  <NButton ghost circle type="primary" @click="handleRefresh">
    <template #icon>
      <SvgIcon icon="lucide:refresh-cw" :class="{ 'animate-spin': props.loading }" />
    </template>
  </NButton>
</template>

<style scoped>
</style>
