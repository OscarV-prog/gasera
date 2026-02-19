---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-09T11:18:00-07:00'
inputDocuments: ['prd.md', 'Documentación App Gasera.docx']
project_name: 'gasera'
user_name: 'Petroil'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
La arquitectura debe soportar un ecosistema SaaS multi-inquilino que orqueste la logística completa de distribución de gas. Los FRs clave incluyen la gestión de activos (cilindros), conciliación de inventario automática, asignación inteligente de pedidos y una ejecución móvil offline-first con validación GPS. El sistema se complementa con un BackOffice avanzado que incluye tableros Kanban para despacho y monitoreo en tiempo real.

**Non-Functional Requirements:**
- **Resiliencia:** Disponibilidad crítica para choferes en ruta sin dependencia de latencia de red.
- **Escalabilidad:** Soporte proyectado para 100 empresas y 500 choferes activos simultáneamente.
- **Security:** Encriptación de datos sensibles y validación estricta de permisos en el Backend (Zero-Trust).
- **Costo-Eficiencia:** Independencia tecnológica mediante el uso de OpenStreetMap.

**Escala y Complejidad:**
- **Dominio Primario:** Logística SaaS / Ecosistema Multi-App.
- **Nivel de Complejidad:** Alta.
- **Componentes Arquitectónicos Estimados:** BackOffice Administrativo, API Gateway / Backend Core, App Chofer (Offline-Ready), App Cliente, Motor de Notificaciones y Servicio de Geodata.

### Restricciones Técnicas y Dependencias
- **Dependencia de GPS:** Crítica para FR14 y FR20.
- **Sincronización:** Necesidad de resolución de conflictos en datos offline.
- **Infraestructura:** Debe ser portable y capaz de aislar datos por `tenant_id` a nivel de base de datos o lógica.

### Temas Transversales Identificados
- **Multi-tenencia:** Afecta a cada consulta y mutación del sistema.
- **Trazabilidad:** Inmutabilidad de registros para auditoría de inventario y pagos.
- **Tematización:** Soporte nativo para Modo Oscuro/Claro desde la base.

## Starter Template Evaluation

### Primary Technology Domain

**SaaS Multi-App (Web + Mobile)** basado en las necesidades de monitoreo en tiempo real y ejecución logística offline.

### Starter Options Considered

1.  **Standard Next.js + Expo (Separate):** Difícil de mantener tipos compartidos (Prisma/API) entre las aplicaciones.
2.  **T3 Stack Mono (Solo Web):** No cubre nativamente la necesidad de las apps de Chofer/Cliente.
3.  **T3 Turbo (Turborepo + Next.js + Expo):** La opción más robusta para compartir lógica de negocio, esquemas de base de datos y validaciones Zod entre Web y Mobile.

### Selected Starter: T3 Turbo (Integrated Monorepo)

**Rationale for Selection:**
Permite una **Single Source of Truth** para el esquema de la base de datos (Prisma) y las definiciones del API. Dado que Gasera tiene flujos complejos que se inician en el BackOffice y terminan en la App del Chofer, tener tipos compartidos evita errores de integración y acelera el desarrollo.

**Initialization Command:**

```bash
npx create-turbo@latest -e https://github.com/t3-oss/create-t3-turbo
```

**Architectural Decisions Provided by Starter:**

-   **Language:** TypeScript 5.x (Estricto).
-   **Frameworks:** Next.js 16 (App Router) y Expo 54 (SDK estable).
-   **Database:** Prisma 7 + Supabase integration precargada en el paquete `@acme/db`.
-   **Styling:** Tailwind CSS 4 para Web y NativeWind para Mobile (consistencia visual).
-   **Build System:** Turborepo para orquestación de builds y caché remoto.
-   **API Layer:** tRPC para comunicación Type-safe entre apps y backend (opcional, pero incluido).

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions:**
- **Focus:** **Backoffice First**. La implementación priorizará el panel administrativo Web, manteniendo la infraestructura lista para las apps móviles en una fase posterior.
- **Data Isolation:** Supabase RLS con `tenant_id` obligatorio en todas las entidades corporativas.

### Data Architecture
- **DB:** Supabase (PostgreSQL).
- **ORM:** Prisma 7.
- **Isolation:** Row Level Security (RLS) gestionado mediante políticas de Postgres para asegurar multi-tenencia nativa.
- **Validation:** Zod para esquemas compartidos entre servidor y cliente.

### Authentication & Security
- **Provider:** Supabase Auth (JWT).
- **Strategy:** Session tags con `org_id` (tenant_id) persistido en el token para filtrado automático.
- **RBAC:** Roles de `SuperAdmin`, `Admin`, `Supervisor`, `Chofer` y `Cliente`. Los permisos se validan en el Middleware de Next.js y en las políticas de Postgres.

### API & Communication Patterns
- **Protocol:** **tRPC** para la comunicación entre el Backoffice y el Server. Proporciona seguridad de tipos de extremo a extremo sin necesidad de generar código Swagger/OpenAPI.
- **Real-time:** Supabase Realtime para el monitoreo de flotas y actualizaciones automáticas de pedidos en el Backoffice.

### Frontend Architecture
- **Framework:** Next.js 16 (App Router).
- **UI Components:** Shadcn/ui (basado en Radix UI) para una interfaz premium y accesible.
- **State Management:** React Query (vía tRPC) para estado de servidor y `nuqs` para sincronización de filtros de URL (ideal para tablas de pedidos y reportes).

### Infrastructure & Deployment
- **Hosting:** Vercel (Frontend/Next.js).
- **Database/Auth:** Supabase Cloud.
- **CI/CD:** GitHub Actions para validación de tipos, linting y despliegue automático.

## Implementation Patterns & Consistency Rules

### Naming Patterns

-   **Database:** `snake_case` para tablas y columnas (ej: `tenant_id`, `order_status`).
-   **API (tRPC):** `camelCase` para procedimientos y namespaces (ej: `orders.getById`).
-   **Frontend:** `PascalCase` para componentes (`OrderTable.tsx`) y `camelCase` para funciones, variables y hooks (`useOrders.ts`).
-   **Files:** `kebab-case` para carpetas y nombres de archivo no unitarios (ej: `order-details/`).

### Structure Patterns

-   **Monorepo:** Organización por paquetes (`@acme/api`, `@acme/db`, `@acme/ui`) y aplicaciones (`apps/nextjs`, `apps/expo`).
-   **Components:** Organización por feature (`features/orders/components/...`) para evitar una carpeta `components/` gigante.
-   **Tests:** Archivos de test co-localizados con el código (`*.test.ts`, `*.test.tsx`).

### Format Patterns

-   **Dates:** ISO 8601 (Strings) para intercambio en API; objetos `Date` locales para el cliente.
-   **API Responses:** Inferidas automáticamente por tRPC; los errores siguen el estándar de tRPC `{ code, message, data? }`.
-   **Booleanos:** `true`/`false` literales.

### Process Patterns

-   **Error Handling:** Uso de tRPC `TRPCError` en el backend; `Error Boundaries` de React en el frontend.
-   **Loading States:** **Skeleton Screens** (via Radix/Shadcn) obligatorios para cada vista de datos.
-   **Validation:** Toda entrada de usuario (Forms/API) DEBE validarse con Zod.
-   **Audit Logs:** Todas las mutaciones en inventario y pagos deben disparar un registro de auditoría inmutable vía trigger de Postgres o middleware de Prisma.

## Project Structure & Boundaries

### Complete Project Directory Structure
```text
gasera/
├── apps/
│   ├── nextjs/                # Backoffice Web (Next.js 16)
│   │   ├── src/app/           # Rutas (dashboard, orders, settings)
│   │   ├── src/features/      # Módulos: orders, clients, inventory, reports
│   │   └── tailwind.config.ts
│   └── expo/                  # Aplicaciones Móviles (Expo 54)
├── packages/
│   ├── api/                   # Router principal tRPC y procedimientos
│   │   └── src/router/        # Sub-routers: auth, compute, logistics
│   ├── db/                    # Prisma schema y cliente DB
│   │   └── prisma/schema.prisma
│   ├── ui/                    # Componentes Shadcn/ui + Tailwind 4
│   └── validators/            # Esquemas Zod compartidos (Web/Mobile/API)
├── .github/workflows/         # CI/CD y validaciones de tipos
├── turbo.json                 # Orquestación de Monorepo
└── package.json
```

### Architectural Boundaries

**API Boundaries:**
- El Backoffice consume `@acme/api` via tRPC hooks.
- Las futuras apps móviles consumirán el mismo router tRPC, garantizando paridad de lógica.

**Component Boundaries:**
- `@acme/ui` contiene componentes atómicos ("leaf components") como Buttons/Inputs.
- Las aplicaciones contienen componentes de negocio ("feature components") que usan los atómicos.

**Data Boundaries:**
- `@acme/db` es el único punto de acceso oficial a la base de datos mediante Prisma.
- Las políticas RLS de Postgres actúan como la última línea de defensa para la multi-tenencia.

### Requirements to Structure Mapping

**Feature: Gestión de Pedidos**
- UI: `apps/nextjs/src/features/orders/components`
- Lógica de API: `packages/api/src/router/orders.ts`
- Esquema: `packages/db/prisma/schema.prisma` (Tablas `Order`, `OrderItem`)

**Feature: Inventario y Activos**
- Lógica: `packages/api/src/router/inventory.ts`
- Esquema: `packages/db/prisma/schema.prisma` (Tablas `Asset`, `Vehicle`)

## Architecture Validation Results

### Coherence Validation ✅
- **Stack:** T3 Turbo es la solución definitiva para compartir tipos entre Web/Mobile.
- **Aislamiento:** Supabase RLS es el estándar industrial para multi-tenencia en Postgres.

### Readiness Assessment
- **Status:** **READY FOR IMPLEMENTATION**
- **Confidence:** Alta. La estructura de monorepo permite crecimiento modular.

### AI Agent Guidelines
- Respetar el esquema de Prisma en `packages/db`.
- Usar siempre Zod en `packages/validators` para evitar divergencias de datos.
- Bloquear accesos en Postgres mediante RLS (no confiar solo en la lógica de la App).
