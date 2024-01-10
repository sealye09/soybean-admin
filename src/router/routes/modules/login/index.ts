export const LOGIN_ROUTE = {
  path: '/login',
  name: 'login',
  component: () => import('@/views/_builtin/login/index.vue'),
  meta: {
    title: 'login',
    i18nKey: 'route.login',
    hidden: true,
    keepAlive: true,
    alwaysShow: false,
    constant: true
  }
};
