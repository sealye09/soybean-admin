import { defineConfig } from '@hey-api/openapi-ts';
import { resolve } from 'path';

export default defineConfig({
  input: resolve('api-docs/admin.json'),
  output: 'src/service/api/generated',
  plugins: ['@hey-api/typescript']
});
