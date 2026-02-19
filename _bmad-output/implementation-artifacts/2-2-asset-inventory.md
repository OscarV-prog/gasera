# Historia 2-2: Inventario de Activos con Trazabilidad de Series

## 📋 Resumen
| Campo | Detalle |
|-------|---------|
| **Épica** | Epic 2: Resource & Asset Management |
| **Historia** | 2-2: Asset Inventory with Serial Traceability |
| **Estado** | ✅ Completada |
| **Fecha** | 2024-02-09 |
| **Archivos modificados** | `packages/db/src/schema.ts`, `packages/api/src/router/assets.ts`, `packages/api/src/root.ts` |

## 🎯 Objetivo
Implementar un sistema completo de gestión de activos (cilindros y tanques de gas) con trazabilidad completa por número de serie, incluyendo historial de movimientos y estados.

## 📦 Tablas Creadas

### 1. `assets` - Tabla Principal de Activos
```typescript
// packages/db/src/schema.ts (líneas 241-263)

export const assets = pgTable("assets", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),           // Multi-tenancy
  serialNumber: text("serial_number").notNull(),    // Número de serie único
  assetType: assetTypeEnum("asset_type").notNull(), // "cylinder" | "tank"
  subtype: text("subtype").notNull(),               // ej: "20kg_cylinder", "1000L_tank"
  capacity: integer("capacity").notNull(),          // Capacidad en kg o litros
  status: assetStatusEnum("asset_status").default("in_stock").notNull(),
  currentOwnerId: text("current_owner_id"),         // ID del propietario actual
  currentOwnerType: text("current_owner_type"),    // "driver" | "customer"
  location: text("location"),                      // Ubicación actual
  manufacturingDate: timestamp("manufacturing_date"),
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: integer("purchase_price"),
  lastInspectionDate: timestamp("last_inspection_date"),
  nextInspectionDate: timestamp("next_inspection_date"),
  weightEmpty: integer("weight_empty"),            // Peso Tara
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => sql`now()`).notNull(),
});
```

### 2. `asset_history` - Historial de Movimientos
```typescript
// packages/db/src/schema.ts (líneas 268-277)

export const assetHistory = pgTable("asset_history", {
  id: text("id").primaryKey(),
  assetId: text("asset_id").notNull(),              // Referencia al activo
  action: assetHistoryActionEnum("action").notNull(), // Tipo de acción
  previousValue: text("previous_value"),            // Valor anterior (JSON)
  newValue: text("new_value"),                      // Valor nuevo (JSON)
  performedBy: text("performed_by").notNull(),      // Usuario que realizó la acción
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

## 📊 Enums Definidos

### Asset Type Enum
```typescript
export const assetTypeEnum = pgEnum("asset_type", [
  "cylinder",  // Cilindros de gas
  "tank",      // Tanques estacionarios
]);
```

### Asset Status Enum
```typescript
export const assetStatusEnum = pgEnum("asset_status", [
  "in_stock",    // En almacén
  "in_route",    // En ruta de entrega
  "delivered",   // Entregado al cliente
  "maintenance", // En mantenimiento
  "retired",     // Dado de baja
]);
```

### Asset History Action Enum
```typescript
export const assetHistoryActionEnum = pgEnum("asset_history_action", [
  "created",          // Activo creado
  "status_changed",    // Cambio de estado
  "location_changed",  // Cambio de ubicación
  "assigned",         // Asignado a cliente/driver
  "returned",         // Retornado al almacén
  "inspection",       // Inspección realizada
  "maintenance",      // Mantenimiento realizado
  "retired",          // Dado de baja
]);
```

## 🔌 API Router: `assetsRouter`

### Endpoints Implementados

| Método | Procedimiento | Endpoint | Descripción |
|--------|---------------|----------|-------------|
| `list` | `protectedProcedure` | `assets.list` | Lista todos los activos de la organización |
| `get` | `protectedProcedure` | `assets.get` | Obtiene detalles de un activo |
| `getHistory` | `protectedProcedure` | `assets.getHistory` | Obtiene historial de movimientos |
| `create` | `adminProcedure` | `assets.create` | Crea nuevo activo (solo admins) |
| `updateStatus` | `adminProcedure` | `assets.updateStatus` | Actualiza estado del activo |
| `recordMovement` | `adminProcedure` | `assets.recordMovement` | Registra movimiento del activo |
| `getStats` | `adminProcedure` | `assets.getStats` | Obtiene estadísticas de inventario |

### Detalle de Procedimientos

#### `assets.list`
```typescript
protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().nullish(),
      search: z.string().optional(),
      status: z.enum([...]).optional(),
      type: z.enum(["cylinder", "tank", "all"]).optional(),
    })
  )
  .query(...)
```
- Filtra por tenant automáticamente
- Búsqueda por número de serie
- Filtrado por estado y tipo
- Soporte de paginación cursor-based

#### `assets.create`
```typescript
adminProcedure
  .input(
    z.object({
      serialNumber: z.string().optional(), // Auto-generado si no se provee
      assetType: z.enum(["cylinder", "tank"]),
      subtype: z.string(),
      capacity: z.number(),
      manufacturingDate: z.date().optional(),
      purchaseDate: z.date().optional(),
      purchasePrice: z.number().optional(),
      weightEmpty: z.number().optional(),
      notes: z.string().optional(),
    })
  )
  .mutation(...)
```
- Genera número de serie automáticamente si no se provee (formato: `GS-{timestamp}-{random}`)
- Valida unicidad del serial dentro del tenant
- Crea entrada en historial automáticamente

#### `assets.recordMovement`
```typescript
adminProcedure
  .input(
    z.object({
      assetId: z.string(),
      action: z.enum(["assigned", "returned", "location_changed", "inspection", "maintenance"]),
      newOwnerId: z.string().optional(),
      newOwnerType: z.enum(["driver", "customer"]).optional(),
      location: z.string().optional(),
      notes: z.string().optional(),
    })
  )
  .mutation(...)
```
- Registra cambio de propietario (asignación/retorno)
- Actualiza ubicación
- Guarda historial completo del cambio

## 🔒 Seguridad

### Validaciones por Tenant
- Todos los queries incluyen `eq(assets.tenantId, tenantId)`
- Usuarios solo ven activos de su organización
- Previene acceso a datos de otras organizaciones

### Control de Acceso por Rol
| Procedimiento | Roles Permitidos |
|---------------|------------------|
| `list`, `get`, `getHistory` | Todos los usuarios autenticados |
| `create`, `updateStatus`, `recordMovement`, `getStats` | Solo admins |

## 📈 Funcionalidades de Trazabilidad

### Historial Completo
Cada movimiento registra:
- **Qué**: Tipo de acción (creación, asignación, mantenimiento, etc.)
- **Cuándo**: Timestamp del evento
- **Quién**: Usuario que realizó la acción
- **Valor Anterior**: Estado/propietario/ubicación anterior (JSON)
- **Valor Nuevo**: Estado/propietario/ubicación nuevo (JSON)
- **Notas**: Información adicional opcional

### Casos de Uso Soportados

1. **Asignación a Cliente**
   - Cambia estado a `delivered`
   - Registra currentOwnerId y currentOwnerType
   - Crea entrada en historial

2. **Retorno al Almacén**
   - Cambia estado a `in_stock`
   - Limpia currentOwnerId
   - Crea entrada en historial

3. **Entrega en Ruta**
   - Cambia estado a `in_route`
   - Asigna a driver
   - Crea entrada en historial

4. **Inspección/Mantenimiento**
   - Cambia estado a `maintenance`
   - Registra fechas de inspección
   - Crea entrada en historial

## 🧪 Ejemplos de Uso

### Crear un cilindro
```typescript
const cylinder = await assets.create({
  assetType: "cylinder",
  subtype: "20kg_cylinder",
  capacity: 20,
  manufacturingDate: new Date("2023-01-15"),
  purchasePrice: 1500,
  weightEmpty: 15,
});
// Serial generado automáticamente: GS-LZ7X0W3-A1B2
```

### Asignar a cliente
```typescript
await assets.recordMovement({
  assetId: "GS-LZ7X0W3-A1B2",
  action: "assigned",
  newOwnerId: "customer-123",
  newOwnerType: "customer",
  location: "Calle Principal 123",
});
```

### Ver historial
```typescript
const history = await assets.getHistory({
  assetId: "GS-LZ7X0W3-A1B2",
});
// [
//   { action: "assigned", performedBy: "admin-1", createdAt: "..." },
//   { action: "created", performedBy: "admin-1", createdAt: "..." }
// ]
```

## 📊 Estadísticas Disponibles

```typescript
const stats = await assets.getStats();
// {
//   total: 150,
//   byStatus: { in_stock: 80, in_route: 30, delivered: 35, maintenance: 3, retired: 2 },
//   byType: { cylinder: 120, tank: 30 }
// }
```

## 🔧 Próximos Pasos

1. **Crear UI de activos** (Next.js)
   - Dashboard de inventario
   - Forms de creación/edición
   - Visor de historial
   - Reportes de activos

2. **Integrar con entregas**
   - Vincular activos con órdenes de entrega
   - Registro automático de estado en rutas

3. **Programación de inspecciones**
   - Alertas de inspección próxima
   - Recordatorios automáticos

## 📁 Archivos Relacionados

- [`packages/db/src/schema.ts`](../../../../packages/db/src/schema.ts) - Definición de esquema
- [`packages/api/src/router/assets.ts`](../../../../packages/api/src/router/assets.ts) - Router de API
- [`packages/api/src/root.ts`](../../../../packages/api/src/root.ts) - Root router
- [`packages/api/src/trpc.ts`](../../../../packages/api/src/trpc.ts) - Procedimientos tRPC

## ✅ Checklist de Implementación

- [x] Definir enums de tipos, estados y acciones
- [x] Crear tabla `assets` con todos los campos necesarios
- [x] Crear tabla `asset_history` para trazabilidad
- [x] Implementar procedimiento `list` con filtros y paginación
- [x] Implementar procedimiento `get` para detalles
- [x] Implementar procedimiento `getHistory`
- [x] Implementar procedimiento `create` con generación automática de serial
- [x] Implementar procedimiento `updateStatus`
- [x] Implementar procedimiento `recordMovement`
- [x] Implementar procedimiento `getStats`
- [x] Agregar validaciones de tenant
- [x] Configurar control de acceso por rol
- [x] Registrar en root router
- [x] Documentar implementación
