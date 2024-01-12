import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { PluginOption } from 'vite';
import progress from 'vite-plugin-progress';
import VueDevtools from 'vite-plugin-vue-devtools';

import { setupUnocss } from './unocss';
import { setupUnplugin } from './unplugin';

export function setupVitePlugins(viteEnv: Env.ImportMeta) {
  const plugins: PluginOption = [
    vue({
      script: {
        defineModel: false,
      },
    }),
    vueJsx(),
    VueDevtools(),
    setupUnocss(viteEnv),
    ...setupUnplugin(viteEnv),
    progress(),
  ];

  return plugins;
}
