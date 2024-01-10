import type { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';
import { localStg } from '@/utils/storage';

export function createPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const pass = await createAuthRouteGuard(to, from, next);

    if (!pass) return;

    // 1. route with href
    if (to.meta.href) {
      window.open(to.meta.href, '_blank');
      next({
        path: from.fullPath,
        replace: true,
        query: from.query,
        hash: to.hash
      });
    }

    const authStore = useAuthStore();

    const isLogin = Boolean(localStg.get('token'));
    const needLogin = !to.meta.constant;
    const routeRoles = to.meta.roles || [];
    const rootRoute = 'root';
    const loginRoute = 'login';
    const noPermissionRoute = '403';

    const SUPER_ADMIN = 'ROOT';
    // const hasPermission =
    //   !routeRoles.length ||
    //   authStore.userInfo.roles.includes(SUPER_ADMIN) ||
    //   authStore.userInfo.roles.some((role) => routeRoles.includes(role));
    // TODO: remove this line
    const hasPermission = true;

    const strategicPatterns: Common.StrategicPattern[] = [
      // 1. 已登录且访问登录页，则跳转到根路由
      {
        condition: isLogin && to.name === loginRoute,
        callback: () => {
          console.log('1. 已登录且访问登录页，则跳转到根路由');
          next({ name: rootRoute });
        }
      },
      // 2. 常量路由，直接放行
      {
        condition: !needLogin,
        callback: () => {
          console.log('2. 常量路由，直接放行');
          next();
        }
      },
      // 3. 页面需要登录，但是用户未登录，则跳转到登录页
      {
        condition: !isLogin && needLogin,
        callback: () => {
          console.log('3. 页面需要登录，但是用户未登录，则跳转到登录页');
          next({ name: loginRoute, query: { redirect: to.fullPath } });
        }
      },
      // 4. 用户已登录，且有权限，则放行
      {
        condition: isLogin && needLogin && hasPermission,
        callback: () => {
          console.log('4. 用户已登录，且有权限，则放行');
          next();
        }
      },
      // 5. 用户已登录，但是没有权限，则跳转到403页面
      {
        condition: isLogin && needLogin && !hasPermission,
        callback: () => {
          console.log('5. 用户已登录，但是没有权限，则跳转到403页面');
          next({ name: noPermissionRoute });
        }
      }
    ];

    strategicPatterns.some(({ condition, callback }) => {
      if (condition) {
        callback();
      }

      return condition;
    });
  });
}

async function createAuthRouteGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const notFoundRoute = 'not-found';
  const isNotFoundRoute = to.name === notFoundRoute;
  const isConstantRoute = to.meta.constant;

  // 1. 如果路由是常量路由，但不是“not-found”路由，则允许访问。
  if (isConstantRoute && !isNotFoundRoute) {
    console.log('1. 如果路由是常量路由，但不是“not-found”路由，则允许访问。');
    return true;
  }

  // 2. 如果路由已经初始化，但不是“not-found”路由，则允许访问。
  const routeStore = useRouteStore();
  if (routeStore.isInitAuthRoute && !isNotFoundRoute) {
    console.log('2. 如果路由已经初始化，但不是“not-found”路由，则允许访问。');
    return true;
  }

  // 3. 如果路由已经初始化，则检查路由是否存在。
  if (routeStore.isInitAuthRoute && isNotFoundRoute) {
    console.log('3. 如果路由已经初始化，则检查路由是否存在。');
    // const exist = await routeStore.getIsAuthRouteExist(to.path);
    // TODO: remove this line
    return true;

    // if (exist) {
    //   const noPermissionRoute = "403";

    //   next({ name: noPermissionRoute });

    //   return false;
    // }

    // return true;
  }

  // 4. 如果用户未登录，则跳转到登录页。
  const isLogin = Boolean(localStg.get('token'));
  console.log('4. 如果用户未登录，则跳转到登录页。');
  if (!isLogin) {
    const loginRoute = 'login';
    const redirect = to.fullPath;

    next({ name: loginRoute, query: { redirect } });
    console.log('not login');
    return false;
  }

  // 5. 初始化路由
  await routeStore.initAuthRoute();
  console.log('5. 初始化路由');

  // 6. the route is caught by the "not-found" route because the auto route is not initialized. after the auto route is initialized, redirect to the original route.
  // 6. 路由被“not-found”路由捕获，因为自动路由未初始化。自动路由初始化后，重定向到原始路由。
  if (isNotFoundRoute) {
    console.log('6. 路由被“not-found”路由捕获，因为自动路由未初始化。自动路由初始化后，重定向到原始路由。');
    const rootRoute = 'root';
    const path = to.redirectedFrom?.name === rootRoute ? '/' : to.fullPath;

    next({ path, replace: true, query: to.query, hash: to.hash });

    return false;
  }

  return true;
}
