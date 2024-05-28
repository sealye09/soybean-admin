import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

import { localStg } from '@/utils/storage';

import { REFRESH_TOKEN_CODE } from './config';
import {
  handleAxiosError,
  handleBackendError,
  handleRefreshToken,
  handleResponseError,
  handleServiceResult,
} from './handler';
import type { BackendResultConfig } from './type';

// eslint-disable-next-line unused-imports/no-unused-vars
type RefreshRequestQueue = (config: AxiosRequestConfig) => void;

/**
 * 封装axios请求类
 */
export default class CustomAxiosInstance {
  instance: AxiosInstance;
  backendConfig: BackendResultConfig;
  // isRefreshing: boolean;
  // retryQueues: RefreshRequestQueue[];

  /**
   * @param axiosConfig - Axios配置
   * @param backendConfig - 后端返回的数据配置
   */
  constructor(
    axiosConfig: AxiosRequestConfig,
    backendConfig: BackendResultConfig = {
      codeKey: 'code',
      dataKey: 'data',
      msgKey: 'message',
      successCodes: [200],
    },
  ) {
    this.backendConfig = backendConfig;
    this.instance = axios.create(axiosConfig);
    this.setRequestInterceptor();
    this.setResponseInterceptor();
    // this.isRefreshing = false;
    // this.retryQueues = [];
  }

  /** 设置请求拦截器 */
  setRequestInterceptor() {
    this.instance.interceptors.request.use(
      async (config) => {
        const handleConfig = { ...config };
        if (handleConfig.headers) {
          // 设置token
          const token = localStg.get('token') || '';
          const tokenType = localStg.get('tokenType') || '';
          if (!!token && !!tokenType)
            handleConfig.headers.Authorization = `${tokenType} ${token}`;
        }
        return handleConfig;
      },
      (axiosError: AxiosError) => {
        const error = handleAxiosError(axiosError);
        return handleServiceResult(error, null);
      },
    );
  }

  // 设置响应拦截器
  setResponseInterceptor() {
    this.instance.interceptors.response.use(
      (async (response: AxiosResponse) => {
        const { status, config: _config, data } = response;
        const { codeKey, dataKey, successCodes } = this.backendConfig;
        const code = data[codeKey] as string | number;

        if (status === 200 || status < 300 || status === 304) {
          // 请求成功
          if (successCodes.includes(code)) return handleServiceResult(null, data[dataKey]);

          // token失效, 刷新token
          // if (REFRESH_TOKEN_CODE.includes(code)) {
          //   // 原始请求
          //   const originRequest = new Promise((resolve) => {
          //     this.retryQueues.push((refreshConfig: AxiosRequestConfig) => {
          //       _config.headers.Authorization = refreshConfig.headers?.Authorization;
          //       resolve(this.instance.request(_config));
          //     });
          //   });

          //   if (!this.isRefreshing) {
          //     this.isRefreshing = true;
          //     const refreshConfig = await handleRefreshToken(response.config);
          //     if (refreshConfig) this.retryQueues.map(cb => cb(refreshConfig));

          //     this.retryQueues = [];
          //     this.isRefreshing = false;
          //   }
          //   return originRequest;
          // }

          // 业务错误
          const error = handleBackendError(data, this.backendConfig);
          return handleServiceResult(error, null);
        }

        // 网络错误
        // const error = handleResponseError(response);
        const error = handleBackendError(data, this.backendConfig);
        return handleServiceResult(error, null);
      }) as unknown as (response: AxiosResponse<any, any>) => Promise<AxiosResponse<any, any>>,
      (axiosError: AxiosError) => {
        // 请求失败 axios错误
        // const error = handleAxiosError(axiosError);
        const error = handleBackendError(axiosError.response?.data as any, this.backendConfig);
        return handleServiceResult(error, null);
      },
    );
  }
}
