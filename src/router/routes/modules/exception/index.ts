import BaseLayout from '@/layouts/base-layout/index.vue';

const EXCEPTION_ROUTE_403 = {
  name: 'exception-403',
  path: '/exception/403',
  component: () => import('@/views/_builtin/403/index.vue'),
  meta: {
    title: '403',
    i18nKey: 'route.403',
    hidden: true,
    constant: true,
    keepAlive: false
  }
};

const EXCEPTION_ROUTE_404 = {
  name: 'exception-404',
  path: '/exception/404',
  component: () => import('@/views/_builtin/404/index.vue'),
  meta: {
    title: '404',
    i18nKey: 'route.404',
    hidden: true,
    constant: true,
    keepAlive: false
  }
};

const EXCEPTION_ROUTE_500 = {
  name: 'exception-500',
  path: '/exception/500',
  component: () => import('@/views/_builtin/500/index.vue'),
  meta: {
    title: '500',
    i18nKey: 'route.500',
    hidden: true,
    constant: true,
    keepAlive: false
  }
};

export const EXCEPTION_ROUTE = {
  path: '/exception',
  name: 'exception',
  component: BaseLayout,
  redirect: '/404',
  meta: {
    title: 'exception',
    hidden: true,
    constant: true,
    keepAlive: false
  },
  children: [EXCEPTION_ROUTE_403, EXCEPTION_ROUTE_404, EXCEPTION_ROUTE_500]
};
