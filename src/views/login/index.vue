<script setup lang="ts">
import { getColorPalette, mixColor } from '@sa/utils';
import type { Component } from 'vue';
import { computed } from 'vue';

import { loginModuleRecord } from '@/constants/app';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';

import BindWechat from './components/bind-wechat.vue';
import CodeLogin from './components/code-login.vue';
import PwdLogin from './components/pwd-login.vue';
import Register from './components/register.vue';
import ResetPwd from './components/reset-pwd.vue';

interface Props {
  /** The login module */
  module?: UnionKey.LoginModule
}

const props = withDefaults(defineProps<Props>(), {
  module: 'pwd-login',
});

const appStore = useAppStore();
const themeStore = useThemeStore();

interface LoginModule {
  key: UnionKey.LoginModule
  label: string
  component: Component
}

const modules: LoginModule[] = [
  { key: 'pwd-login', label: loginModuleRecord['pwd-login'], component: PwdLogin },
  { key: 'code-login', label: loginModuleRecord['code-login'], component: CodeLogin },
  { key: 'register', label: loginModuleRecord.register, component: Register },
  { key: 'reset-pwd', label: loginModuleRecord['reset-pwd'], component: ResetPwd },
  { key: 'bind-wechat', label: loginModuleRecord['bind-wechat'], component: BindWechat },
];

const activeModule = computed(() => {
  const findItem = modules.find(item => item.key === props.module);
  return findItem || modules[0];
});

const bgThemeColor = computed(() =>
  themeStore.darkMode ? getColorPalette(themeStore.themeColor, 7) : themeStore.themeColor,
);

const bgColor = computed(() => {
  const COLOR_WHITE = '#ffffff';

  const ratio = themeStore.darkMode ? 0.5 : 0.2;

  return mixColor(COLOR_WHITE, themeStore.themeColor, ratio);
});
</script>

<template>
  <div class="relative wh-full flex-center overflow-hidden" :style="{ backgroundColor: bgColor }">
    <WaveBg :theme-color="bgThemeColor" />
    <NCard class="relative z-4 w-auto rd-12px py-12px">
      <div class="w-400px <sm:w-300px">
        <header class="flex-y-center justify-center gap-24px <sm:gap-12px">
          <SystemLogo
            class="text-64px text-primary <sm:text-48px"
          />

          <NGradientText type="primary" class="text-28px font-500 <sm:text-22px">
            {{ $t('system.title') }}
          </NGradientText>
        </header>
        <main class="pt-24px">
          <NGradientText type="primary" class="text-18px font-medium">
            {{ $t(activeModule.label) }}
          </NGradientText>
          <div class="pt-24px">
            <Transition :name="themeStore.page.animateMode" mode="out-in" appear>
              <component :is="activeModule.component" />
            </Transition>
          </div>
        </main>
      </div>
    </NCard>

    <div
      class="absolute right-48px top-24px z-3 h-40px"
    >
      <div class="h-full flex items-baseline justify-center gap-4px">
        <ThemeSchemaSwitch
          :theme-schema="themeStore.themeScheme"
          :show-tooltip="false"
          @switch="themeStore.toggleThemeScheme"
        />
        <LangSwitch
          :lang="appStore.locale"
          :lang-options="appStore.localeOptions"
          :show-tooltip="false"
          @change-lang="appStore.changeLocale"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
