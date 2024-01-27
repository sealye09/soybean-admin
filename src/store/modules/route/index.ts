import { useBoolean } from '@sa/hooks';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { SetupStoreId } from '@/enum';
import { addRoutes, router } from '@/router';
import { addAnyRoute, constantRoutes, dynamicRoutes } from '@/router/routes';
import { listRoutes } from '@/service';

import { useAppStore } from '../app';
import { useAuthStore } from '../auth';
import { useTabStore } from '../tab';

import {
  filterAsyncRoutesByRoles,
  filterAuthRoutesByRoles,
  getBreadcrumbsByRoute,
  getCacheRouteNames,
  getGlobalMenusByAuthRoutes,
  getSelectedMenuKeyPathByKey,
  updateLocaleOfGlobalMenus,
} from './shared';

export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const tabStore = useTabStore();
  const { bool: isInitAuthRoute, setBool: setIsInitAuthRoute } = useBoolean();

  const authRouteMode = ref(import.meta.env.VITE_AUTH_ROUTE_MODE);

  /** Home route key */
  const routeHome = ref(import.meta.env.VITE_ROUTE_HOME);

  /** Global menus */
  const menus = ref<App.Global.Menu[]>([]);

  /** Get global menus */
  function getGlobalMenus(routes: RouteRecordRaw[]) {
    menus.value = getGlobalMenusByAuthRoutes(routes);
  }

  /** Update global menus by locale */
  function updateGlobalMenusByLocale() {
    menus.value = updateLocaleOfGlobalMenus(menus.value);
  }

  /** Cache routes */
  const cacheRoutes = ref<string[]>([]);

  /**
   * Get cache routes
   *
   * @param routes Vue routes
   */
  function getCacheRoutes(routes: RouteRecordRaw[]) {
    cacheRoutes.value = getCacheRouteNames([...routes]);
  }

  /**
   * Add cache routes
   *
   * @param routeKey
   */
  function addCacheRoutes(routeKey: string) {
    if (cacheRoutes.value.includes(routeKey))
      return;

    cacheRoutes.value.push(routeKey);
  }

  /**
   * Remove cache routes
   *
   * @param routeKey
   */
  function removeCacheRoutes(routeKey: string) {
    const index = cacheRoutes.value.findIndex(item => item === routeKey);

    if (index === -1)
      return;

    cacheRoutes.value.splice(index, 1);
  }

  /**
   * Re-cache routes by route key
   *
   * @param routeKey
   */
  async function reCacheRoutesByKey(routeKey: string) {
    removeCacheRoutes(routeKey);

    await appStore.reloadPage();

    addCacheRoutes(routeKey);
  }

  /**
   * Re-cache routes by route keys
   *
   * @param routeKeys
   */
  async function reCacheRoutesByKeys(routeKeys: string[]) {
    for await (const key of routeKeys)
      await reCacheRoutesByKey(key);
  }

  /** Global breadcrumbs */
  const breadcrumbs = computed(() => getBreadcrumbsByRoute(router.currentRoute.value, menus.value));

  /** Reset store */
  function resetStore() {
    const routeStore = useRouteStore();
    routeStore.$reset();
  }

  /** Init auth route */
  async function initAuthRoute() {
    if (isInitAuthRoute.value) return;

    if (authRouteMode.value === 'static')
      await initStaticAuthRoute();
    else
      await initDynamicAuthRoute();

    tabStore.initHomeTab(router);
  }

  /** Init static auth route */
  async function initStaticAuthRoute() {
    if (!authStore.userInfo) return;
    setIsInitAuthRoute(false);
    console.log('静态路由模式：初始化中');
    const filteredAuthRoutes = filterAuthRoutesByRoles(dynamicRoutes as RouteRecordRaw[], authStore.userInfo.roles);

    handleAuthRoutes(filteredAuthRoutes);
    /**
     * any route 需要在权限路由添加完成后添加
     * 被 any route 匹配到直接到 404
     */
    addAnyRoute();

    setIsInitAuthRoute(true);
    console.log('路由初始化完成！');
  }

  /** Init dynamic auth route */
  async function initDynamicAuthRoute() {
    if (!authStore.userInfo) return;

    console.log('动态路由模式：初始化中');
    setIsInitAuthRoute(false);
    console.log('获取数据...');
    const { data } = await listRoutes();

    if (data) {
      const filteredAuthRoutes = filterAsyncRoutesByRoles(data as RouteRecordRaw[], authStore.userInfo.roles);
      handleAuthRoutes(filteredAuthRoutes);
      addAnyRoute();
      setIsInitAuthRoute(true);
      console.log('路由初始化完成！');
    } else {
      console.log('获取数据失败！');
      setIsInitAuthRoute(false);
      authStore.logout();
    }
  }

  /**
   * Handle routes
   *
   * @param routes Auth routes
   */
  function handleAuthRoutes(routes: RouteRecordRaw[]) {
    addRoutes(routes);
    getGlobalMenus([...constantRoutes, ...routes] as RouteRecordRaw[]);
    getCacheRoutes([...constantRoutes, ...routes] as RouteRecordRaw[]);
  }

  /**
   * Update root route redirect when auth route mode is dynamic
   * 动态路由模式下，更新根路由的重定向
   *
   * @param redirectKey Redirect route key
   */
  // function handleUpdateRootRouteRedirect(redirectKey: string) {
  //   // const redirect = getRoutePath(redirectKey);
  //   // if (redirect) {
  //   //   const rootRoute = { ...ROOT_ROUTE, redirect };
  //   //   router.removeRoute(rootRoute.name);
  //   //   const [rootVueRoute] = getAuthVueRoutes([rootRoute]);
  //   //   router.addRoute(rootVueRoute);
  //   // }
  //   console.log('动态路由模式下，更新根路由的重定向');
  // }

  /**
   * Get selected menu key path
   *
   * @param selectedKey Selected menu key
   */
  function getSelectedMenuKeyPath(selectedKey: string) {
    return getSelectedMenuKeyPathByKey(selectedKey, menus.value);
  }

  return {
    resetStore,
    routeHome,
    menus,
    updateGlobalMenusByLocale,
    cacheRoutes,
    reCacheRoutesByKey,
    reCacheRoutesByKeys,
    breadcrumbs,
    initAuthRoute,
    isInitAuthRoute,
    setIsInitAuthRoute,
    getSelectedMenuKeyPath,
  };
});
