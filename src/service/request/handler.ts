import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useRouter } from 'vue-router';

import { LOGIN_ROUTE } from '@/router/routes';
import { useRouteStore } from '@/store';
import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';

import {
  DEFAULT_REQUEST_ERROR_CODE,
  DEFAULT_REQUEST_ERROR_MSG,
  ERROR_STATUS,
  NETWORK_ERROR_CODE,
  NETWORK_ERROR_MSG,
  REQUEST_TIMEOUT_CODE,
  REQUEST_TIMEOUT_MSG,
} from './config';
import { showErrorMsg } from './message';
import type { BackendResultConfig, FailedResult, RequestError, SuccessResult } from './type';

type ErrorStatus = keyof typeof ERROR_STATUS;

/**
 * 处理常见的异常
 * router 没挂载
 * @param err
 */
function handleError(err: RequestError) {
  const code = err.code.toString();
  showErrorMsg(err);

  if (code === '401' || code === 'A0230') {
    const path = window.location.pathname;
    if (!path.includes(LOGIN_ROUTE.path)) {
      console.log('🚀 ~ handleError ~ path:', path);

      window.$dialog?.error({
        title: '登录已过期',
        content: '登录已过期，请重新登录',
        closable: false,
        maskClosable: false,
        positiveText: '去登录',
        onPositiveClick: () => {
          const authStore = useAuthStore();
          const routeStore = useRouteStore();

          if (routeStore.isInitAuthRoute) {
            authStore.resetStore();
            routeStore.resetStore();
          } else {
            localStg.remove('auth-store' as any);
            localStg.remove('route-store' as any);
            localStg.remove('token');
          }
        },
      });
    }
  }
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
    msg: DEFAULT_REQUEST_ERROR_MSG,
  };

  if (axiosError.message === 'Network Error') {
    // 请求超时
    Object.assign(error, { code: NETWORK_ERROR_CODE, msg: NETWORK_ERROR_MSG });
  } else if (axiosError.code === REQUEST_TIMEOUT_CODE && axiosError.message.includes('timeout')) {
    // 超时错误
    Object.assign(error, { code: REQUEST_TIMEOUT_CODE, msg: REQUEST_TIMEOUT_MSG });
  } else {
    // 请求不成功的错误
    const errorCode: ErrorStatus = (axiosError.response?.status as ErrorStatus) || 'DEFAULT';
    const msg = ERROR_STATUS[errorCode];
    Object.assign(error, { code: errorCode, msg });
  }

  handleError(error);
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
    msg: DEFAULT_REQUEST_ERROR_MSG,
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
  handleError(error);
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
    msg: backendResult[msgKey],
  };
  handleError(error);
  return error;
}

/**
 * 刷新token
 *
 * @param axiosConfig - Token失效时的请求配置
 */
export async function handleRefreshToken(axiosConfig: AxiosRequestConfig) {
  const authStore = useAuthStore();
  const router = useRouter();
  router.push({ name: LOGIN_ROUTE.name, query: { redirect: router.currentRoute.value.fullPath } });
  authStore.resetStore();
  window.$message?.success('登录已过期，请重新登录');
  axiosConfig.headers?.Authorization && delete axiosConfig.headers.Authorization;
  return null;
}

/** 统一失败和成功的请求结果的数据类型 */
export async function handleServiceResult<T = any>(error: RequestError | null, data: any) {
  if (error) {
    const fail: FailedResult = {
      error,
      data: null,
    };
    return fail;
  }
  const success: SuccessResult<T> = {
    error: null,
    data,
  };
  return success;
}
