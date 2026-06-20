# PROJECT_CONTEXT.md — Menubit

> SaaS multi-tenant, modular, para nichos de hostelería (cafeterías, pizzerías,
> restaurantes, comida rápida/dark kitchen). Documento de contexto para arrancar
> el desarrollo. Pegar este archivo en la raíz del repo.

## 1. Visión del producto
- **Nombre:** Menubit
- **Qué es:** Plataforma SaaS multi-tenant y modular para gestión integral de
  negocios gastronómicos.
- **Diferenciadores clave:**
  1. **Precios accesibles** en planes básico e intermedio (target: pymes).
  2. **Adaptabilidad** — módulos activables por tenant; dos negocios del mismo
     nicho operan distinto y el sistema se ajusta.
- **Mercados:** Uruguay (base — Maldonado), luego USA y España.
- **Estado:** Hay un negocio piloto real esperando → debe quedar operativo por fases.

## 2. Contexto del desarrollador / proyecto
- Desarrollador **solo** (un dev full-stack).
- **Web primero.** App mobile (React Native + Expo) en fase posterior.
- **Offline-first OBLIGATORIO** en módulos críticos (POS, KDS).
- **Impresión de tickets** térmica requerida (ESC/POS).

## 3. Stack técnico (decidido)
- **Backend:** NestJS (sobre Express) + Prisma 5.
- **Frontend:** React + Vite + Tailwind + shadcn/ui.
  - Estado: Zustand (client/carrito offline) + TanStack Query (server state).
  - Formularios: React Hook Form + Zod.
  - Offline: Dexie.js (IndexedDB).
  - Impresión: QZ Tray (impresoras térmicas desde browser).
  - Gráficos: Recharts.
- **BD / Auth / Storage:** Supabase (Postgres + Auth + Storage).
  - Multi-tenancy vía **Row Level Security (RLS)** con `tenant_id` en JWT claims.
- **Colas/Cache:** Upstash Redis + BullMQ.
- **Emails:** Resend.
- **Mobile (futuro):** React Native + Expo.
- **Monorepo:** Turborepo (`apps/api`, `apps/web`, `packages/shared`).

## 4. Infraestructura de producción
- **Frontend:** Vercel.
- **Backend:** Railway (NO Render — cold starts inaceptables para un POS).
  - A escala (50+ tenants): migrar a Fly.io (regiones São Paulo/Madrid/USA).
- **BD:** Supabase Pro (al tener 3+ clientes pagos).
- **Storage:** Supabase Storage + Cloudflare R2 para assets estáticos.

## 5. Cobros / gestión de clientes (negocio SaaS)
- **Suscripciones SaaS:** Stripe (funciona en UY/ES/USA, Customer Portal, trials,
  prorating, webhooks). Trial 14 días sin tarjeta.
- **MercadoPago:** solo DENTRO del producto (para que los negocios cobren a SUS
  clientes), NO para cobrar las suscripciones.
- **CRM:** HubSpot Free o Notion hasta 20+ clientes.
- **Backoffice super-admin:** ver tenants, activar/desactivar módulos, métricas
  (MRR, churn, uso).

## 6. Módulos del producto
**CORE (todos los planes):** Auth & Tenancy · POS · Productos · Órdenes · Reportes básicos.

**Activables por plan/nicho:** Mesas y Sala · Reservas · Delivery/Take Away ·
KDS (Kitchen Display) · Inventario (fichas técnicas/recetas) · Carta Digital QR ·
Fidelización · Facturación Electrónica (UY-DGI/CFE, ES-VeriFactu/TicketBAI, USA-tax) ·
Multi-sucursal · Reportes Avanzados · RRHH básico.

## 7. Planes comerciales
- **STARTER** (~$15/mes o free): 1 sucursal, 3 usuarios, POS básico, 100 productos,
  reportes básicos, carta QR (solo ver).
- **BÁSICO** (~$35-49/mes): + Mesas (hasta 20), KDS básico, inventario simple.
- **PRO** (~$79-99/mes): + Reservas, Delivery, recetas, facturación electrónica,
  multi-sucursal (hasta 3).
- **ENTERPRISE** (desde $199/mes): sucursales ilimitadas, API pública,
  integraciones (Rappi/PedidosYa/UberEats), white-label, SLA.

## 8. Roadmap por fases
- **FASE 0 — Fundación (sem 1-3):** Monorepo Turborepo · Supabase (Auth JWT custom
  claims: tenant_id/role/modules[], RLS, Storage) · Prisma schema base (Tenant,
  TenantUser, Branch, TenantModule, Plan/Subscription) · NestJS modular (TenantGuard,
  ModuleGuard, RolesGuard: OWNER/MANAGER/CASHIER/KITCHEN/WAITER) · deploy base
  (Vercel + Railway). **Entregable:** registro de tenant + dashboard vacío.
- **FASE 1 — MVP Operativo (sem 4-9):** Productos/Catálogo (variantes, modificadores,
  imágenes, CSV) · POS táctil OFFLINE-FIRST (IndexedDB+sync, impresión ESC/POS) ·
  Órdenes (PENDING→PREPARING→READY→DELIVERED→PAID) · Mesas básico.
  **→ El piloto ya opera.**
- **FASE 2 — Operación completa (sem 10-16):** KDS offline · Reportes (dashboard,
  horas pico, ranking, export PDF/Excel) · Usuarios/Roles (PIN de turno) · Config
  del negocio.
- **FASE 3 — Expansión (sem 17-24):** Delivery/Take Away · Inventario (recetas,
  merma, proveedores) · Carta Digital QR (auto-pedido) · Facturación electrónica UY.
- **FASE 4 — Plataforma SaaS (mes 7+):** Backoffice super-admin · self-service
  onboarding + Stripe Checkout/Customer Portal · Fidelización · Reservas.

## 9. Prioridad inmediata (Fase 0)
```
Sem 1: Monorepo + Supabase + Auth + tenant isolation (RLS)
Sem 2: Prisma schema + NestJS módulos base + deploy base
Sem 3: CRUD de productos + categorías
```

## 10. Consideraciones legales
- **UY:** DGI — CFE (e-Ticket obligatorio). Integración vía Uruware o API DGI.
- **ES:** VeriFactu (2025) / TicketBAI (País Vasco/Navarra). Pagos: Stripe/Redsys.
- **USA:** sin obligación federal, tax por estado. Pagos: Stripe.

## 11. Estructura del monorepo (Fase 0)

```
menubit/
├── apps/
│   ├── api/                      # NestJS + Prisma 5
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── main.ts           # CORS + Swagger en /api/docs
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   │   └── configuration.ts
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts
│   │   │   │   └── prisma.service.ts
│   │   │   ├── common/
│   │   │   │   ├── guards/        # jwt-auth, tenant, roles
│   │   │   │   ├── decorators/    # @CurrentTenant, @CurrentUser, @Roles
│   │   │   │   ├── interceptors/  # tenant-context
│   │   │   │   └── middleware/    # tenant.middleware
│   │   │   └── modules/
│   │   │       ├── auth/          # POST /auth/verify, GET /auth/me
│   │   │       ├── tenants/       # POST /tenants, GET /tenants/me
│   │   │       ├── users/
│   │   │       └── health/        # GET /health (Railway healthcheck)
│   │   └── railway.toml
│   └── web/                      # React + Vite + Tailwind
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx           # router
│       │   ├── lib/              # supabase.ts, axios.ts, queryClient.ts
│       │   ├── stores/           # auth.store.ts (Zustand)
│       │   ├── hooks/            # useAuth, useTenant
│       │   ├── pages/
│       │   │   ├── auth/         # LoginPage, RegisterPage
│       │   │   ├── onboarding/   # OnboardingPage (crea tenant)
│       │   │   └── dashboard/    # DashboardPage
│       │   ├── components/
│       │   │   ├── ui/           # Button, Input, Card, Spinner
│       │   │   └── layout/       # AppShell, Sidebar, ProtectedRoute
│       │   └── types/
│       └── vercel.json
├── packages/
│   └── shared/                  # Zod schemas + tipos compartidos api<->web
│       └── src/
│           ├── schemas/         # tenant.schema.ts, user.schema.ts
│           └── types/           # tenant, user, common
├── turbo.json
├── package.json                 # workspaces
└── .env.example
```

### Notas de implementación clave (Fase 0)
- **jwt-auth.guard:** valida el JWT de Supabase con `SUPABASE_JWT_SECRET`. El JWT
  trae `sub`, `email` y custom claims `tenant_id`, `role`, `modules[]`.
- **tenant.guard:** lee `tenant_id` del JWT, confirma tenant activo en BD, lo
  adjunta al request.
- **roles.guard:** valida rol del usuario contra el decorador `@Roles()`.
- **auth.service:** en primer login, crea el usuario en BD si no existe y devuelve
  su tenant.
- **axios.ts (web):** interceptor que adjunta `Authorization: Bearer <token>` y
  `x-tenant-id` en cada request.
- **ProtectedRoute:** sin sesión → /login; sesión sin tenant → /onboarding.
- Env vars en NestJS SIEMPRE vía ConfigService (nunca process.env directo, salvo
  configuration.ts).

## 12. Prisma schema base (Fase 0)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum TenantStatus { TRIAL ACTIVE SUSPENDED CANCELLED }
enum PlanType     { STARTER BASIC PRO ENTERPRISE }
enum UserRole     { OWNER MANAGER CASHIER KITCHEN WAITER }
enum ModuleKey {
  POS TABLES KITCHEN_DISPLAY DELIVERY INVENTORY RESERVATIONS
  DIGITAL_MENU LOYALTY REPORTS_ADVANCED ELECTRONIC_INVOICE
  MULTI_BRANCH HR_BASIC
}

model Tenant {
  id               String       @id @default(cuid())
  name             String
  slug             String       @unique
  status           TenantStatus @default(TRIAL)
  plan             PlanType     @default(STARTER)
  trialEndsAt      DateTime?
  stripeCustomerId String?      @unique
  stripeSubId      String?      @unique
  settings         Json         @default("{}")
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  users    TenantUser[]
  branches Branch[]
  modules  TenantModule[]

  @@map("tenants")
}

model TenantUser {
  id         String   @id @default(cuid())
  tenantId   String
  supabaseId String   @unique
  email      String
  name       String
  role       UserRole @default(WAITER)
  pin        String?  // PIN de 4 dígitos para acceso rápido de turno
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([supabaseId])
  @@map("tenant_users")
}

model Branch {
  id        String   @id @default(cuid())
  tenantId  String
  name      String
  address   String?
  phone     String?
  timezone  String   @default("America/Montevideo")
  settings  Json     @default("{}")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("branches")
}

model TenantModule {
  id        String    @id @default(cuid())
  tenantId  String
  moduleKey ModuleKey
  isActive  Boolean   @default(true)
  config    Json      @default("{}")
  enabledAt DateTime  @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, moduleKey])
  @@index([tenantId])
  @@map("tenant_modules")
}
```

## 13. Variables de entorno (.env.example)

```
# Database (Supabase) — usar pooler para DATABASE_URL, directa para migraciones
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Supabase
SUPABASE_URL="https://[PROJECT].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_JWT_SECRET="your-jwt-secret"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App (api)
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# Web (prefijo VITE_)
VITE_API_URL="http://localhost:3001"
VITE_SUPABASE_URL="https://[PROJECT].supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

## 14. Deploy configs

**apps/api/railway.toml**
```toml
[build]
builder = "nixpacks"
buildCommand = "npx prisma generate && npm run build"

[deploy]
startCommand = "npx prisma migrate deploy && node dist/main"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
```

**apps/web/vercel.json**
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

## 15. Orden de construcción Fase 0 (checklist)
- [ ] Monorepo: turbo.json + package.json workspaces + .gitignore + .env.example
- [ ] packages/shared: Zod schemas + tipos (tenant, user, common)
- [ ] apps/api: NestJS base + ConfigService + PrismaModule/Service
- [ ] Prisma schema (sección 12) + `prisma generate` + primera migración
- [ ] Guards: jwt-auth → tenant → roles + decoradores
- [ ] Módulos: health → auth → tenants → users
- [ ] Swagger en /api/docs + CORS al FRONTEND_URL
- [ ] apps/web: Vite + Tailwind + shadcn/ui + router
- [ ] lib: supabase, axios (interceptor auth + x-tenant-id), queryClient
- [ ] auth.store (Zustand) + ProtectedRoute + AppShell/Sidebar
- [ ] Pages: Login → Onboarding (crea tenant) → Dashboard
- [ ] README + deploy configs (railway.toml, vercel.json)
- [ ] Deploy: web→Vercel, api→Railway, verificar /health y login end-to-end
```
