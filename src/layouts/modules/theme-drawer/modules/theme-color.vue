<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';
import { colors } from '@/theme/color';

import ColorModal from '../components/color-modal.vue';
import SettingItem from '../components/setting-item.vue';

defineOptions({
  name: 'ThemeColor',
});

const themeStore = useThemeStore();

const modalVisible = ref<boolean>(false);

function handleUpdateColor(color: string, key: App.Theme.ThemeColorKey) {
  console.log(color, key);
  themeStore.updateThemeColors(key, color);
}
</script>

<template>
  <NDivider>{{ $t('theme.themeColor.title') }}</NDivider>
  <div class="flex-vertical-stretch gap-12px">
    <SettingItem v-for="(_, key) in themeStore.themeColors" :key="key" :label="$t(`theme.themeColor.${key}`)">
      <template v-if="key === 'info'" #suffix>
        <NCheckbox v-model:checked="themeStore.isInfoFollowPrimary">
          {{ $t('theme.themeColor.followPrimary') }}
        </NCheckbox>
      </template>

      <div class="w-100px">
        <n-color-picker
          :value="themeStore.themeColors[key]"
          :disabled="key === 'info' && themeStore.isInfoFollowPrimary"
          :swatches="colors"
          @update:value="handleUpdateColor($event, key)"
        />
      </div>
    </SettingItem>

    <NButton type="primary" @click="modalVisible = true">
      更多颜色
    </NButton>

    <ColorModal :visible="modalVisible" @close="modalVisible = false" />
  </div>
</template>

<style scoped></style>
