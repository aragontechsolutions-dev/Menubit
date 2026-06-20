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
