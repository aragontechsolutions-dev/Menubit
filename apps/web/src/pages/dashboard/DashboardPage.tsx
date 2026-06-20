import { Store, Users, Boxes, AlertCircle } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export function DashboardPage() {
  const { data: tenant, isLoading, isError } = useTenant();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        No se pudo cargar el negocio.
      </div>
    );
  }

  const stats = [
    { label: 'Sucursales', value: tenant.branches.length, icon: Store },
    { label: 'Módulos activos', value: tenant.modules.filter((m) => m.isActive).length, icon: Boxes },
    { label: 'Plan', value: tenant.plan, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{tenant.name}</h1>
        <p className="text-sm text-muted-foreground">
          Estado: {tenant.status} · /{tenant.slug}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tu negocio está listo 🎉</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Dashboard inicial de la Fase 0. En la Fase 1 se habilitan Productos, POS
          offline-first y Órdenes. Módulos activos:{' '}
          <span className="font-medium text-foreground">
            {tenant.modules.map((m) => m.moduleKey).join(', ') || 'ninguno'}
          </span>
          .
        </CardContent>
      </Card>
    </div>
  );
}
