import BaseLayout from '@/layouts/base-layout/index.vue';

export const HOME_ROUTE = {
  path: '/',
  redirect: '/home',
  component: BaseLayout,
  children: [
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
      meta: {
        title: 'dashboard',
        icon: 'mdi:monitor-dashboard',
        affix: true,
        keepAlive: true,
        alwaysShow: false,
        roles: ['ROOT']
      }
    }
  ]
};
