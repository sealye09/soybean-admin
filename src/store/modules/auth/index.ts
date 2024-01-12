import { useLoading } from '@sa/hooks';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { SetupStoreId } from '@/enum';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import type { LoginData, UserInfo } from '@/service';
import { getUserInfoApi, loginApi, logoutApi } from '@/service';
import { INFO_MSG_DURATION } from '@/service/request/config';

import { useRouteStore } from '../route';

export const useAuthStore = defineStore(
  SetupStoreId.Auth,
  () => {
    const routeStore = useRouteStore();
    const { route, toLogin, redirectFromLogin } = useRouterPush(false);
    const { loading: loginLoading, startLoading, endLoading } = useLoading();

    const token = ref<string>();
    const tokenType = ref<string>();
    const refreshToken = ref<string>();
    const userInfo = ref<UserInfo>();

    const isLogin = computed(() => Boolean(token.value));

    /** Reset auth store */
    async function resetStore() {
      const authStore = useAuthStore();
      authStore.$reset();

      if (!route.value.meta.constant) await toLogin();
      routeStore.resetStore();
    }

    /**
     * Login
     * @param LoginData 登录参数
     */
    async function login(LoginData: LoginData) {
      startLoading();

      try {
        const { data } = await loginApi(LoginData);
        if (!data)
          throw new Error('Login failed');

        // 存储token信息
        token.value = data.accessToken;
        tokenType.value = data.tokenType;
        refreshToken.value = data.refreshToken;

        // 获取用户信息
        await updateInfo();

        await redirectFromLogin();

        if (routeStore.isInitAuthRoute) {
          window.$notification?.success({
            title: $t('page.login.common.loginSuccess'),
            content: $t('page.login.common.welcomeBack', {
              username: userInfo.value?.username,
            }),
            duration: INFO_MSG_DURATION,
          });
        }
      }
      catch (err) {
        console.log(err);
        resetStore();
      }
      finally {
        endLoading();
      }
    }

    async function updateInfo() {
      const { data: info } = await getUserInfoApi();
      if (!info) throw new Error('Get user info failed');
      await routeStore.initAuthRoute();

      // update user info
      userInfo.value = info;
    }

    /** Logout */
    async function logout() {
      logoutApi();
      routeStore.resetStore();
      resetStore();
    }

    /** 双token时，使用refreshToken更新token */
    async function updateToken() {
      console.log('updateToken');
    }

    return {
      token,
      tokenType,
      refreshToken,
      userInfo,
      isLogin,
      loginLoading,
      resetStore,
      login,
      logout,
      updateInfo,
      updateToken,
    };
  },
  {
    persist: true,
  },
);
