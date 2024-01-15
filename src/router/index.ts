import type { App } from 'vue';
import type { RouteRecordRaw, RouterHistory } from 'vue-router';
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/store';

import { createRouterGuard } from './guard';
import { constantRoutes } from './routes';

const { VITE_ROUTER_HISTORY_MODE = 'history', VITE_BASE_URL } = import.meta.env;

const historyCreatorMap: Record<Env.RouterHistoryMode, (base?: string) => RouterHistory> = {
  hash: createWebHashHistory,
  history: createWebHistory,
  memory: createMemoryHistory,
};

export const router = createRouter({
  history: historyCreatorMap[VITE_ROUTER_HISTORY_MODE](VITE_BASE_URL),
  routes: constantRoutes as RouteRecordRaw[],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

export function resetRouter() {
  router.getRoutes().forEach((route) => {
    const { name } = route;
    if (name) router.hasRoute(name) && router.removeRoute(name);
  });
}

export function addRoutes(filteredRoutes: RouteRecordRaw[]) {
  filteredRoutes.forEach((route) => {
    const { name } = route;
    if (name && !router.hasRoute(name)) router.addRoute(route);
  });
}

/** Setup Vue Router */
export async function setupRouter(app: App) {
  // await router list init
  /**
   * the key to solve lots problems in dynamic routing
   * 1. white screen：router created but not matched in guard
   * 2. to 404：404page matched any path，so，matched and then enter guard
   * 3. dead in guard：
   */
  // const auth = useAuthStore();
  // await auth.updateInfo();
  app.use(router);
  createRouterGuard(router);
  await router.isReady();
}
