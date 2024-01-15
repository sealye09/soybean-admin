import type { RouteLocationNormalized } from 'vue-router';

import { router } from '..';

import { ERROR_ROUTE } from './modules/error';
import { EXCEPTION_ROUTE } from './modules/exception';
import { HOME_ROUTE } from './modules/home';
import { LOGIN_ROUTE } from './modules/login';
import { MULTI_ROUTE } from './modules/multi-level';
import { SYSTEM_ROUTE } from './modules/system';

export * from './modules/error';
export * from './modules/exception';
export * from './modules/home';
export * from './modules/login';
export * from './modules/system';
export * from './modules/multi-level';

export const ROOT_ROUTE = {
  name: 'root',
  path: '/',
  redirect: '/dashboard',
  meta: {
    title: '首页',
    constant: true,
    keepAlive: false,
    hidden: true,
  },
};

export const isRootRoute = (route: RouteLocationNormalized) => route.name === ROOT_ROUTE.name;

export const ANY_ROUTE = {
  name: 'any',
  path: '/:pathMatch(.*)*',
  redirect: '/error/404',
  meta: {
    title: 'any',
    constant: true,
    keepAlive: false,
    hidden: true,
  },
};

export const constantRoutes = [
  ROOT_ROUTE,
  LOGIN_ROUTE,
  HOME_ROUTE,
  EXCEPTION_ROUTE,
  ERROR_ROUTE,
  // ANY_ROUTE,
];

export function addAnyRoute() {
  router.addRoute(ANY_ROUTE);
}

export const dynamicRoutes = [
  SYSTEM_ROUTE,
  MULTI_ROUTE,
];
