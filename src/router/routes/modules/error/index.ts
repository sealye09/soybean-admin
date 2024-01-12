import type { RouteLocationNormalized } from 'vue-router';

import BlankLayout from '@/layouts/blank-layout/index.vue';

export const ERROR_ROUTE_403 = {
  name: 'error-403',
  path: '/error/403',
  component: () => import('@/views/_builtin/403/index.vue'),
  meta: {
    title: '403',
    i18nKey: 'route.403',
    hidden: true,
    constant: true,
    keepAlive: false,
  },
};

export const ERROR_ROUTE_404 = {
  name: 'error-404',
  path: '/error/404',
  component: () => import('@/views/_builtin/404/index.vue'),
  meta: {
    title: '404',
    i18nKey: 'route.404',
    hidden: true,
    constant: true,
    keepAlive: false,
  },
};

export const ERROR_ROUTE_500 = {
  name: 'error-500',
  path: '/error/500',
  component: () => import('@/views/_builtin/500/index.vue'),
  meta: {
    title: '500',
    i18nKey: 'route.500',
    hidden: true,
    constant: true,
    keepAlive: false,
  },
};

export const ERROR_ROUTES = [ERROR_ROUTE_403.name, ERROR_ROUTE_404.name, ERROR_ROUTE_500.name];

export const ERROR_ROUTE = {
  path: '/error',
  name: 'error',
  component: BlankLayout,
  redirect: '/404',
  meta: {
    title: 'error',
    hidden: true,
    constant: true,
    keepAlive: false,
  },
  children: [ERROR_ROUTE_403, ERROR_ROUTE_404, ERROR_ROUTE_500],
};

export const isErrorRoute = (route: RouteLocationNormalized) => ERROR_ROUTES.includes(route.name as string);

export const is404ErrorRoute = (route: RouteLocationNormalized) => route.name === ERROR_ROUTE_404.name;
export const is500ErrorRoute = (route: RouteLocationNormalized) => route.name === ERROR_ROUTE_500.name;
export const is403ErrorRoute = (route: RouteLocationNormalized) => route.name === ERROR_ROUTE_403.name;
