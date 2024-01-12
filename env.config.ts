/**
 * Create service config by current env
 *
 * @param env The current env
 */
export function createServiceConfig(env: Env.ImportMeta) {
  const serviceConfigMap: App.Service.ServiceConfigMap = {
    dev: {
      baseURL: 'http://localhost:8989',
    },
    test: {
      baseURL: 'http://localhost:8989',
    },
    prod: {
      baseURL: 'http://localhost:8989',
    },
  };

  const { VITE_SERVICE_ENV = 'dev' } = env;

  return serviceConfigMap[VITE_SERVICE_ENV];
}

/**
 * Get proxy pattern of service url
 *
 * @param key If not set, will use the default key
 */
export function createProxyPattern(key?: App.Service.OtherBaseURLKey) {
  if (!key) return '/proxy';

  return `/proxy-${key}`;
}
