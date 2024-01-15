import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import type { App } from 'vue';

import { resetSetupStore } from './plugins';
import { subscribeAuthStore } from './subscribe/auth';

/** Setup Vue store plugin pinia */
export function setupStore(app: App) {
  const pinia = createPinia();

  pinia.use(resetSetupStore);
  pinia.use(piniaPluginPersistedstate);

  app.use(pinia);
  subscribeAuthStore();
}

export * from './modules/app';
export * from './modules/auth';
export * from './modules/route';
export * from './modules/tab';
export * from './modules/theme';
