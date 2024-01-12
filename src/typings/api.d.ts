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
    interface LoginToken {
      token: string
      refreshToken: string
    }

    interface UserInfo {
      userId: string
      username: string
      roles: string[]
    }
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

    interface UserRoute {
      routes: MenuRoute[]
      home: string
    }
  }
}
