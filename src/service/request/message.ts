import { ERROR_MSG_DURATION, NO_ERROR_MSG_CODE } from './config';
import type { RequestError } from './type';

/** 错误消息栈，防止同一错误同时出现 */
const errorMsgStack = new Map<string | number, string>([]);

function addErrorMsg(error: RequestError) {
  errorMsgStack.set(error.code, error.msg);
}
function removeErrorMsg(error: RequestError) {
  errorMsgStack.delete(error.code);
}
function hasErrorMsg(error: RequestError) {
  return errorMsgStack.has(error.code);
}

/**
 * 显示错误信息
 * @param error
 */
export function showErrorMsg(error: RequestError) {
  if (!error.msg || NO_ERROR_MSG_CODE.includes(error.code) || hasErrorMsg(error)) return;

  addErrorMsg(error);
  window.console.warn(error.code, error.msg);
  window.$message?.error(error.msg, { duration: ERROR_MSG_DURATION });
  setTimeout(() => {
    removeErrorMsg(error);
  }, ERROR_MSG_DURATION);
}
