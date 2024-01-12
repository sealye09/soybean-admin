import type { RouteLocationNormalized } from 'vue-router';

import BaseLayout from '@/layouts/base-layout/index.vue';

export const EXCEPTION_ROUTE_403 = {
  name: 'exception-403',
  path: '/exception/403',
  component: () => import('@/views/_builtin/403/index.vue'),
  meta: {
    title: '403',
    i18nKey: 'route.403',
    icon: 'ic:baseline-block',
    hidden: true,
    constant: true,
    keepAlive: false,
  },
};

export const EXCEPTION_ROUTE_404 = {
  name: 'exception-404',
  path: '/exception/404',
  component: () => import('@/views/_builtin/404/index.vue'),
  meta: {
    title: '404',
    i18nKey: 'route.404',
    icon: 'ic:baseline-web-asset-off',
    hidden: true,
    constant: true,
    keepAlive: false,
  },
};

export const EXCEPTION_ROUTE_500 = {
  name: 'exception-500',
  path: '/exception/500',
  component: () => import('@/views/_builtin/500/index.vue'),
  meta: {
    title: '500',
    i18nKey: 'route.500',
    icon: 'ic:baseline-wifi-off',
    hidden: true,
    constant: true,
    keepAlive: false,
  },
};

export const EXCEPTION_ROUTE = {
  path: '/exception',
  name: 'exception',
  component: BaseLayout,
  redirect: '/exception/404',
  meta: {
    title: 'exception',
    i18nKey: 'route.exception',
    hidden: true,
    icon: 'ant-design:exception-outlined',
    constant: true,
    keepAlive: false,
  },
  children: [EXCEPTION_ROUTE_403, EXCEPTION_ROUTE_404, EXCEPTION_ROUTE_500],
};

export const EXCEPTION_ROUTES = [EXCEPTION_ROUTE_403, EXCEPTION_ROUTE_404, EXCEPTION_ROUTE_500];

export const is403ExceptionRoute = (route: RouteLocationNormalized) => route.name === EXCEPTION_ROUTE_403.name;
export const is404ExceptionRoute = (route: RouteLocationNormalized) => route.name === EXCEPTION_ROUTE_404.name;
export const is500ExceptionRoute = (route: RouteLocationNormalized) => route.name === EXCEPTION_ROUTE_500.name;
export function isExceptionRoute(route: RouteLocationNormalized) {
  return is403ExceptionRoute(route) || is404ExceptionRoute(route) || is500ExceptionRoute(route);
}
