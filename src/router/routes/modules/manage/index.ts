import BaseLayout from '@/layouts/base-layout/index.vue';

export const MANAGE_ROUTE = {
  path: '/manage',
  name: 'manage',
  redirect: '/manage/role',
  component: BaseLayout,
  meta: {
    title: 'manage',
    i18nKey: 'route.manage',
    icon: 'carbon:cloud-service-management',
    roles: ['ADMIN'],
    keepAlive: true,
    alwaysShow: false
  },
  children: [
    {
      path: '/manage/role',
      name: 'manage_role',
      component: () => import('@/views/manage/role/index.vue'),
      meta: {
        title: 'manage_role',
        i18nKey: 'route.manage_role',
        icon: 'carbon:user-role',
        roles: ['ADMIN']
      }
    },
    {
      path: '/manage/route',
      name: 'manage_route',
      component: () => import('@/views/manage/route/index.vue'),
      meta: {
        title: 'manage_route',
        i18nKey: 'route.manage_route',
        icon: 'material-symbols:route',
        roles: ['ADMIN'],
        keepAlive: true
      }
    },
    {
      path: '/manage/user',
      name: 'manage_user',
      component: () => import('@/views/manage/user/index.vue'),
      meta: {
        title: 'manage_user',
        i18nKey: 'route.manage_user',
        icon: 'ic:round-manage-accounts',
        roles: ['ADMIN']
      }
    }
  ]
};
