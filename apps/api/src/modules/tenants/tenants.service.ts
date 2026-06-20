import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { slugify, type CreateTenantInput, type JwtClaims, type ModuleKey } from '@menubit/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseAdminService } from '../../common/supabase/supabase-admin.service';

/** Módulos activos por defecto al crear un tenant en plan STARTER. */
const DEFAULT_STARTER_MODULES: ModuleKey[] = ['POS', 'DIGITAL_MENU'];

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminService,
  ) {}

  /**
   * Onboarding: crea tenant + primera sucursal + módulos por defecto y vincula
   * al usuario creador como OWNER. Luego escribe los custom claims en Supabase
   * para que el próximo JWT traiga tenant_id/role/modules.
   */
  async createForUser(claims: JwtClaims, dto: CreateTenantInput) {
    // Un usuario que ya pertenece a un tenant no puede crear otro por esta vía.
    const existing = await this.prisma.tenantUser.findUnique({
      where: { supabaseId: claims.sub },
    });
    if (existing) {
      throw new ForbiddenException('El usuario ya pertenece a un tenant');
    }

    const slug = await this.resolveUniqueSlug(dto.slug ?? slugify(dto.name));
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // trial 14 días (sin tarjeta)

    const tenant = await this.prisma.$transaction(async (tx) => {
      const created = await tx.tenant.create({
        data: {
          name: dto.name,
          slug,
          status: 'TRIAL',
          plan: 'STARTER',
          trialEndsAt,
          branches: {
            create: {
              name: dto.branchName,
              timezone: dto.timezone,
            },
          },
          modules: {
            create: DEFAULT_STARTER_MODULES.map((moduleKey) => ({ moduleKey })),
          },
          users: {
            create: {
              supabaseId: claims.sub,
              email: claims.email,
              name: claims.email.split('@')[0],
              role: 'OWNER',
            },
          },
        },
        include: { branches: true, modules: true },
      });
      return created;
    });

    // Custom claims -> próximo token del usuario ya trae tenant_id/role/modules.
    await this.supabaseAdmin.setAppMetadata(claims.sub, {
      tenant_id: tenant.id,
      role: 'OWNER',
      modules: tenant.modules.map((m) => m.moduleKey),
    });

    return tenant;
  }

  /** GET /tenants/me — tenant del usuario actual con sucursales y módulos. */
  async findCurrent(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { branches: true, modules: true },
    });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');
    return tenant;
  }

  /** Garantiza unicidad del slug agregando un sufijo numérico si hace falta. */
  private async resolveUniqueSlug(base: string): Promise<string> {
    const candidate = base || 'tenant';
    let slug = candidate;
    let n = 1;
    // Pocas colisiones esperadas; loop simple.
    while (await this.prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${candidate}-${n++}`;
      if (n > 50) {
        throw new ConflictException('No se pudo generar un slug único');
      }
    }
    return slug;
  }
}
