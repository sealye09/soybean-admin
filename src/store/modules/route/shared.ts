import { useSvgIconRender } from '@sa/hooks';
import { type RouteLocationNormalizedLoaded, type RouteRecordRaw, type _RouteRecordBase, useRouter } from 'vue-router';

import SvgIcon from '@/components/custom/svg-icon.vue';
import BaseLayout from '@/layouts/base-layout/index.vue';
import { $t } from '@/locales';

/**
 *
 * @param name
 */
export function getRoutePathByName(name: string) {
  const router = useRouter();
  return router.resolve({ name }).path;
}

/**
 * Get route path
 *
 * @param path string
 */
export function getRouteNameByPath(path: string) {
  const router = useRouter();
  return router.resolve({ path }).name;
}

/**
 * Filter auth routes by roles
 *
 * @param routes Auth routes
 * @param roles Roles
 */
export function filterAuthRoutesByRoles(routes: RouteRecordRaw[], roles: string[]) {
  const SUPER_ROLE = 'ROOT';

  if (roles.includes(SUPER_ROLE)) return routes;

  return routes.flatMap(route => filterAuthRouteByRoles(route, roles));
}

/**
 * Filter auth route by roles
 *
 * @param route Auth route
 * @param roles Roles
 */
function filterAuthRouteByRoles(route: RouteRecordRaw, roles: string[]) {
  const routeRoles = (route.meta && route.meta.roles) || [];

  if (!routeRoles.length)
    return [route];

  const hasPermission = routeRoles.some(role => roles.includes(role));

  const filterRoute = { ...route };

  if (filterRoute.children?.length)
    filterRoute.children = filterRoute.children.flatMap(item => filterAuthRouteByRoles(item, roles));

  return hasPermission ? [filterRoute] : [];
}

/**
 * 递归过滤有权限的异步(动态)路由, 后端路由
 * 同时处理路径和组件
 *
 * @param routes 接口返回的异步(动态)路由
 * @param roles 用户角色集合
 * @returns 返回用户有权限的异步(动态)路由
 */
export function filterAsyncRoutesByRoles(routes: RouteRecordRaw[], roles: string[]) {
  const asyncRoutes: RouteRecordRaw[] = [];
  const modules = import.meta.glob('/src/views/**/**.vue');

  routes.forEach((route) => {
    const tmpRoute = { ...route }; // ES6扩展运算符复制新对象
    if (!route.name) tmpRoute.name = route.path;

    const hasPermission = tmpRoute.meta?.roles?.some(role => roles.includes(role));

    // 判断用户(角色)是否有该路由的访问权限
    if (hasPermission) {
      if (tmpRoute.component?.toString() === 'Layout') {
        tmpRoute.component = BaseLayout;
      } else {
        const component = modules[`/src/views/${tmpRoute.component}.vue`];
        if (component)
          tmpRoute.component = component;

        else
          tmpRoute.component = modules[`/src/views/404/index.vue`];
      }

      if (tmpRoute.children)
        tmpRoute.children = filterAsyncRoutesByRoles(tmpRoute.children, roles);

      asyncRoutes.push(tmpRoute);
    }
  });

  return asyncRoutes;
}

/**
 * Get global menus by auth routes
 *
 * @param routes Auth routes
 */
export function getGlobalMenusByAuthRoutes(routes: RouteRecordRaw[]) {
  const menus: App.Global.Menu[] = [];

  routes.forEach((route) => {
    if (!route.meta?.hidden) {
      const menu = getGlobalMenuByBaseRoute(route);
      const length = route.children?.length ?? 0;
      const alwaysShow = route.meta?.alwaysShow ?? true;

      // 子节点数量大于1，当做目录处理
      if (length > 1) {
        menu.children = getGlobalMenusByAuthRoutes(route.children as RouteRecordRaw[]);
        menus.push(menu);
      } else if (length === 1) {
        // 子节点数量等于1，alwaysShow === true 当做菜单处理
        if (alwaysShow) {
          menu.children = getGlobalMenusByAuthRoutes(route.children as RouteRecordRaw[]);
          menus.push(menu);
        } else {
          // 子节点数量等于1，alwaysShow === false 当做目录处理
          menus.push(...getGlobalMenusByAuthRoutes(route.children as RouteRecordRaw[]));
        }
      } else if (length === 0) {
        // 子节点数量等于0，当做菜单处理
        menus.push(menu);
      }
    }
  });

  return menus;
}

/**
 * Update locale of global menus
 *
 * @param menus
 */
export function updateLocaleOfGlobalMenus(menus: App.Global.Menu[]) {
  const result: App.Global.Menu[] = [];

  menus.forEach((menu) => {
    const { i18nKey, label, children } = menu;

    const newLabel = i18nKey ? $t(i18nKey) : label;

    const newMenu: App.Global.Menu = {
      ...menu,
      label: newLabel,
    };

    if (children?.length)
      newMenu.children = updateLocaleOfGlobalMenus(children);

    result.push(newMenu);
  });

  return result;
}

/**
 * Get global menu by route
 *
 * @param route
 */
function getGlobalMenuByBaseRoute(route: RouteLocationNormalizedLoaded | RouteRecordRaw) {
  const { SvgIconVNode } = useSvgIconRender(SvgIcon);

  const { name, path } = route;
  const { title, i18nKey, icon = import.meta.env.VITE_MENU_ICON, localIcon } = route.meta ?? {};

  const label = i18nKey ? $t(i18nKey) : title!;

  const menu: App.Global.Menu = {
    key: name as string,
    label,
    i18nKey,
    routeKey: name as string,
    routePath: path as string,
    icon: SvgIconVNode({ icon, localIcon, fontSize: 20 }),
  };

  return menu;
}

/**
 * Get cache route names
 *
 * @param routes Vue routes (two levels)
 */
export function getCacheRouteNames(routes: RouteRecordRaw[]) {
  const cacheNames: string[] = [];

  routes.forEach((route) => {
    // only get last two level route, which has component
    route.children?.forEach((child) => {
      if (child.component && child.meta?.keepAlive)
        cacheNames.push(child.name as string);
    });
  });

  return cacheNames;
}

/**
 * Is route exist by route name
 *
 * @param routeName
 * @param routes
 */
export function isRouteExistByRouteName(routeName: string, routes: RouteRecordRaw[]) {
  return routes.some(route => recursiveGetIsRouteExistByRouteName(route, routeName));
}

/**
 * Recursive get is route exist by route name
 *
 * @param route
 * @param routeName
 */
function recursiveGetIsRouteExistByRouteName(route: RouteRecordRaw, routeName: string) {
  let isExist = route.name === routeName;

  if (isExist)
    return true;

  if (route.children && route.children.length)
    isExist = route.children.some(item => recursiveGetIsRouteExistByRouteName(item, routeName));

  return isExist;
}

/**
 * Get selected menu key path
 *
 * @param selectedKey
 * @param menus
 */
export function getSelectedMenuKeyPathByKey(selectedKey: string, menus: App.Global.Menu[]) {
  const keyPath: string[] = [];

  menus.some((menu) => {
    const path = findMenuPath(selectedKey, menu);

    const find = Boolean(path?.length);

    if (find)
      keyPath.push(...path!);

    return find;
  });

  return keyPath;
}

/**
 * Find menu path
 *
 * @param targetKey Target menu key
 * @param menu Menu
 */
function findMenuPath(targetKey: string, menu: App.Global.Menu): string[] | null {
  const path: string[] = [];

  function dfs(item: App.Global.Menu): boolean {
    path.push(item.key);

    if (item.key === targetKey)
      return true;

    if (item.children) {
      for (const child of item.children) {
        if (dfs(child))
          return true;
      }
    }

    path.pop();

    return false;
  }

  if (dfs(menu))
    return path;

  return null;
}

/**
 * Transform menu to breadcrumb
 *
 * @param menu
 */
function transformMenuToBreadcrumb(menu: App.Global.Menu) {
  const { children, ...rest } = menu;

  const breadcrumb: App.Global.Breadcrumb = {
    ...rest,
  };

  if (children?.length)
    breadcrumb.options = children.map(transformMenuToBreadcrumb);

  return breadcrumb;
}

/**
 * Get breadcrumbs by route
 *
 * @param route
 * @param menus
 */
export function getBreadcrumbsByRoute(
  route: RouteLocationNormalizedLoaded,
  menus: App.Global.Menu[],
): App.Global.Breadcrumb[] {
  const key = route.name as string;
  const activeKey = route.meta?.activeMenu;

  const menuKey = activeKey || key;

  for (const menu of menus) {
    if (menu.key === menuKey) {
      const breadcrumbMenu = menuKey !== activeKey ? menu : getGlobalMenuByBaseRoute(route);

      return [transformMenuToBreadcrumb(breadcrumbMenu)];
    }

    if (menu.children?.length) {
      const result = getBreadcrumbsByRoute(route, menu.children);
      if (result.length > 0)
        return [transformMenuToBreadcrumb(menu), ...result];
    }
  }

  return [];
}
