import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  DEFAULT_REQUEST_ERROR_CODE,
  DEFAULT_REQUEST_ERROR_MSG,
  ERROR_STATUS,
  NETWORK_ERROR_CODE,
  NETWORK_ERROR_MSG,
  REQUEST_TIMEOUT_CODE,
  REQUEST_TIMEOUT_MSG
} from './config';
import type { BackendResultConfig, FailedResult, RequestError, SuccessResult } from './type';

type ErrorStatus = keyof typeof ERROR_STATUS;

export function showErrorMsg(error: RequestError) {
  console.log('showErrorMsg', error);
}

/**
 * 处理axios请求失败的错误
 *
 * @param axiosError - 错误
 */
export function handleAxiosError(axiosError: AxiosError) {
  const error: RequestError = {
    type: 'axios',
    code: DEFAULT_REQUEST_ERROR_CODE,
    msg: DEFAULT_REQUEST_ERROR_MSG
  };

  if (axiosError.message === 'Network Error') {
    // 请求超时
    Object.assign(error, { code: NETWORK_ERROR_CODE, msg: NETWORK_ERROR_MSG });
  } else if (axiosError.code === REQUEST_TIMEOUT_CODE && axiosError.message.includes('timeout')) {
    // 超时错误
    Object.assign(error, {
      code: REQUEST_TIMEOUT_CODE,
      msg: REQUEST_TIMEOUT_MSG
    });
  } else {
    // 请求不成功的错误
    const errorCode: ErrorStatus = (axiosError.response?.status as ErrorStatus) || 'DEFAULT';
    const msg = ERROR_STATUS[errorCode];
    Object.assign(error, { code: errorCode, msg });
  }

  showErrorMsg(error);
  return error;
}

/**
 * 处理请求成功后的错误
 *
 * @param response - 请求的响应
 */
export function handleResponseError(response: AxiosResponse) {
  const error: RequestError = {
    type: 'axios',
    code: DEFAULT_REQUEST_ERROR_CODE,
    msg: DEFAULT_REQUEST_ERROR_MSG
  };

  if (!window.navigator.onLine) {
    // 网路错误
    Object.assign(error, { code: NETWORK_ERROR_CODE, msg: NETWORK_ERROR_MSG });
  } else {
    // 请求成功的状态码非200的错误
    const errorCode: ErrorStatus = response.status as ErrorStatus;
    const msg = ERROR_STATUS[errorCode] || DEFAULT_REQUEST_ERROR_MSG;
    Object.assign(error, { type: 'http', code: errorCode, msg });
  }
  showErrorMsg(error);
  return error;
}

/**
 * 处理后端返回的错误(业务错误)
 *
 * @param backendResult - 后端接口的响应数据
 */
export function handleBackendError(backendResult: Record<string, any>, config: BackendResultConfig) {
  const { codeKey, msgKey } = config;
  const error: RequestError = {
    type: 'backend',
    code: backendResult[codeKey],
    msg: backendResult[msgKey]
  };
  showErrorMsg(error);
  return error;
}

/**
 * 刷新token
 *
 * @param axiosConfig - Token失效时的请求配置
 */
export async function handleRefreshToken(axiosConfig: AxiosRequestConfig) {
  // const { resetAuthStore } = useAuthStore();
  // const refreshToken = localStg.get('refreshToken') || '';
  // if (data) {
  //   localStg.set('token', data.token);
  //   localStg.set('refreshToken', data.refreshToken);

  //   const config = { ...axiosConfig };
  //   if (config.headers) {
  //     config.headers.Authorization = data.token;
  //   }
  //   return config;
  // }

  // resetAuthStore();
  axiosConfig.data = {};
  console.error('handleRefreshToken 未配置');
  return null;
}

/** 统一失败和成功的请求结果的数据类型 */
export async function handleServiceResult<T = any>(error: RequestError | null, data: any) {
  if (error) {
    const fail: FailedResult = {
      error,
      data: null
    };
    return fail;
  }
  const success: SuccessResult<T> = {
    error: null,
    data
  };
  return success;
}
