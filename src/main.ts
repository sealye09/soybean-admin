import { createApp } from 'vue';

import './plugins/assets';
import App from './App.vue';
import AppLoading from './components/common/app-loading.vue';
import { setupI18n } from './locales';
import { setupDayjs, setupIconifyOffline, setupNProgress } from './plugins';
import { setupRouter } from './router';
import { setupStore } from './store';

async function setupApp() {
  const appLoading = createApp(AppLoading);
  appLoading.mount('#appLoading');

  setupNProgress();
  setupIconifyOffline();
  setupDayjs();

  const app = createApp(App);

  setupStore(app);

  await setupRouter(app);

  setupI18n(app);

  appLoading.unmount();
  app.mount('#app');
}

setupApp();
