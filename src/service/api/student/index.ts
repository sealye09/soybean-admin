import { request } from '../../request';

import type { StudentForm, StudentPageQuery, StudentPageResult } from './types';

/**
 * 获取学生分页数据
 * @param queryParams
 * @returns 学生分页数据
 */
export function getStudentList(queryParams?: StudentPageQuery) {
  return request.get<StudentPageResult>('/api/v1/students/page', {
    params: queryParams,
  });
}

/**
 * 获取学生详情
 * @param id
 * @returns 学生详情
 */
export function getStudentForm(id: number) {
  return request.get<StudentForm>(`/api/v1/students/${id}/form`);
}

/**
 * 添加学生
 * @param data
 * @returns 添加学生
 */
export function addStudent(data: StudentForm) {
  return request.post('/api/v1/students', data);
}

/**
 * 更新学生
 * @param id
 * @param data
 * @returns 更新学生
 */
export function updateStudent(id: number, data: StudentForm) {
  return request.put(`/api/v1/students/${id}`, data);
}

/**
 * 批量删除学生，多个以英文逗号(,)分割
 * @param ids
 * @returns 删除学生
 */
export function deleteStudents(ids: string) {
  return request.delete(`/api/v1/students/${ids}`);
}
