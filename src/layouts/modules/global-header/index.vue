<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import { computed } from 'vue';

import { useAppStore } from '@/store/modules/app';
import { useRouteStore } from '@/store/modules/route';
import { useThemeStore } from '@/store/modules/theme';

import { useMixMenuContext } from '../../hooks/use-mix-menu';
import GlobalBreadcrumb from '../global-breadcrumb/index.vue';
import GlobalLogo from '../global-logo/index.vue';
import HorizontalMenu from '../global-menu/base-menu.vue';

import ThemeButton from './components/theme-button.vue';
import UserAvatar from './components/user-avatar.vue';

defineOptions({
  name: 'GlobalHeader',
});
defineProps<Props>();

const appStore = useAppStore();
const themeStore = useThemeStore();
const routeStore = useRouteStore();
const { isFullscreen, toggle } = useFullscreen();
const { menus } = useMixMenuContext();

interface Props {
  /** Whether to show the logo */
  showLogo?: App.Global.HeaderProps['showLogo']
  /** Whether to show the menu toggler */
  showMenuToggler?: App.Global.HeaderProps['showMenuToggler']
  /** Whether to show the menu */
  showMenu?: App.Global.HeaderProps['showMenu']
}

const headerMenus = computed(() => {
  if (themeStore.layout.mode === 'horizontal')
    return routeStore.menus;

  if (themeStore.layout.mode === 'horizontal-mix')
    return menus.value;

  return [];
});
</script>

<template>
  <DarkModeContainer class="h-full flex-y-center shadow-header">
    <GlobalLogo v-if="showLogo" class="h-full" :style="{ width: `${themeStore.sider.width}px` }" />
    <HorizontalMenu v-if="showMenu" mode="horizontal" :menus="headerMenus" class="px-12px" />
    <div v-else class="h-full flex-y-center flex-1-hidden gap-12px">
      <MenuToggler
        v-if="showMenuToggler"
        :collapsed="appStore.siderCollapse"
        :height="`${themeStore.header.height}px`"
        @click="appStore.toggleSiderCollapse"
      />
      <GlobalBreadcrumb v-if="!appStore.isMobile" />
    </div>
    <div class="h-full flex-y-center justify-end gap-12px px-16px">
      <div class="h-full flex-y-center">
        <FullScreen
          v-if="!appStore.isMobile"
          :full="isFullscreen"
          @click="toggle"
        />
        <LangSwitch
          :show-tooltip="false"
          :lang="appStore.locale"
          :lang-options="appStore.localeOptions"
          @change-lang="appStore.changeLocale"
        />
        <ThemeSchemaSwitch
          :theme-schema="themeStore.themeScheme"
          :is-dark="themeStore.darkMode"
          @switch="themeStore.toggleThemeScheme"
        />
        <ThemeButton />
      </div>
      <UserAvatar />
    </div>
  </DarkModeContainer>
</template>

<style scoped></style>
