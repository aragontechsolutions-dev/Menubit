import axios from 'axios';
import { env } from './env';
import { supabase } from './supabase';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Instancia de axios para la API. Interceptor de request que adjunta:
 *  - Authorization: Bearer <token de Supabase>
 *  - x-tenant-id: tenant actual (fallback si el JWT aún no trae el claim)
 */
export const api = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const tenantId = useAuthStore.getState().tenant?.id;
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }
  return config;
});

// Si la API responde 401, cerramos la sesión local.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      await supabase.auth.signOut();
      useAuthStore.getState().reset();
    }
    return Promise.reject(error);
  },
);
