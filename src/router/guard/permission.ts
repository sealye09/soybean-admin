import { type NavigationGuardNext, type RouteLocationNormalized, type Router, useRouter } from 'vue-router';

import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';

const ROOT_USER = 'root';

const ROOT_ROUTE = 'root';
const LOGIN_ROUTE = 'login';
const NO_PERMISSION_ROUTE = 'exception-403';
const NOT_FOUND_ROUTE = 'error-404';
let times = 0;

export function createPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    console.log('permission guard----', times++, from, to);
    const authStore = useAuthStore();
    const routeStore = useRouteStore();

    if (!routeStore.isInitAuthRoute) routeStore.initAuthRoute();
    const meta = to.meta;

    const isLogin = Boolean(authStore.token);
    const userInfo = authStore.userInfo;
    const needLogin = !meta.constant;
    const routeRoles = meta.roles || [];
    const hasPermission = userInfo?.roles?.includes(ROOT_USER)
      || !routeRoles.length
      || routeRoles.some(role => userInfo?.roles?.includes(role));

    const pass = await createAuthRouteGuard(to, from, next);

    if (!pass) return;

    // 1. 外链
    if (meta.href) {
      window.open(meta.href, '_blank');
      next({
        path: from.fullPath,
        replace: true,
        query: from.query,
        hash: to.hash,
      });
    }

    const strategicPatterns: Common.StrategicPattern[] = [
      // 1. 已登录且访问登录页，则跳转到根路由
      {
        condition: isLogin && to.name === LOGIN_ROUTE,
        callback: () => {
          console.log('1. 已登录且访问登录页，则跳转到根路由', from, to);
          next({ name: ROOT_ROUTE });
        },
      },
      // 2. 常量路由，直接放行
      {
        condition: !needLogin,
        callback: () => {
          console.log('2. 常量路由，直接放行');
          next();
        },
      },
      // 3. 页面需要登录，但是用户未登录，则跳转到登录页
      {
        condition: !isLogin && needLogin,
        callback: () => {
          console.log('3. 页面需要登录，但是用户未登录，则跳转到登录页', from, to);
          next({ name: LOGIN_ROUTE, query: { redirect: to.fullPath } });
        },
      },
      // 4. 用户已登录，且有权限，则放行
      {
        condition: isLogin && needLogin && hasPermission && !to.matched.length,
        callback: async () => {
          console.log('4. 用户已登录，且有权限，则放行', from, to);
          next({ ...to });
        },
      },
      {
        condition: isLogin && needLogin && hasPermission && !!to.matched.length,
        callback: () => {
          console.log('5. 用', from, to);
          next();
        },
      },
      // 6. 用户已登录，但是没有权限，则跳转到403页面
      {
        condition: isLogin && needLogin && !hasPermission,
        callback: () => {
          console.log('6. 用户已登录，但是没有权限，则跳转到403页面', from, to);
          next({ name: NO_PERMISSION_ROUTE });
        },
      },
    ];

    strategicPatterns.some(({ condition, callback }) => {
      if (condition)
        callback();

      return condition;
    });
  });
}

async function createAuthRouteGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const routeStore = useRouteStore();
  const authStore = useAuthStore();
  const isLogin = Boolean(authStore.token);
  const isNotFoundRoute = to.name === NOT_FOUND_ROUTE;
  const isConstantRoute = to.meta.constant;

  // 1. 如果路由是常量路由，但不是“not-found”路由，则允许访问。
  if (isConstantRoute && !isNotFoundRoute) {
    console.log('1. 如果路由是常量路由，但不是“not-found”路由，则允许访问。', from, to);
    return true;
  }

  // 2. 如果路由已经初始化，但不是“not-found”路由，则允许访问。
  if (routeStore.isInitAuthRoute && !isNotFoundRoute) {
    console.log('2. 如果路由已经初始化，但不是“not-found”路由，则允许访问。', from, to);
    return true;
  }

  // 3. 如果路由已经初始化，允许访问。
  if (routeStore.isInitAuthRoute && isNotFoundRoute) {
    console.log('3. 如果路由已经初始化，允许访问。', from, to);
    return true;
  }

  // 4. 如果用户未登录，则跳转到登录页。
  console.log('4. 如果用户未登录，则跳转到登录页。', from, to);
  if (!isLogin) {
    const redirect = to.fullPath;

    next({ name: LOGIN_ROUTE, query: { redirect } });
    console.log('not login');
    return false;
  }

  // 5. 初始化路由
  await routeStore.initAuthRoute();
  console.log('5. 初始化路由');

  // 6. 路由被“not-found”路由捕获，因为自动路由未初始化。自动路由初始化后，重定向到原始路由。
  if (isNotFoundRoute) {
    console.log('6. 路由被“not-found”路由捕获，因为自动路由未初始化。自动路由初始化后，重定向到原始路由。', from, to);
    const path = to.redirectedFrom?.name === ROOT_ROUTE ? '/' : to.fullPath;

    next({ path, replace: true, query: to.query, hash: to.hash });

    return false;
  }

  return true;
}
