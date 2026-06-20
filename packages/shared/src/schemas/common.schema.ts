import { z } from 'zod';

/**
 * Enums de dominio compartidos. Reflejan los enums de Prisma (sección 12 del
 * PROJECT_CONTEXT). Mantener sincronizados con `apps/api/prisma/schema.prisma`.
 */

export const tenantStatusSchema = z.enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED']);

export const planTypeSchema = z.enum(['STARTER', 'BASIC', 'PRO', 'ENTERPRISE']);

export const userRoleSchema = z.enum(['OWNER', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER']);

export const moduleKeySchema = z.enum([
  'POS',
  'TABLES',
  'KITCHEN_DISPLAY',
  'DELIVERY',
  'INVENTORY',
  'RESERVATIONS',
  'DIGITAL_MENU',
  'LOYALTY',
  'REPORTS_ADVANCED',
  'ELECTRONIC_INVOICE',
  'MULTI_BRANCH',
  'HR_BASIC',
]);

/** Slug: minúsculas, números y guiones. Usado para la URL del tenant. */
export const slugSchema = z
  .string()
  .min(3, 'Mínimo 3 caracteres')
  .max(48, 'Máximo 48 caracteres')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones');

/** Helper para generar un slug a partir de un nombre libre. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita diacríticos (tildes, ñ -> n se trata abajo)
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/** Respuesta de error normalizada de la API. */
export const apiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
});
