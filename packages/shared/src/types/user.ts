import type { z } from 'zod';
import type {
  createUserSchema,
  tenantUserSchema,
  updateUserSchema,
} from '../schemas/user.schema';
import type { Tenant } from './tenant';

export type TenantUser = z.infer<typeof tenantUserSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

/** Respuesta de GET /auth/me: el usuario y su tenant (si ya tiene). */
export interface AuthMe {
  user: TenantUser;
  tenant: Tenant | null;
}
