import { localStg } from '@/utils/storage';

import { useAuthStore } from '../modules/auth';

export function subscribeAuthStore() {
  useAuthStore().$subscribe((mutation, state) => {
    // 每当状态发生变化时，将整个 state 持久化到本地存储。
    localStg.set('token', state.token);
    localStg.set('tokenType', state.tokenType);
    localStg.set('refreshToken', state.refreshToken);
  });
}
