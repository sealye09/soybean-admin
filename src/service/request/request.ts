import { useBoolean, useLoading } from '@sa/hooks';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { type Ref, ref } from 'vue';

import CustomAxiosInstance from './instance';
import type { BackendResultConfig, RequestError, RequestResult } from './type';

type RequestMethod = 'get' | 'post' | 'put' | 'delete';

interface RequestParam {
  url: string
  method?: RequestMethod
  data?: any
  axiosConfig?: AxiosRequestConfig
}

/**
 * 创建请求
 *
 * @param axiosConfig - Axios配置
 * @param backendConfig - 后端接口字段配置
 */
export function createRequest(axiosConfig: AxiosRequestConfig, backendConfig?: BackendResultConfig) {
  const customInstance = new CustomAxiosInstance(axiosConfig, backendConfig);

  /**
   * 异步promise请求
   *
   * @param param - 请求参数
   *
   *   - Url: 请求地址
   *   - Method: 请求方法(默认get)
   *   - Data: 请求的body的data
   *   - AxiosConfig: axios配置
   */
  async function asyncRequest<T>(param: RequestParam): Promise<RequestResult<T>> {
    const { url } = param;
    const method = param.method || 'get';
    const { instance } = customInstance;
    const res = (await getRequestResponse({
      instance,
      method,
      url,
      data: param.data,
      config: param.axiosConfig,
    })) as RequestResult<T>;

    return res;
  }

  /**
   * Get请求
   *
   * @param url - 请求地址
   * @param config - Axios配置
   */
  function get<T>(url: string, config?: AxiosRequestConfig) {
    return asyncRequest<T>({ url, method: 'get', axiosConfig: config });
  }

  /**
   * Post请求
   *
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - Axios配置
   */
  function post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return asyncRequest<T>({ url, method: 'post', data, axiosConfig: config });
  }
  /**
   * Put请求
   *
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - Axios配置
   */
  function put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return asyncRequest<T>({ url, method: 'put', data, axiosConfig: config });
  }

  /**
   * Delete请求
   *
   * @param url - 请求地址
   * @param config - Axios配置
   */
  function handleDelete<T>(url: string, config?: AxiosRequestConfig) {
    return asyncRequest<T>({ url, method: 'delete', axiosConfig: config });
  }

  return {
    get,
    post,
    put,
    delete: handleDelete,
  };
}

interface RequestResultHook<T = any> {
  data: Ref<T | null>
  error: Ref<RequestError | null>
  loading: Ref<boolean>
  network: Ref<boolean>
}

/**
 * 创建hooks请求
 *
 * @param axiosConfig - Axios配置
 * @param backendConfig - 后端接口字段配置
 */
export function createHookRequest(axiosConfig: AxiosRequestConfig, backendConfig?: BackendResultConfig) {
  const customInstance = new CustomAxiosInstance(axiosConfig, backendConfig);

  /**
   * Hooks请求
   *
   * @param param - 请求参数
   *
   *   - Url: 请求地址
   *   - Method: 请求方法(默认get)
   *   - Data: 请求的body的data
   *   - AxiosConfig: axios配置
   */
  function useRequest<T>(param: RequestParam): RequestResultHook<T> {
    const { loading, startLoading, endLoading } = useLoading();
    const { bool: network, setBool: setNetwork } = useBoolean(window.navigator.onLine);

    startLoading();
    const data = ref<T | null>(null) as Ref<T | null>;
    const error = ref<RequestError | null>(null);

    function handleRequestResult(response: any) {
      const res = response as RequestResult<T>;
      data.value = res.data;
      error.value = res.error;
      endLoading();
      setNetwork(window.navigator.onLine);
    }

    const { url } = param;
    const method = param.method || 'get';
    const { instance } = customInstance;

    getRequestResponse({
      instance,
      method,
      url,
      data: param.data,
      config: param.axiosConfig,
    }).then(handleRequestResult);

    return {
      data,
      error,
      loading,
      network,
    };
  }

  /**
   * Get请求
   *
   * @param url - 请求地址
   * @param config - Axios配置
   */
  function get<T>(url: string, config?: AxiosRequestConfig) {
    return useRequest<T>({ url, method: 'get', axiosConfig: config });
  }

  /**
   * Post请求
   *
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - Axios配置
   */
  function post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return useRequest<T>({ url, method: 'post', data, axiosConfig: config });
  }
  /**
   * Put请求
   *
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - Axios配置
   */
  function put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return useRequest<T>({ url, method: 'put', data, axiosConfig: config });
  }

  /**
   * Delete请求
   *
   * @param url - 请求地址
   * @param config - Axios配置
   */
  function handleDelete<T>(url: string, config: AxiosRequestConfig) {
    return useRequest<T>({ url, method: 'delete', axiosConfig: config });
  }

  return {
    get,
    post,
    put,
    delete: handleDelete,
  };
}

async function getRequestResponse(params: {
  instance: AxiosInstance
  method: RequestMethod
  url: string
  data?: any
  config?: AxiosRequestConfig
}) {
  const { instance, method, url, data, config } = params;

  let res: any;
  if (method === 'get' || method === 'delete')
    res = await instance[method](url, config);

  else
    res = await instance[method](url, data, config);

  return res;
}
