// Única puerta de entrada a process.env. El resto del código accede a la
// configuración SIEMPRE vía ConfigService (regla del PROJECT_CONTEXT §11).

export interface AppConfig {
  env: string;
  port: number;
  frontendUrl: string;
  database: {
    url: string;
    directUrl: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    jwtSecret: string;
    serviceRoleKey: string;
  };
}

export default (): AppConfig => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  database: {
    url: process.env.DATABASE_URL ?? '',
    directUrl: process.env.DIRECT_URL ?? '',
  },
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    anonKey: process.env.SUPABASE_ANON_KEY ?? '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
});
