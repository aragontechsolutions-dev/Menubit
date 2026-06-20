import { SetMetadata } from '@nestjs/common';

export const ALLOW_NO_TENANT_KEY = 'allowNoTenant';

/**
 * Permite acceder a una ruta autenticada aunque el usuario todavía no tenga
 * tenant (ej: onboarding que crea el tenant, GET /auth/me).
 */
export const AllowNoTenant = () => SetMetadata(ALLOW_NO_TENANT_KEY, true);
