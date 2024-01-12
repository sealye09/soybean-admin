import type { RouteLocationNormalized } from 'vue-router';

export const LOGIN_ROUTE = {
  path: '/login',
  name: 'login',
  component: () => import('@/views/login/index.vue'),
  meta: {
    title: 'login',
    i18nKey: 'route.login',
    hidden: true,
    keepAlive: true,
    alwaysShow: false,
    constant: true,
  },
};

export const isLoginRoute = (route: RouteLocationNormalized) => route.name === LOGIN_ROUTE.name;
