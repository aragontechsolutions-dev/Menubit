import { useEffect } from 'react';
import type { AuthMe } from '@menubit/shared';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Hook de arranque de sesión: escucha cambios de Supabase Auth, sincroniza el
 * perfil (GET /auth/me) y mantiene el store. Montar una sola vez (en App).
 */
export function useAuthBootstrap() {
  const { setSession, setProfile, setInitializing, reset } = useAuthStore();

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const { data } = await api.get<AuthMe>('/auth/me');
        if (active) setProfile(data.user, data.tenant);
      } catch {
        if (active) setProfile(null, null);
      }
    }

    // Sesión inicial.
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) await loadProfile();
      setInitializing(false);
    });

    // Cambios de auth (login/logout/refresh).
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      setSession(session);
      if (session) {
        await loadProfile();
      } else {
        reset();
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useAuth() {
  return useAuthStore();
}
