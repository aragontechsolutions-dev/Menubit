import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import type { JwtClaims } from '@menubit/shared';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Valida el JWT de Supabase firmado con SUPABASE_JWT_SECRET (HS256).
 * Extrae sub, email y los custom claims tenant_id/role/modules[] y los adjunta
 * al request como `req.auth`. Las rutas marcadas con @Public() se omiten.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('Token de autenticación ausente');
    }

    const secret = this.config.get<string>('supabase.jwtSecret');
    if (!secret) {
      this.logger.error('SUPABASE_JWT_SECRET no configurado');
      throw new UnauthorizedException('Servidor mal configurado');
    }

    try {
      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;

      req.auth = {
        sub: decoded.sub as string,
        email: (decoded.email as string) ?? '',
        tenant_id: decoded.tenant_id as string | undefined,
        role: decoded.role as JwtClaims['role'],
        modules: (decoded.modules as JwtClaims['modules']) ?? [],
        iat: decoded.iat,
        exp: decoded.exp,
      };
      return true;
    } catch (err) {
      this.logger.debug(`JWT inválido: ${(err as Error).message}`);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractToken(req: AuthenticatedRequest): string | null {
    const header = req.headers.authorization;
    if (!header) return null;
    const [scheme, value] = header.split(' ');
    return scheme === 'Bearer' && value ? value : null;
  }
}
