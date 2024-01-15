import type { RouteLocationNormalized } from 'vue-router';

import BaseLayout from '@/layouts/base-layout/index.vue';

export const HOME_ROUTE = {
  path: '/',
  name: 'home',
  redirect: '/dashboard',
  component: BaseLayout,
  children: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/home/index.vue'),
      meta: {
        title: '看板',
        icon: 'lucide:home',
        affix: true,
        keepAlive: true,
        alwaysShow: false,
      },
    },
  ],
};

export const isHomeRoute = (route: RouteLocationNormalized) => route.name === HOME_ROUTE.name;
