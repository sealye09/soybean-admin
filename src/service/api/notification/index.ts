import { request } from '../../request';

import type { NotificationForm, NotificationPageResult, NotificationQuery } from './types';

/**
 * 获取通知分页数据
 * @param queryParams
 * @returns 通知分页数据
 */
export function getNotificationList(queryParams?: NotificationQuery) {
  return request.get<NotificationPageResult>('/api/v1/notifications', {
    params: queryParams,
  });
}

/**
 * 获取通知详情
 * @param id
 * @returns 通知详情
 */
export function getNotificationForm(id: number) {
  return request.get<NotificationForm>(`/api/v1/notifications/${id}/form`);
}

/**
 * 添加通知
 * @param data
 * @returns 添加通知
 */
export function addNotification(data: NotificationForm) {
  return request.post('/api/v1/notifications', data);
}

/**
 * 更新通知
 * @param id
 * @param data
 * @returns 更新通知
 */
export function updateNotification(id: number, data: NotificationForm) {
  return request.put(`/api/v1/notifications/${id}`, data);
}

/**
 * 批量删除通知，多个以英文逗号(,)分割
 * @param ids
 * @returns 删除通知
 */
export function deleteNotifications(ids: string) {
  return request.delete(`/api/v1/notifications/${ids}`);
}
