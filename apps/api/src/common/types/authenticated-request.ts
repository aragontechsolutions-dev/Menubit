import type { Request } from 'express';
import type { Tenant } from '@prisma/client';
import type { JwtClaims } from '@menubit/shared';

/**
 * Request enriquecido por la cadena de guards:
 *  - `auth`  lo setea JwtAuthGuard (claims verificados del JWT de Supabase).
 *  - `tenant` lo setea TenantGuard (tenant activo cargado de la BD).
 */
export interface AuthenticatedRequest extends Request {
  auth?: JwtClaims;
  tenant?: Tenant;
}
