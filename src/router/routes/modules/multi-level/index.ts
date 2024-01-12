import BaseLayout from '@/layouts/base-layout/index.vue';

export const MULTI_ROUTE = {
  name: 'nested',
  path: '/nested',
  redirect: '/nested/level1/level2/level3-1',
  component: BaseLayout,
  meta: {
    title: '多级菜单',
    showAlways: true,
  },
  children: [
    {
      name: 'level11',
      path: '/nested/level1',
      redirect: '/nested/level1/level2/level3-1',
      component: () => import('@/views/multi-level/level1.vue'),
      meta: {
        title: '多级菜单1级',
        showAlways: true,
      },
      children: [
        {
          name: 'level2',
          path: '/nested/level1/level2',
          redirect: '/nested/level1/level2/level3-1',
          component: () => import('@/views/multi-level/children/level2.vue'),
          meta: {
            title: '多级菜单2级',
            showAlways: true,
          },
          children: [
            {
              name: 'level3-1',
              path: '/nested/level1/level2/level3-1',
              component: () => import('@/views/multi-level/children/children/level3-1.vue'),
              meta: {
                title: 'level3-1',
              },
            },
            {
              name: 'level3-2',
              path: '/nested/level1/level2/level3-2',
              component: () => import('@/views/multi-level/children/children/level3-2.vue'),
              meta: {
                title: 'level3-2',
              },
            },
          ],
        },
      ],
    },
  ],
};
