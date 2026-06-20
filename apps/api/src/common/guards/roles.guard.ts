import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@menubit/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Valida el rol del usuario (claim `role` del JWT) contra los roles exigidos
 * por @Roles(). Sin @Roles() la ruta queda abierta a cualquier usuario
 * autenticado del tenant.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.auth) {
      throw new UnauthorizedException('No autenticado');
    }

    const role = req.auth.role;
    if (!role || !required.includes(role)) {
      throw new ForbiddenException(
        `Permisos insuficientes. Se requiere: ${required.join(', ')}`,
      );
    }
    return true;
  }
}
