# Gasera Admin Dashboard

Plataforma integral de administración y logística para la gestión de pedidos, choferes, clientes y reportes de Gasera.

## 🚀 Características Principales

### 📊 Dashboard General

- Métricas en tiempo real de pedidos, clientes y flota.
- Accesos rápidos a funciones operativas críticas.
- Visualización de pedidos urgentes.

### 🚚 Gestión de Flota y Choferes

- **Catálogo de Choferes**: Administración completa de perfiles, licencias y unidades asignadas.
- **Unidades**: Inventario de vehículos con historial de mantenimiento y asignaciones.
- **Reportes de Choferes**: Seguimiento de incidentes en ruta.

### 👥 Clientes y Pedidos

- **Directorio de Clientes**: Gestión de perfiles, direcciones (residenciales/empresariales) y listas de precios.
- **Pedidos**: Flujo completo desde la solicitud hasta la entrega.
- **Reportes de Clientes**: Sistema de tickets para atención a clientes y resolución de quejas.

### 🛠️ Soporte y Configuración

- **FAQs**: Gestión de preguntas frecuentes y categorías para el centro de ayuda.
- **Perfil de Usuario**: Configuración de cuenta, edición de perfil y cambio de contraseña seguro.
- **Seguridad**: Autenticación robusta y manejo de roles (Admin/Supervisor/Operador).

## 🛠️ Stack Tecnológico

Este proyecto utiliza el [T3 Stack](https://create.t3.gg/) modificado para un monorepo con Turborepo:

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org) con [Drizzle ORM](https://orm.drizzle.team)
- **Autenticación**: [Better Auth](https://www.better-auth.com)
- **UI**: [Tailwind CSS v4](https://tailwindcss.com) + [Shadcn UI](https://ui.shadcn.com)
- **API**: [tRPC](https://trpc.io) para comunicación tipada end-to-end.

## 💻 Configuración Local

1.  **Instalar dependencias**:

    ```bash
    pnpm install
    ```

2.  **Configurar variables de entorno**:
    Copia `.env.example` a `.env` y configura la URL de la base de datos y llaves de autenticación.

3.  **Iniciar base de datos**:

    ```bash
    pnpm db:push
    ```

4.  **Generar esquema de Auth**:

    ```bash
    pnpm --filter @acme/auth generate
    ```

5.  **Iniciar servidor de desarrollo**:
    ```bash
    pnpm dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

## 📂 Estructura del Proyecto

- `apps/nextjs`: Aplicación web principal (Dashboard).
- `packages/api`: Definición del router tRPC y lógica de backend.
- `packages/db`: Esquema de base de datos y cliente Drizzle.
- `packages/auth`: Configuración de autenticación.
- `packages/ui`: Componentes de interfaz reutilizables.
