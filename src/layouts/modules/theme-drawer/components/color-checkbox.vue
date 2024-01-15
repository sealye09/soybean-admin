<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({ name: 'ColorCheckbox' });

const props = withDefaults(defineProps<Props>(), {
  iconClass: 'text-14px',
});

interface Props {
  /** 颜色 */
  color: string;
  /** 是否选中 */
  checked: boolean;
  /** 图标的class */
  iconClass?: string;
}

const whiteColors = ['#ffffff', '#fff', 'rgb(255,255,255)'];
const isWhite = computed(() => whiteColors.includes(props.color));
</script>

<template>
  <div class="h-20px w-20px flex-center cursor-pointer rounded-2px shadow" :style="{ backgroundColor: color }">
    <icon-ic-outline-check v-if="checked" :class="[iconClass, isWhite ? 'text-gray-700' : 'text-white']" />
  </div>
</template>

<style scoped></style>
