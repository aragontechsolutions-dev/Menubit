import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@menubit/shared';

export const ROLES_KEY = 'roles';

/**
 * Restringe una ruta a uno o más roles.
 * Uso: `@Roles('OWNER', 'MANAGER')`.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
