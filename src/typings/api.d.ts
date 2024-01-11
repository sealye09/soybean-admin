import type { RouteRecordRaw } from 'vue-router';

/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  /**
   * Namespace Auth
   *
   * Backend api module: "auth"
   */
  namespace Auth {
    type LoginToken = {
      token: string
      refreshToken: string
    };

    type UserInfo = {
      userId: string
      username: string
      roles: string[]
    };
  }

  /**
   * Namespace Route
   *
   * Backend api module: "route"
   */
  namespace Route {
    type MenuRoute = {
      id: string
    } & RouteRecordRaw;

    type UserRoute = {
      routes: MenuRoute[]
      home: string
    };
  }
}
