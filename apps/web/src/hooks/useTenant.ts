import { useQuery } from '@tanstack/react-query';
import type { TenantWithRelations } from '@menubit/shared';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';

/** Carga el tenant actual con sucursales y módulos (GET /tenants/me). */
export function useTenant() {
  const tenant = useAuthStore((s) => s.tenant);
  return useQuery({
    queryKey: ['tenant', 'me', tenant?.id],
    enabled: Boolean(tenant?.id),
    queryFn: async () => {
      const { data } = await api.get<TenantWithRelations>('/tenants/me');
      return data;
    },
  });
}
