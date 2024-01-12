import type { ProxyOptions } from 'vite';
import { createProxyPattern, createServiceConfig } from '../../env.config';

/**
 * Set http proxy
 *
 * @param env - The current env
 */
export function createViteProxy(env: Env.ImportMeta) {
  const isEnableHttpProxy = env.VITE_HTTP_PROXY === 'Y';

  if (!isEnableHttpProxy) return undefined;

  const { baseURL } = createServiceConfig(env);

  const defaultProxyPattern = createProxyPattern();

  const proxy: Record<string, ProxyOptions> = {
    [defaultProxyPattern]: {
      target: baseURL,
      changeOrigin: true,
      rewrite: path => path.replace(new RegExp(`^${defaultProxyPattern}`), '')
    }
  };

  return proxy;
}
