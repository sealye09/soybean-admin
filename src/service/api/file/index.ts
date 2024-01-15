import { request } from '../../request';

import type { FileInfo } from './types';

/**
 * 上传文件
 *
 * @param file
 */
export function uploadFileApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<FileInfo>('/api/v1/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 删除文件
 *
 * @param filePath 文件完整路径
 */
export function deleteFileApi(filePath?: string) {
  return request.delete('/api/v1/files', {
    params: { filePath },
  });
}
