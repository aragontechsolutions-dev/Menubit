import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtClaims } from '@menubit/shared';
import type { AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Inyecta los claims del JWT del usuario autenticado.
 * Uso: `@CurrentUser() user: JwtClaims` o `@CurrentUser('sub') id: string`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtClaims | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = req.auth;
    return data && auth ? auth[data] : auth;
  },
);
