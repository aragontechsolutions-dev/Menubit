# Configuración de Supabase — Menubit (Fase 0)

Guía paso a paso para dejar la base de datos, la autenticación y la
multi-tenancy (RLS + custom claims) operativas. Tiempo estimado: ~20 min.

> Al terminar tendrás: tablas creadas, RLS activo, el Auth Hook inyectando
> `tenant_id/role/modules` en el JWT, y el registro de tenant funcionando
> end-to-end.

---

## 0. Requisitos

- Cuenta en [supabase.com](https://supabase.com) (plan Free alcanza para Fase 0).
- El repo clonado y `npm install` ya ejecutado.

---

## 1. Crear el proyecto

1. Dashboard de Supabase → **New project**.
2. Datos:
   - **Name:** `menubit` (o `menubit-dev`).
   - **Database Password:** generá una fuerte y **guardala** (la vas a usar en
     las connection strings). Anotala en tu gestor de contraseñas.
   - **Region:** la más cercana a Uruguay → **South America (São Paulo)**
     `sa-east-1`.
3. **Create new project** y esperá ~2 min a que aprovisione.

---

## 2. Obtener las credenciales

### 2.1 API keys y URL del proyecto

**Project Settings → API**:

| Variable                    | Dónde está                                  |
| --------------------------- | ------------------------------------------- |
| `SUPABASE_URL`              | Project URL (`https://<ref>.supabase.co`)   |
| `SUPABASE_ANON_KEY`         | Project API keys → `anon` `public`          |
| `SUPABASE_SERVICE_ROLE_KEY` | Project API keys → `service_role` ⚠️ secreto |

### 2.2 JWT secret

**Project Settings → API → JWT Settings → JWT Secret** → copiá a
`SUPABASE_JWT_SECRET`.

> Es el secreto con el que el backend valida el JWT (HS256). Si rotás esta
> clave, todos los tokens vigentes se invalidan.

### 2.3 Connection strings (lo más importante)

Hacé clic en **Connect** (botón arriba del dashboard) → pestaña **ORMs** o
**Connection string**. Vas a ver dos modos:

- **`DATABASE_URL`** → usar el **pooler en modo Transaction (puerto 6543)**.
  La app corre detrás del pooler. Agregá `?pgbouncer=true`.
- **`DIRECT_URL`** → usar la conexión **directa / session (puerto 5432)**.
  Prisma la usa para **migraciones** (el pooler en transaction mode no
  soporta DDL/prepared statements).

Ejemplo de cómo quedan (reemplazá `[PASSWORD]`, `[REF]` y la región):

```bash
# Pooler (Transaction, 6543) — para la app
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Directa (Session, 5432) — para migraciones y RLS
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

> Copiá los hosts exactos del diálogo **Connect** (varían según región y si tu
> proyecto usa el host viejo `db.[REF].supabase.co`). La regla que no cambia:
> **DATABASE_URL = pooler 6543 + `pgbouncer=true`**, **DIRECT_URL = 5432**.

---

## 3. Completar el `.env`

En la raíz del repo:

```bash
cp .env.example .env
```

Editá `.env` con todo lo de arriba. El frontend reutiliza los mismos valores
con prefijo `VITE_`:

```bash
VITE_API_URL="http://localhost:3001"
VITE_SUPABASE_URL="https://[REF].supabase.co"
VITE_SUPABASE_ANON_KEY="<el mismo anon key>"
```

---

## 4. Crear las tablas, RLS y el Auth Hook

Desde la raíz del repo:

```bash
# 1. Generar el cliente Prisma
npm run db:generate

# 2. Migraciones + RLS (crea tablas y aplica políticas)
npm run db:setup --workspace=@menubit/api

# 3. Crear la función del Auth Hook en la BD
npm run db:hook --workspace=@menubit/api
```

- `db:setup` = `prisma migrate deploy` + `db:rls` (ambos idempotentes).
- `db:hook` crea `public.custom_access_token_hook` (ver
  `apps/api/prisma/supabase-auth-hook.sql`).

> Si preferís SQL a mano: pegá `apps/api/prisma/rls.sql` y
> `apps/api/prisma/supabase-auth-hook.sql` en el **SQL Editor** de Supabase.

---

## 5. Habilitar el Auth Hook (paso manual)

El SQL crea la función, pero hay que **activarla**:

1. Dashboard → **Authentication → Hooks** (o **Auth → Hooks**).
2. **Custom Access Token** → **Enable** → seleccioná
   `public.custom_access_token_hook` → **Save**.

A partir de acá, cada JWT emitido incluye `tenant_id`, `role` y `modules`
(tomados de `app_metadata`, que el backend escribe al crear el tenant).

---

## 6. Configurar Auth (email/password)

1. **Authentication → Providers → Email** → asegurate de que **Email** esté
   habilitado.
2. **Desarrollo (opcional, recomendado):** **Authentication → Providers →
   Email → "Confirm email"** → **desactivar** para que el registro deje sesión
   inmediata (así el flujo Register → Onboarding funciona sin mail). En
   producción, dejalo activado.
3. **URL Configuration → Site URL:** `http://localhost:5173` (y tu dominio de
   Vercel cuando deploys).

---

## 7. Verificación end-to-end

```bash
npm run dev          # levanta api (3001) + web (5173)
```

1. **API viva:** abrir http://localhost:3001/health → `{ "status": "ok", "db": "up" }`.
2. **Swagger:** http://localhost:3001/api/docs.
3. **Flujo completo:** http://localhost:5173 → **Registrate** → te lleva a
   **Onboarding** → creá el negocio → caés en el **Dashboard** con tu tenant,
   1 sucursal y los módulos STARTER (POS, DIGITAL_MENU).
4. **Comprobar aislación (opcional):** en Supabase → **Table Editor**, deberías
   ver una fila en `tenants`, `branches`, `tenant_modules` y `tenant_users`.

### Si el dashboard no carga el tenant tras el onboarding

El JWT viejo aún no tiene `tenant_id`. El frontend ya hace
`supabase.auth.refreshSession()` tras crear el tenant; si aun así falla,
verificá que el **Auth Hook esté habilitado** (paso 5) y volvé a entrar.

---

## Troubleshooting

| Síntoma                                             | Causa probable / solución                                                                 |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `prisma migrate` cuelga o da error de prepared stmt | Estás usando el pooler 6543 en `DIRECT_URL`. Debe ser **5432**.                            |
| `db:up` es `down` en `/health`                      | `DATABASE_URL` mal armada o falta `?pgbouncer=true`.                                       |
| 401 en todas las requests                            | `SUPABASE_JWT_SECRET` no coincide con el del proyecto.                                     |
| Tras onboarding el rol/tenant no aparece en el JWT  | Auth Hook no habilitado (paso 5) o `SERVICE_ROLE_KEY` faltante (no se escribió app_metadata). |
| `permission denied` al correr `db:hook`              | Esa función usa `grant ... to supabase_auth_admin`; correla contra Supabase, no un Postgres plano. |

---

## Resumen de variables (`.env`)

```bash
DATABASE_URL=        # pooler 6543 + ?pgbouncer=true
DIRECT_URL=          # directa 5432
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
