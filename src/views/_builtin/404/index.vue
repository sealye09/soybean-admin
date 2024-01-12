<script setup lang="ts">
import { computed } from 'vue';

import { useThemeStore } from '@/store/modules/theme';

const themeStore = useThemeStore();

const primaryColor = computed(() => themeStore.themeColors.primary);
</script>

<template>
  <ExceptionBase type="404" :color="primaryColor" />
</template>

<style scoped></style>
