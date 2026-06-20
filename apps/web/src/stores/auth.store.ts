import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Tenant, TenantUser } from '@menubit/shared';

interface AuthState {
  session: Session | null;
  user: TenantUser | null;
  tenant: Tenant | null;
  /** true mientras se resuelve la sesión inicial (evita parpadeo de rutas). */
  initializing: boolean;

  setSession: (session: Session | null) => void;
  setProfile: (user: TenantUser | null, tenant: Tenant | null) => void;
  setInitializing: (value: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  tenant: null,
  initializing: true,

  setSession: (session) => set({ session }),
  setProfile: (user, tenant) => set({ user, tenant }),
  setInitializing: (value) => set({ initializing: value }),
  reset: () => set({ session: null, user: null, tenant: null }),
}));
