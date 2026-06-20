import type { z } from 'zod';
import type {
  apiErrorSchema,
  moduleKeySchema,
  planTypeSchema,
  tenantStatusSchema,
  userRoleSchema,
} from '../schemas/common.schema';

export type TenantStatus = z.infer<typeof tenantStatusSchema>;
export type PlanType = z.infer<typeof planTypeSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type ModuleKey = z.infer<typeof moduleKeySchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;

/**
 * Claims que viajan en el JWT de Supabase (custom claims añadidos vía hook /
 * función de Supabase Auth). El backend confía en estos para resolver tenant,
 * rol y módulos activos sin pegarle a la BD en cada request.
 */
export interface JwtClaims {
  sub: string; // supabase user id
  email: string;
  tenant_id?: string;
  role?: UserRole;
  modules?: ModuleKey[];
  iat?: number;
  exp?: number;
}
