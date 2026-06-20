import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ModuleKey } from '@menubit/shared';
import { MODULE_KEY } from '../decorators/require-module.decorator';
import type { AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Valida que el tenant tenga activo el módulo exigido por @RequireModule().
 * Se apoya en el claim `modules[]` del JWT. Habilita la modularidad por
 * plan/nicho descrita en el PROJECT_CONTEXT (§6).
 */
@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<ModuleKey>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.auth) {
      throw new UnauthorizedException('No autenticado');
    }

    const modules = req.auth.modules ?? [];
    if (!modules.includes(required)) {
      throw new ForbiddenException(`Módulo no disponible en tu plan: ${required}`);
    }
    return true;
  }
}
