import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/** Cliente de Supabase (Auth + Storage). La sesión persiste en localStorage. */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
