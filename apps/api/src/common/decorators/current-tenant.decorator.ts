import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Tenant } from '@prisma/client';
import type { AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Inyecta el tenant resuelto por TenantGuard.
 * Uso: `@CurrentTenant() tenant: Tenant` o `@CurrentTenant('id') id: string`.
 */
export const CurrentTenant = createParamDecorator(
  (data: keyof Tenant | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const tenant = req.tenant;
    return data && tenant ? tenant[data] : tenant;
  },
);
