import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import type { AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Añade el tenant/usuario actual a los logs como contexto. Punto de extensión
 * futuro para correlación de requests, métricas por tenant, o para fijar el
 * tenant en una transacción de Prisma con RLS (`set_config`).
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TenantContext');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (req.tenant) {
      this.logger.debug(
        `[tenant=${req.tenant.slug}] [user=${req.auth?.email ?? 'anon'}] ${req.method} ${req.url}`,
      );
    }
    return next.handle();
  }
}
