import { request } from '../../request';
import type { CaptchaResult, LoginData, LoginResult } from './types';

/**
 * 登录API
 *
 * @param data {LoginData}
 * @returns
 */
export function loginApi(data: LoginData) {
  const formData = new FormData();
  formData.append('username', data.username);
  formData.append('password', data.password);
  formData.append('captchaKey', data.captchaKey || '');
  formData.append('captchaCode', data.captchaCode || '');
  return request.post<LoginResult>('/api/v1/auth/login', formData);
}

/** 注销API */
export function logoutApi() {
  return request.delete('/api/v1/auth/logout');
}

/** 获取验证码 */
export function getCaptchaApi() {
  return request.get<CaptchaResult>('/api/v1/auth/captcha');
}
