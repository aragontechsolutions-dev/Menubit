import type { z } from 'zod';
import type {
  branchSchema,
  createTenantSchema,
  tenantModuleSchema,
  tenantSchema,
} from '../schemas/tenant.schema';

export type Tenant = z.infer<typeof tenantSchema>;
export type Branch = z.infer<typeof branchSchema>;
export type TenantModule = z.infer<typeof tenantModuleSchema>;
export type CreateTenant = z.infer<typeof createTenantSchema>;

/** Tenant + relaciones, tal como lo consume el frontend tras el onboarding. */
export interface TenantWithRelations extends Tenant {
  branches: Branch[];
  modules: TenantModule[];
}
