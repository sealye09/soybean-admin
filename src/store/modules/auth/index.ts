import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { SetupStoreId } from '@/enum';
import { useRouterPush } from '@/hooks/common/router';
import type { LoginData, UserInfo } from '@/service';
import { getUserInfoApi, loginApi, logoutApi } from '@/service';
import { localStg } from '@/utils/storage';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { clearAuthStorage, getToken, getUserInfo } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const routeStore = useRouteStore();
  const { route, toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref(getToken());
  const isLogin = computed(() => Boolean(token.value));

  const userInfo: UserInfo = reactive(getUserInfo());

  /** Reset auth store */
  async function resetStore() {
    const authStore = useAuthStore();

    clearAuthStorage();

    authStore.$reset();

    if (!route.value.meta.constant) {
      await toLogin();
    }

    routeStore.resetStore();
  }

  /**
   * @param username Username
   * @param password Password
   */
  async function login(LoginData: LoginData) {
    startLoading();

    try {
      const { data } = await loginApi(LoginData);
      if (!data) {
        throw new Error('Login failed');
      }
      // 存储token信息
      localStg.set('token', data.accessToken);
      localStg.set('tokenType', data.tokenType);
      localStg.set('refreshToken', data.refreshToken);

      // 获取用户信息
      updateInfo();

      await routeStore.initAuthRoute();

      await redirectFromLogin();

      if (routeStore.isInitAuthRoute) {
        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          content: $t('page.login.common.welcomeBack', {
            username: userInfo.username
          })
        });
      }
    } catch (err) {
      console.log(err);
      resetStore();
    } finally {
      endLoading();
    }
  }

  async function updateInfo() {
    const { data: info } = await getUserInfoApi();
    if (!info) {
      throw new Error('Get user info failed');
    }

    // store user info
    localStg.set('userInfo', info);
    // update user info
    Object.assign(userInfo, info);
  }

  /** Logout */
  async function logout() {
    logoutApi();
    resetStore();
  }

  /** 双token时，使用refreshToken更新token */
  async function updateToken() {
    console.log('updateToken');
  }

  return {
    token,
    userInfo,
    isLogin,
    loginLoading,
    resetStore,
    login,
    logout,
    updateToken
  };
});
