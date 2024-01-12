import BaseLayout from '@/layouts/base-layout/index.vue';

export const SYSTEM_ROUTE = {
  path: '/system',
  name: 'system',
  redirect: '/system/role',
  component: BaseLayout,
  meta: {
    title: 'system',
    i18nKey: 'route.system',
    icon: 'carbon:cloud-service-management',
    roles: ['ADMIN'],
    keepAlive: true,
    alwaysShow: false,
  },
  children: [
    {
      path: '/system/role',
      name: 'system_role',
      component: () => import('@/views/system/role/index.vue'),
      meta: {
        title: 'system_role',
        i18nKey: 'route.system_role',
        icon: 'carbon:user-role',
        roles: ['ADMIN'],
      },
    },
    {
      path: '/system/menu',
      name: 'system_menu',
      component: () => import('@/views/system/menu/index.vue'),
      meta: {
        title: 'system_menu',
        i18nKey: 'route.system_menu',
        icon: 'material-symbols:route',
        roles: ['ADMIN'],
        keepAlive: true,
      },
    },
    {
      path: '/system/user',
      name: 'system_user',
      component: () => import('@/views/system/user/index.vue'),
      meta: {
        title: 'system_user',
        i18nKey: 'route.system_user',
        icon: 'ic:round-manage-accounts',
        roles: ['ADMIN'],
      },
    },
  ],
};
