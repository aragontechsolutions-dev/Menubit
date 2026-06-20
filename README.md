# Menubit

SaaS multi-tenant y modular para gestión de negocios gastronómicos (cafeterías,
pizzerías, restaurantes, comida rápida / dark kitchens). Web-first,
offline-first en módulos críticos (POS, KDS), impresión térmica ESC/POS.

> Documento de contexto y roadmap: [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md).

## Stack

| Capa        | Tecnología                                                            |
| ----------- | --------------------------------------------------------------------- |
| Monorepo    | Turborepo (`apps/api`, `apps/web`, `packages/shared`)                  |
| Backend     | NestJS (Express) + Prisma 5                                            |
| Frontend    | React + Vite + Tailwind + shadcn/ui · Zustand · TanStack Query · RHF+Zod |
| BD/Auth     | Supabase (Postgres + Auth + Storage), multi-tenancy vía RLS           |
| Deploy      | Web → Vercel · API → Railway                                          |

## Estructura

```
apps/
  api/        NestJS + Prisma (multi-tenancy, guards, módulos base)
  web/        React + Vite + Tailwind + shadcn/ui
packages/
  shared/     Schemas Zod + tipos compartidos api <-> web
```

## Puesta en marcha (local)

Requisitos: Node ≥ 20, una instancia de Supabase (o Postgres) y npm.

```bash
# 1. Instalar dependencias (workspaces)
npm install

# 2. Variables de entorno
cp .env.example .env        # completar credenciales de Supabase

# 3. Base de datos: generar cliente + aplicar migraciones + RLS
npm run db:generate
npm run db:migrate          # crea las tablas (usa DIRECT_URL)
npm run db:rls --workspace=@menubit/api   # aplica políticas RLS

# 4. Levantar todo (api + web) en paralelo
npm run dev
```

- API: http://localhost:3001 · Swagger: http://localhost:3001/api/docs
- Web: http://localhost:5173

### Configuración de Supabase (una vez)

1. Crear proyecto en Supabase; copiar `URL`, `anon key`, `service_role key` y
   `JWT secret` al `.env`.
2. Ejecutar `apps/api/prisma/supabase-auth-hook.sql` y activar el hook
   **Custom Access Token** en Authentication → Hooks. Esto promueve
   `tenant_id`, `role` y `modules` al JWT (lo consumen los guards y RLS).
3. Tras migrar, aplicar RLS: `npm run db:rls --workspace=@menubit/api`.

## Multi-tenancy (cómo funciona)

```
Login Supabase ──> JWT (tenant_id, role, modules[])
   │
   ├─ API NestJS:  JwtAuthGuard → TenantGuard → RolesGuard → ModuleGuard
   │               (Prisma usa rol privilegiado; la autorización la imponen los guards)
   │
   └─ Acceso directo a BD (PostgREST/supabase-js): Row Level Security
                    current_tenant_id() = claim tenant_id  →  aísla por tenant
```

El backend escribe los claims en `app_metadata` (Admin API) al crear el tenant;
el Auth Hook los promueve a claims top-level del próximo JWT.

## Scripts útiles

| Comando                     | Descripción                              |
| --------------------------- | ---------------------------------------- |
| `npm run dev`               | api + web en watch (Turborepo)           |
| `npm run build`             | build de todos los paquetes              |
| `npm run typecheck`         | typecheck de todo el monorepo            |
| `npm run lint`              | lint de todo el monorepo                 |
| `npm run db:studio`         | Prisma Studio                            |

## Estado

**Fase 0 — Fundación** (en curso): monorepo, Supabase + Auth + RLS, Prisma
schema base, NestJS modular con guards, web con onboarding + dashboard.
Entregable: registro de tenant + dashboard vacío. Ver roadmap completo en
`PROJECT_CONTEXT.md` (§8).
