import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_NO_TENANT_KEY } from '../decorators/allow-no-tenant.decorator';
import type { AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Resuelve el tenant del usuario:
 *  - Lee `tenant_id` del JWT (preferido) o del header `x-tenant-id`.
 *  - Confirma que el tenant existe y no está CANCELLED/SUSPENDED.
 *  - Lo adjunta al request como `req.tenant`.
 *
 * Rutas @Public() se omiten. Rutas @AllowNoTenant() (ej: onboarding, /auth/me)
 * pasan aunque el usuario aún no tenga tenant.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const allowNoTenant = this.reflector.getAllAndOverride<boolean>(ALLOW_NO_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.auth) {
      throw new UnauthorizedException('No autenticado');
    }

    const tenantId =
      req.auth.tenant_id ?? (req.headers['x-tenant-id'] as string | undefined) ?? null;

    if (!tenantId) {
      if (allowNoTenant) return true;
      throw new ForbiddenException('El usuario no pertenece a ningún tenant');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      if (allowNoTenant) return true;
      throw new ForbiddenException('Tenant no encontrado');
    }

    if (tenant.status === 'CANCELLED' || tenant.status === 'SUSPENDED') {
      throw new ForbiddenException(`Tenant ${tenant.status.toLowerCase()}`);
    }

    req.tenant = tenant;
    return true;
  }
}
