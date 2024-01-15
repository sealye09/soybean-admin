import { request } from '../../request';
import type { OptionType } from '../type';

import type { DictForm, DictPageResult, DictQuery, DictTypeForm, DictTypePageResult, DictTypeQuery } from './types';

/**
 * 字典类型分页列表
 *
 * @param queryParams
 */
export function getDictTypePage(queryParams: DictTypeQuery) {
  return request.get<DictTypePageResult>('/api/v1/dict/types/page', {
    params: queryParams,
  });
}

/**
 * 字典类型表单数据
 *
 * @param id
 */
export function getDictTypeForm(id: number) {
  return request.get<DictTypeForm>(`/api/v1/dict/types/${id}/form`);
}

/**
 * 新增字典类型
 *
 * @param data
 */
export function addDictType(data: DictTypeForm) {
  return request.post('/api/v1/dict/types', data);
}

/**
 * 修改字典类型
 *
 * @param id
 * @param data
 */
export function updateDictType(id: number, data: DictTypeForm) {
  return request.put(`/api/v1/dict/types/${id}`, data);
}

/** 删除字典类型 */
export function deleteDictTypes(ids: string) {
  return request.delete(`/api/v1/dict/types/${ids}`);
}

/**
 * 获取字典类型的数据项
 *
 * @param typeCode 字典类型编码
 */
export function getDictOptions(typeCode: string) {
  return request.get<OptionType[]>(`/api/v1/dict/${typeCode}/options`);
}

/** 字典分页列表 */
export function getDictPage(queryParams: DictQuery) {
  return request.get<DictPageResult>('/api/v1/dict/page', {
    params: queryParams,
  });
}

/**
 * 获取字典表单数据
 *
 * @param id
 */
export function getDictFormData(id: number) {
  return request.get<DictForm>(`/api/v1/dict/${id}/form`);
}

/**
 * 新增字典
 *
 * @param data
 */
export function addDict(data: DictForm) {
  return request.post('/api/v1/dict', data);
}

/**
 * 修改字典项
 *
 * @param id
 * @param data
 */
export function updateDict(id: number, data: DictForm) {
  return request.put(`/api/v1/dict/${id}`, data);
}

/**
 * 删除字典
 *
 * @param ids 字典项ID，多个以英文逗号(,)分割
 */
export function deleteDict(ids: string) {
  return request.delete(`/api/v1/dict/${ids}`);
}
