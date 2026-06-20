import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ModuleKey, UserRole } from '@menubit/shared';

interface AppMetadata {
  tenant_id?: string;
  role?: UserRole;
  modules?: ModuleKey[];
}

/**
 * Cliente liviano del Admin API de Supabase Auth (solo lo que necesita Fase 0:
 * escribir app_metadata). Estos campos se inyectan como custom claims del JWT
 * vía un Auth Hook de Supabase, y son la base de la aislación por tenant (RLS)
 * y de los Guards. Usa la SERVICE_ROLE_KEY: NUNCA exponer al frontend.
 */
@Injectable()
export class SupabaseAdminService {
  private readonly logger = new Logger(SupabaseAdminService.name);

  constructor(private readonly config: ConfigService) {}

  /** Actualiza los custom claims de un usuario de Supabase. */
  async setAppMetadata(supabaseUserId: string, metadata: AppMetadata): Promise<void> {
    const url = this.config.get<string>('supabase.url');
    const serviceKey = this.config.get<string>('supabase.serviceRoleKey');
    if (!url || !serviceKey) {
      this.logger.warn('Supabase no configurado: se omite setAppMetadata');
      return;
    }

    const res = await fetch(`${url}/auth/v1/admin/users/${supabaseUserId}`, {
      method: 'PUT',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ app_metadata: metadata }),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Error actualizando app_metadata (${res.status}): ${text}`);
      throw new Error(`Supabase admin API error: ${res.status}`);
    }
    this.logger.log(`app_metadata actualizado para usuario ${supabaseUserId}`);
  }
}
