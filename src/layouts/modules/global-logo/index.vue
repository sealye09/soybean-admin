<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({
  name: 'GlobalLogo',
});

withDefaults(defineProps<Props>(), {
  showTitle: true,
});

interface Props {
  /** Whether to show the title */
  showTitle?: boolean
}
</script>

<template>
  <RouterLink to="/" class="w-full flex-center nowrap-hidden">
    <SystemLogo class="text-32px text-primary" />

    <NGradientText v-show="showTitle" type="primary" class="pl-8px text-16px font-bold transition duration-300 ease-in-out">
      {{ $t('system.title') }}
    </NGradientText>
  </RouterLink>
</template>

<style scoped></style>
