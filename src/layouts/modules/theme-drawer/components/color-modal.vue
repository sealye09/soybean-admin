<script setup lang="ts">
import { useClipboard } from '@vueuse/core';

import { useThemeStore } from '@/store';
import { traditionColors } from '@/theme/color';

import ColorCheckbox from './color-checkbox.vue';

defineOptions({ name: 'ColorModal' });

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { copy } = useClipboard();
const themeStore = useThemeStore();

function handleClose() {
  emit('close');
}

function copyColor(color: string) {
  copy(color);
  window.$message?.success('颜色复制成功');
}
</script>

<template>
  <n-modal
    class="h-480px w-640px"
    preset="card"
    mask-closable
    :show="visible"
    @close="handleClose"
    @mask-click="handleClose"
  >
    <div class="flex-x-center">
      <n-gradient-text type="primary" :size="24">
        中国传统颜色
      </n-gradient-text>
    </div>
    <n-tabs>
      <n-tab-pane v-for="item in traditionColors" :key="item.label" :name="item.label" :tab="item.label">
        <n-grid :cols="8" :x-gap="16" :y-gap="8">
          <n-grid-item v-for="i in item.data" :key="i.label">
            <ColorCheckbox
              class="!h-36px !w-full !rounded-4px"
              :color="i.color"
              :checked="i.color === themeStore.themeColor"
              icon-class="text-20px"
              @click="() => copyColor(i.color)"
            />
            <p class="text-center">
              {{ i.label }}
            </p>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>
    </n-tabs>
  </n-modal>
</template>

<style scoped></style>
