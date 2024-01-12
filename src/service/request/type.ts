/** 请求的相关类型 */
/**
 * 请求的错误类型：
 *
 * - Axios: axios错误：网络错误, 请求超时, 默认的兜底错误
 * - Http: 请求成功，响应的http状态码非200的错误
 * - Backend: 请求成功，响应的http状态码为200，由后端定义的业务错误
 */
export type RequestErrorType = 'axios' | 'http' | 'backend';

/** 请求错误 */
export interface RequestError {
  /** 请求服务的错误类型 */
  type: RequestErrorType
  /** 错误码 */
  code: string | number
  /** 错误信息 */
  msg: string
}

/** 后端接口返回的数据结构配置 */
export interface BackendResultConfig {
  /** 表示后端请求状态码的属性字段 */
  codeKey: string
  /** 表示后端请求数据的属性字段 */
  dataKey: string
  /** 表示后端消息的属性字段 */
  msgKey: string
  /** 后端业务上定义的成功请求的状态 */
  successCodes: (string | number)[]
}

/** 自定义的请求成功结果 */
export interface SuccessResult<T = any> {
  /** 请求错误 */
  error: null
  /** 请求数据 */
  data: T
}

/** 自定义的请求失败结果 */
export interface FailedResult {
  /** 请求错误 */
  error: RequestError
  /** 请求数据 */
  data: null
}

/** 自定义的请求结果 */
export type RequestResult<T = any> = SuccessResult<T> | FailedResult;

/** 多个请求数据结果 */
export type MultiRequestResult<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [First] extends [any]
      ? Rest extends any[]
        ? [RequestResult<First>, ...MultiRequestResult<Rest>]
        : [RequestResult<First>]
      : Rest extends any[]
        ? MultiRequestResult<Rest>
        : []
  : [];

/** 请求结果的适配器函数 */
export type ServiceAdapter<T = any, A extends any[] = any> = (...args: A) => T;
