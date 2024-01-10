import { request } from '../../request';
import type { MenuForm, MenuQuery, MenuVO } from './types';

/** 获取路由列表 */
export function listRoutes() {
  return request.get('/api/v1/menus/routes');
}

/**
 * 获取菜单树形列表
 *
 * @param queryParams
 */
export function listMenus(queryParams: MenuQuery) {
  return request.get<MenuVO[]>('/api/v1/menus', {
    params: queryParams
  });
}

/** 获取菜单下拉树形列表 */
export function getMenuOptions() {
  return request.get<OptionType[]>('/api/v1/menus/options');
}

/**
 * 获取菜单表单数据
 *
 * @param id
 */
export function getMenuForm(id: number) {
  return request.get<MenuForm>(`/api/v1/menus/${id}/form`);
}

/**
 * 添加菜单
 *
 * @param data
 */
export function addMenu(data: MenuForm) {
  return request.post('/api/v1/menus', data);
}

/**
 * 修改菜单
 *
 * @param id
 * @param data
 */
export function updateMenu(id: string, data: MenuForm) {
  return request.put(`/api/v1/menus/${id}`, data);
}

/**
 * 删除菜单
 *
 * @param id 菜单ID
 */
export function deleteMenu(id: number) {
  return request.delete(`/api/v1/menus/${id}`);
}
