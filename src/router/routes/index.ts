import { ERROR_ROUTE } from './modules/error';
import { EXCEPTION_ROUTE } from './modules/exception';
import { HOME_ROUTE } from './modules/home';
import { LOGIN_ROUTE } from './modules/login';
import { MANAGE_ROUTE } from './modules/manage';
import { MULTI_ROUTE } from './modules/multi';

export const ROOT_ROUTE = {
  name: 'root',
  path: '/',
  redirect: '/home',
  meta: {
    title: 'root',
    constant: true,
    keepAlive: false,
    hidden: true
  }
};

export const ANY_ROUTE = {
  name: 'any',
  path: '/:pathMatch(.*)*',
  redirect: '/error/404',
  meta: {
    title: 'any',
    constant: true,
    keepAlive: false,
    hidden: true
  }
};

export const routes = [
  ROOT_ROUTE,
  LOGIN_ROUTE,
  HOME_ROUTE,
  MANAGE_ROUTE,
  MULTI_ROUTE,
  ERROR_ROUTE,
  EXCEPTION_ROUTE,
  ANY_ROUTE
];
