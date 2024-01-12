import { BACKEND_CONFIG } from './config';
import { createRequest } from './request';

import { createProxyPattern, createServiceConfig } from '~/env.config';

const { baseURL } = createServiceConfig(import.meta.env);

const isHttpProxy = import.meta.env.VITE_HTTP_PROXY === 'Y';

export const request = createRequest({ baseURL: isHttpProxy ? createProxyPattern() : baseURL }, BACKEND_CONFIG);
