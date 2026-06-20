-- ============================================================================
-- Supabase — Custom Access Token Hook
-- ============================================================================
-- Promueve los campos de `app_metadata` (que escribe el backend vía Admin API)
-- a claims TOP-LEVEL del JWT: tenant_id, role, modules.
--
-- Es la pieza que conecta todo:
--   backend.setAppMetadata() -> app_metadata -> [este hook] -> JWT claims
--   -> JwtAuthGuard / TenantGuard / RolesGuard / ModuleGuard (API)
--   -> current_tenant_id() / current_user_role() (RLS, ver rls.sql)
--
-- Configuración en Supabase:
--   1. Ejecutar este SQL (crea la función en el schema `public`).
--   2. Dashboard -> Authentication -> Hooks -> "Custom Access Token" ->
--      seleccionar `public.custom_access_token_hook`.
--
-- Referencia: https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook
-- ============================================================================

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  meta jsonb;
begin
  claims := event->'claims';
  meta := coalesce(event->'claims'->'app_metadata', '{}'::jsonb);

  if meta ? 'tenant_id' then
    claims := jsonb_set(claims, '{tenant_id}', meta->'tenant_id');
  end if;

  if meta ? 'role' then
    claims := jsonb_set(claims, '{role}', meta->'role');
  end if;

  if meta ? 'modules' then
    claims := jsonb_set(claims, '{modules}', meta->'modules');
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Permisos para que el rol de Auth (supabase_auth_admin) ejecute el hook.
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
