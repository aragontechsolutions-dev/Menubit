import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTenantSchema, type CreateTenantInput, type AuthMe } from '@menubit/shared';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export function OnboardingPage() {
  const navigate = useNavigate();
  const setProfile = useAuthStore((s) => s.setProfile);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTenantInput>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { branchName: 'Sucursal principal', timezone: 'America/Montevideo' },
  });

  async function onSubmit(values: CreateTenantInput) {
    setError(null);
    try {
      await api.post('/tenants', values);
      // El backend actualizó los custom claims; refrescamos el token para
      // que el próximo JWT traiga tenant_id/role/modules.
      await supabase.auth.refreshSession();
      const { data } = await api.get<AuthMe>('/auth/me');
      setProfile(data.user, data.tenant);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo crear el negocio';
      setError(Array.isArray(message) ? message.join(', ') : message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configurá tu negocio</CardTitle>
          <CardDescription>
            Creá tu espacio en Menubit. Podés cambiar estos datos después.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre del negocio</Label>
              <Input id="name" placeholder="Pizzería La Esquina" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="branchName">Nombre de la sucursal</Label>
              <Input id="branchName" {...register('branchName')} />
              {errors.branchName && (
                <p className="text-xs text-destructive">{errors.branchName.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="text-primary-foreground" /> : 'Crear negocio'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
