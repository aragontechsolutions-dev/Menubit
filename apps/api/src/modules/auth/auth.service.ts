import { Injectable } from '@nestjs/common';
import type { JwtClaims } from '@menubit/shared';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sincroniza el usuario de Supabase con la BD local. En el primer login
   * crea el TenantUser si todavía no existe y devuelve usuario + tenant.
   * Si el usuario aún no tiene tenant (recién registrado), tenant = null y el
   * frontend lo manda a /onboarding.
   */
  async verifyAndSync(claims: JwtClaims, name?: string) {
    const existing = await this.prisma.tenantUser.findUnique({
      where: { supabaseId: claims.sub },
      include: { tenant: true },
    });

    if (existing) {
      return { user: existing, tenant: existing.tenant };
    }

    // El usuario existe en Supabase Auth pero no en nuestra BD.
    // Si el JWT ya trae tenant_id (fue invitado), lo vinculamos como WAITER;
    // si no, queda sin tenant hasta completar el onboarding.
    if (claims.tenant_id) {
      const created = await this.prisma.tenantUser.create({
        data: {
          tenantId: claims.tenant_id,
          supabaseId: claims.sub,
          email: claims.email,
          name: name ?? claims.email.split('@')[0],
          role: claims.role ?? 'WAITER',
        },
        include: { tenant: true },
      });
      return { user: created, tenant: created.tenant };
    }

    return { user: null, tenant: null };
  }

  /** GET /auth/me — devuelve el usuario local y su tenant (o null). */
  async me(supabaseId: string) {
    const user = await this.prisma.tenantUser.findUnique({
      where: { supabaseId },
      include: { tenant: true },
    });
    return { user: user ?? null, tenant: user?.tenant ?? null };
  }
}
