-- ============================================================================
-- Menubit — Row Level Security (RLS) — Fase 0
-- ============================================================================
-- Aislación multi-tenant a nivel Postgres. Se apoya en los custom claims del
-- JWT de Supabase: `tenant_id` y `role`. Supabase expone el JWT vía
-- `auth.jwt()`; aquí leemos el claim `tenant_id`.
--
-- IMPORTANTE:
--   * Prisma se conecta como `postgres` (rol privilegiado / BYPASSRLS), por lo
--     que la API NestJS NO queda limitada por estas políticas: la autorización
--     allí la imponen los Guards (TenantGuard/RolesGuard).
--   * Estas políticas protegen el acceso DIRECTO a la BD vía PostgREST / la
--     librería supabase-js del frontend, donde el JWT del usuario es la única
--     credencial. Es la red de seguridad: aunque un bug en la API expusiera
--     datos, Postgres no devuelve filas de otro tenant.
--
-- Idempotente: se puede correr múltiples veces (drop policy if exists).
-- Ejecutar con la conexión DIRECTA (DIRECT_URL), no el pooler.
-- ============================================================================

-- Helper: tenant_id del JWT actual (NULL si no hay sesión autenticada).
create or replace function public.current_tenant_id()
returns text
language sql
stable
as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id',
      ''
    ),
    ''
  );
$$;

-- Helper: rol del usuario en el JWT actual.
create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claims', true)::jsonb ->> 'role',
      ''
    ),
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- tenants
-- ---------------------------------------------------------------------------
alter table public.tenants enable row level security;
alter table public.tenants force row level security;

drop policy if exists tenant_isolation_select on public.tenants;
create policy tenant_isolation_select on public.tenants
  for select
  using (id = public.current_tenant_id());

drop policy if exists tenant_isolation_update on public.tenants;
create policy tenant_isolation_update on public.tenants
  for update
  using (id = public.current_tenant_id() and public.current_user_role() in ('OWNER', 'MANAGER'))
  with check (id = public.current_tenant_id());

-- ---------------------------------------------------------------------------
-- tenant_users
-- ---------------------------------------------------------------------------
alter table public.tenant_users enable row level security;
alter table public.tenant_users force row level security;

drop policy if exists tenant_users_isolation_select on public.tenant_users;
create policy tenant_users_isolation_select on public.tenant_users
  for select
  using ("tenantId" = public.current_tenant_id());

drop policy if exists tenant_users_isolation_write on public.tenant_users;
create policy tenant_users_isolation_write on public.tenant_users
  for all
  using ("tenantId" = public.current_tenant_id() and public.current_user_role() in ('OWNER', 'MANAGER'))
  with check ("tenantId" = public.current_tenant_id());

-- ---------------------------------------------------------------------------
-- branches
-- ---------------------------------------------------------------------------
alter table public.branches enable row level security;
alter table public.branches force row level security;

drop policy if exists branches_isolation_select on public.branches;
create policy branches_isolation_select on public.branches
  for select
  using ("tenantId" = public.current_tenant_id());

drop policy if exists branches_isolation_write on public.branches;
create policy branches_isolation_write on public.branches
  for all
  using ("tenantId" = public.current_tenant_id() and public.current_user_role() in ('OWNER', 'MANAGER'))
  with check ("tenantId" = public.current_tenant_id());

-- ---------------------------------------------------------------------------
-- tenant_modules
-- ---------------------------------------------------------------------------
alter table public.tenant_modules enable row level security;
alter table public.tenant_modules force row level security;

drop policy if exists tenant_modules_isolation_select on public.tenant_modules;
create policy tenant_modules_isolation_select on public.tenant_modules
  for select
  using ("tenantId" = public.current_tenant_id());

drop policy if exists tenant_modules_isolation_write on public.tenant_modules;
create policy tenant_modules_isolation_write on public.tenant_modules
  for all
  using ("tenantId" = public.current_tenant_id() and public.current_user_role() = 'OWNER')
  with check ("tenantId" = public.current_tenant_id());
