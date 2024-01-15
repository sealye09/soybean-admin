<script setup lang="ts">
import { useSvgIconRender } from '@sa/hooks';
import type { VNode } from 'vue';
import { computed } from 'vue';

import SvgIcon from '@/components/custom/svg-icon.vue';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({
  name: 'UserAvatar',
});

const authStore = useAuthStore();
const { toLogin } = useRouterPush();
const { SvgIconVNode } = useSvgIconRender(SvgIcon);

function loginOrRegister() {
  toLogin();
}

type DropdownKey = 'user-center' | 'logout';

type DropdownOption =
  | {
    key: DropdownKey;
    label: string;
    icon?: () => VNode;
  }
  | {
    type: 'divider';
    key: string;
  };

const options = computed(() => {
  const opts: DropdownOption[] = [
    {
      label: $t('common.userCenter'),
      key: 'user-center',
      icon: SvgIconVNode({ icon: 'ph:user-circle', fontSize: 18 }),
    },
    {
      type: 'divider',
      key: 'divider',
    },
    {
      label: $t('common.logout'),
      key: 'logout',
      icon: SvgIconVNode({ icon: 'ph:sign-out', fontSize: 18 }),
    },
  ];

  return opts;
});

function logout() {
  window.$dialog?.info({
    title: $t('common.tip'),
    content: $t('common.logoutConfirm'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      await authStore.logout();
    },
  });
}

function handleDropdown(key: DropdownKey) {
  if (key === 'logout') logout();
  else window.$message?.info(key);
}
</script>

<template>
  <NButton
    v-if="!authStore.isLogin" quaternary
    class="h-full"
    @click="loginOrRegister"
  >
    {{ $t('page.login.common.loginOrRegister') }}
  </NButton>
  <NDropdown v-else placement="bottom" trigger="click" :options="options" @select="handleDropdown">
    <div class="h-full">
      <ButtonIcon class="h-full">
        <SvgIcon icon="ph:user-circle" class="text-icon-large" />
        <span class="text-16px font-medium">{{ authStore.userInfo?.username ?? '' }}</span>
      </ButtonIcon>
    </div>
  </NDropdown>
</template>

<style scoped></style>
