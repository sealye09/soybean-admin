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
  filterAuthRoutesByRoles,
  getBreadcrumbsByRoute,
  getCacheRouteNames,
  getGlobalMenusByAuthRoutes,
  getRouteNameByPath,
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
    if (cacheRoutes.value.includes(routeKey)) return;

    cacheRoutes.value.push(routeKey);
  }

  /**
   * Remove cache routes
   *
   * @param routeKey
   */
  function removeCacheRoutes(routeKey: string) {
    const index = cacheRoutes.value.findIndex(item => item === routeKey);

    if (index === -1) return;

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
  async function resetStore() {
    const routeStore = useRouteStore();

    routeStore.$reset();
  }

  /** Init auth route */
  async function initAuthRoute() {
    if (authRouteMode.value === 'static')
      await initStaticAuthRoute();
    else
      await initDynamicAuthRoute();

    tabStore.initHomeTab(router);
  }

  /** Init static auth route */
  async function initStaticAuthRoute() {
    if (!authStore.userInfo) return;
    console.log('静态路由模式：初始化中');
    addAnyRoute();
    const filteredAuthRoutes = filterAuthRoutesByRoles(dynamicRoutes as RouteRecordRaw[], authStore.userInfo.roles);

    handleAuthRoutes(filteredAuthRoutes);

    setIsInitAuthRoute(true);
    console.log('路由初始化完成！');
  }

  /** Init dynamic auth route */
  async function initDynamicAuthRoute() {
    console.log('动态路由模式：初始化中');
    const { data } = await listRoutes();

    handleAuthRoutes(data as RouteRecordRaw[]);

    // setRouteHome(home);

    // handleUpdateRootRouteRedirect(home);

    setIsInitAuthRoute(true);
    console.log('路由初始化完成！');
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
   * Update root route redirect when auth route mode is dynamic 动态路由模式下，更新根路由的重定向
   *
   * @param redirectKey Redirect route key
   */
  function handleUpdateRootRouteRedirect(redirectKey: string) {
    // const redirect = getRoutePath(redirectKey);
    // if (redirect) {
    //   const rootRoute = { ...ROOT_ROUTE, redirect };
    //   router.removeRoute(rootRoute.name);
    //   const [rootVueRoute] = getAuthVueRoutes([rootRoute]);
    //   router.addRoute(rootVueRoute);
    // }
  }

  /**
   * Get is auth route exist
   *
   * @param routePath Route path
   */
  async function getIsAuthRouteExist(routePath: string) {
    const routeName = getRouteNameByPath(routePath);
    if (!routeName) return false;

    // if (authRouteMode.value === 'static') {
    //   const { authRoutes } = createRoutes();
    //   return isRouteExistByRouteName(routeName, authRoutes);
    // }
    // const { data } = await fetchIsRouteExist(routeName);
    // return data;
  }

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
    getIsAuthRouteExist,
    getSelectedMenuKeyPath,
  };
});
