import { request } from '../../request';
import type { OptionType } from '../type';

import type { DeptForm, DeptQuery, DeptVO } from './types';

/**
 * 部门树形表格
 *
 * @param queryParams
 */
export function listDepts(queryParams?: DeptQuery) {
  return request.get<DeptVO[]>('/api/v1/dept', {
    params: queryParams,
  });
}

/** 部门下拉列表 */
export function getDeptOptions() {
  return request.get<OptionType[]>('/api/v1/dept/options');
}

/**
 * 获取部门详情
 *
 * @param id
 */
export function getDeptForm(id: number) {
  return request.get<DeptForm>(`/api/v1/dept/${id}/form`);
}

/**
 * 新增部门
 *
 * @param data
 */
export function addDept(data: DeptForm) {
  return request.post('/api/v1/dept', data);
}

/**
 * 修改部门
 *
 * @param id
 * @param data
 */
export function updateDept(id: number, data: DeptForm) {
  return request.put(`/api/v1/dept/${id}`, data);
}

/**
 * 删除部门
 *
 * @param ids
 */
export function deleteDept(ids: string) {
  return request.delete(`/api/v1/dept/${ids}`);
}

/**
 * 根据层级获取部门列表
 *
 * @param depth
 * @returns 部门列表
 */
export function getDeptsByDepth(depth: number) {
  return request.get<DeptVO[]>(`/api/v1/dept/tree/${depth}`);
}

/**
 * 根据父级id获取部门列表
 * @param parentId
 * @returns 部门列表
 */
export function getDeptsByParentId(parentId: number) {
  return request.get<DeptVO[]>(`/api/v1/dept/listByParentId/${parentId}`);
}
