import { createRequest } from './request';
import { BACKEND_CONFIG } from './config';

export const request = createRequest({ baseURL: 'http://127.0.0.1:8989' }, BACKEND_CONFIG);
