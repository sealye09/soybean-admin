import { request } from '../../request';
import type { RoleForm, RolePageResult, RoleQuery } from './types';

/**
 * 获取角色分页数据
 *
 * @param queryParams
 */
export function getRolePage(queryParams?: RoleQuery) {
  return request.get<RolePageResult>('/api/v1/roles/page', {
    params: queryParams
  });
}

/**
 * 获取角色下拉数据
 *
 * @param queryParams
 */
export function getRoleOptions(queryParams?: RoleQuery) {
  return request.get<OptionType[]>('/api/v1/roles/options', {
    params: queryParams
  });
}

/**
 * 获取角色的菜单ID集合
 *
 * @param queryParams
 */
export function getRoleMenuIds(roleId: number) {
  return request.get<number[]>(`/api/v1/roles/${roleId}/menuIds`);
}

/**
 * 分配菜单权限给角色
 *
 * @param queryParams
 */
export function updateRoleMenus(roleId: number, data: number[]) {
  return request.put<unknown>(`/api/v1/roles/${roleId}/menus`, data);
}

/**
 * 获取角色详情
 *
 * @param id
 */
export function getRoleForm(id: number) {
  return request.get<RoleForm>(`/api/v1/roles/${id}/form`);
}

/**
 * 添加角色
 *
 * @param data
 */
export function addRole(data: RoleForm) {
  return request.post('/api/v1/roles', data);
}

/**
 * 更新角色
 *
 * @param id
 * @param data
 */
export function updateRole(id: number, data: RoleForm) {
  return request.put(`/api/v1/roles/${id}`, data);
}

/**
 * 批量删除角色，多个以英文逗号(,)分割
 *
 * @param ids
 */
export function deleteRoles(ids: string) {
  return request.delete(`/api/v1/roles/${ids}`);
}
