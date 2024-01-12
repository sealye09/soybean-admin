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
        constant: true,
        icon: 'mdi:monitor-dashboard',
        affix: true,
        keepAlive: true,
        alwaysShow: false,
      },
    },
  ],
};
