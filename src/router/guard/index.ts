import type { Router } from 'vue-router';

import { createPermissionGuard } from './permission';
import { createProgressGuard } from './progress';
import { createDocumentTitleGuard } from './title';

/**
 * Router guard
 *
 * @param router - Router instance
 */
export function createRouterGuard(router: Router) {
  createProgressGuard(router);
  createPermissionGuard(router);
  createDocumentTitleGuard(router);
}
