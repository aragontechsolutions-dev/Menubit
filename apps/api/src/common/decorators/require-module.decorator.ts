import { SetMetadata } from '@nestjs/common';
import type { ModuleKey } from '@menubit/shared';

export const MODULE_KEY = 'requiredModule';

/**
 * Restringe una ruta a tenants con un módulo activo.
 * Uso: `@RequireModule('TABLES')`. Lo valida ModuleGuard contra los módulos
 * activos del tenant (claim `modules[]` del JWT).
 */
export const RequireModule = (moduleKey: ModuleKey) => SetMetadata(MODULE_KEY, moduleKey);
