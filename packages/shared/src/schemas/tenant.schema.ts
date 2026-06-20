import { z } from 'zod';
import { moduleKeySchema, planTypeSchema, slugSchema, tenantStatusSchema } from './common.schema';

/** Payload para crear un tenant durante el onboarding. */
export const createTenantSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
  slug: slugSchema.optional(),
  // Datos de la primera sucursal (todo tenant nace con una sucursal).
  branchName: z.string().min(2).max(80).default('Sucursal principal'),
  timezone: z.string().default('America/Montevideo'),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

/** Representación pública de un tenant devuelta por la API. */
export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: tenantStatusSchema,
  plan: planTypeSchema,
  trialEndsAt: z.string().datetime().nullable(),
  settings: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const branchSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  timezone: z.string(),
  isActive: z.boolean(),
});

export const tenantModuleSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  moduleKey: moduleKeySchema,
  isActive: z.boolean(),
  config: z.record(z.unknown()).default({}),
});
