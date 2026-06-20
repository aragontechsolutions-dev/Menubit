import { useQuery } from '@tanstack/react-query';
import type { TenantUser } from '@menubit/shared';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<TenantUser[]>('/users');
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner />
          ) : (
            <ul className="divide-y">
              {(data ?? []).map((u) => (
                <li key={u.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {u.role}
                  </span>
                </li>
              ))}
              {(data ?? []).length === 0 && (
                <li className="py-3 text-sm text-muted-foreground">Sin usuarios todavía.</li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
