import type { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router';

import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';

import {
  EXCEPTION_ROUTE_403,
  LOGIN_ROUTE,
  ROOT_ROUTE,
  isErrorRoute,
  isExceptionRoute,
  isLoginRoute,
  isRootRoute,
} from '../routes';

const ROOT_USER = 'root';

export function createPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

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
        condition: isLogin && isLoginRoute(to),
        callback: () => next({ name: ROOT_ROUTE.name }),
      },
      // 2. 常量路由，无需登录，直接放行
      {
        condition: !needLogin,
        callback: () => next(),
      },
      // 3. 页面需要登录，但是用户未登录，则跳转到登录页
      {
        condition: !isLogin && needLogin,
        callback: () => next({ name: LOGIN_ROUTE.name, query: { redirect: to.fullPath } }),
      },
      // 4. 用户已登录，且有权限，则放行
      {
        condition: isLogin && needLogin && hasPermission,
        callback: () => next(),
      },
      // 5. 用户已登录，但是没有权限，则跳转到403页面
      {
        condition: isLogin && needLogin && !hasPermission,
        callback: () => next({ name: EXCEPTION_ROUTE_403.name }),
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
  const isErrorOrExceptionRoute = isErrorRoute(to) || isExceptionRoute(to);
  const isConstantRoute = to.meta.constant;

  // 1. 如果路由是常量路由，且不是 exception error 路由，则允许访问。
  if (isConstantRoute && !isErrorOrExceptionRoute) {
    console.log('1. 如果路由是常量路由，且不是 exception error 路由，则允许访问。');
    return true;
  }

  // 2. 如果路由已经初始化，且不是 exception error 路由，则允许访问。
  if (routeStore.isInitAuthRoute && !isErrorOrExceptionRoute) {
    console.log('2. 如果路由已经初始化，且不是 exception error 路由，则允许访问。');
    return true;
  }

  // 3. 如果路由已经初始化，判断是否匹配上。
  if (routeStore.isInitAuthRoute && isErrorOrExceptionRoute) {
    console.log('3. 如果路由已经初始化，判断是否匹配上。');
    if (to.matched.length) {
      console.log('3.1. 匹配上');
      next();
      return true;
    }
    else {
      console.log('3.2. 未匹配上');
      return false;
    }
  }

  // 4. 如果用户未登录，则跳转到登录页。
  if (!isLogin) {
    const redirect = to.fullPath;
    console.log('4. 如果用户未登录，则跳转到登录页。');
    next({ name: LOGIN_ROUTE.name, query: { redirect } });
    return false;
  }

  // 5. 初始化路由
  await routeStore.initAuthRoute();
  console.log('5. 初始化路由');

  // 6. 路由被 exception error 路由捕获，因为自动路由未初始化。自动路由初始化后，重定向到原始路由。
  if (isErrorOrExceptionRoute) {
    console.log('6. 路由被 exception error 路由捕获，因为自动路由未初始化。自动路由初始化后，重定向到原始路由。', from, to);
    const path = isRootRoute(to) ? '/' : to.fullPath;
    next({ path, replace: true, query: to.query, hash: to.hash });

    return false;
  }

  return true;
}
