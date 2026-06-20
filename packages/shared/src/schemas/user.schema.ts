import { z } from 'zod';
import { userRoleSchema } from './common.schema';

/** Verificación del JWT de Supabase tras login (POST /auth/verify). */
export const verifyAuthSchema = z.object({
  // El token va en el header Authorization; este payload es opcional.
  name: z.string().min(1).max(120).optional(),
});

export const tenantUserSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  supabaseId: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

export type TenantUserDto = z.infer<typeof tenantUserSchema>;

/** PIN de turno: exactamente 4 dígitos. */
export const pinSchema = z
  .string()
  .regex(/^\d{4}$/, 'El PIN debe ser de 4 dígitos');

/** Invitación / alta de usuario dentro de un tenant. */
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  role: userRoleSchema.default('WAITER'),
  pin: pinSchema.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: userRoleSchema.optional(),
  pin: pinSchema.optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
