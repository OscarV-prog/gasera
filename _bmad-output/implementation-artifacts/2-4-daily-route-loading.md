# Historia 2-4: Daily Route Loading Registration

## 📋 Resumen
| Campo | Detalle |
|-------|---------|
| **Épica** | Epic 2: Resource & Asset Management |
| **Historia** | 2-4: Daily Route Loading Registration |
| **Estado** | ✅ Completada |
| **Fecha** | 2024-02-09 |
| **Archivos modificados** | `packages/db/src/schema.ts`, `packages/api/src/router/routeLoads.ts`, `packages/api/src/root.ts` |

## 🎯 Objetivo
Permitir a los supervisores registrar la carga inicial de un vehículo antes de que comience su ruta diaria, teniendo un registro preciso del inventario que sale de la planta.

## 📦 Tablas Creadas

### 1. `route_loads` - Registro de Carga de Rutas
```typescript
// packages/db/src/schema.ts

export const routeLoads = pgTable("route_loads", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),           // Multi-tenancy
  vehicleId: text("vehicle_id").notNull(),
  driverId: text("driver_id"),                     // Conductor asignado
  loadDate: timestamp("load_date").notNull(),      // Fecha de carga
  status: loadStatusEnum("load_status").default("pending").notNull(),
  plannedDeliveries: integer("planned_deliveries").default(0),
  completedDeliveries: integer("completed_deliveries").default(0),
  totalCylindersLoaded: integer("total_cylinders_loaded").default(0),
  totalTanksLoaded: integer("total_tanks_loaded").default(0),
  totalWeightLoaded: integer("total_weight_loaded").default(0), // kg
  departureTime: timestamp("departure_time"),
  returnTime: timestamp("return_time"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => sql`now()`).notNull(),
});
```

### 2. `route_load_items` - Items de la Carga
```typescript
// packages/db/src/schema.ts

export const routeLoadItems = pgTable("route_load_items", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  routeLoadId: text("route_load_id").notNull(),
  itemType: loadItemTypeEnum("item_type").notNull(), // "by_serial" | "by_quantity"
  assetType: text("asset_type"),                     // "cylinder" | "tank"
  subtype: text("subtype"),                          // e.g., "20kg_cylinder"
  quantity: integer("quantity").notNull(),
  serialNumbers: text("serial_numbers"),              // JSON array
  weightPerUnit: integer("weight_per_unit"),
  totalWeight: integer("total_weight").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 3. `daily_load_summary` - Resumen Diario
```typescript
// packages/db/src/schema.ts

export const dailyLoadSummary = pgTable("daily_load_summary", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  loadDate: timestamp("load_date").notNull(),
  assetType: text("asset_type").notNull(),
  subtype: text("subtype").notNull(),
  totalQuantity: integer("total_quantity").notNull(),
  totalWeight: integer("total_weight").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

## 📊 Enums Definidos

### Load Status Enum
```typescript
export const loadStatusEnum = pgEnum("load_status", [
  "pending",      // Pendiente de cargar
  "loading",      // En proceso de carga
  "loaded",       // Cargado completo
  "dispatched",   // Despachado
  "in_progress",  // En ruta
  "completed",    // Ruta completada
  "cancelled",    // Cancelado
]);
```

### Load Item Type Enum
```typescript
export const loadItemTypeEnum = pgEnum("load_item_type", [
  "by_serial",    // Por número de serie individual
  "by_quantity",  // Por cantidad (tipo/subtipo)
]);
```

## 🔌 API Router: `routeLoadsRouter`

### Endpoints Implementados

| Método | Procedimiento | Endpoint | Descripción |
|--------|---------------|----------|-------------|
| `list` | `protectedProcedure` | `routeLoads.list` | Lista todas las cargas |
| `get` | `protectedProcedure` | `routeLoads.get` | Obtiene detalles con items |
| `create` | `supervisorProcedure` | `routeLoads.create` | Crea nuevo registro de carga |
| `registerLoad` | `supervisorProcedure` | `routeLoads.registerLoad` | Registra carga de activos |
| `dispatch` | `supervisorProcedure` | `routeLoads.dispatch` | Despacha vehículo |
| `complete` | `supervisorProcedure` | `routeLoads.complete` | Completa ruta |
| `cancel` | `adminProcedure` | `routeLoads.cancel` | Cancela carga |
| `getTodayPending` | `supervisorProcedure` | `routeLoads.getTodayPending` | Cargas pendientes de hoy |
| `getDailySummary` | `supervisorProcedure` | `routeLoads.getDailySummary` | Resumen del día |
| `getStats` | `adminProcedure` | `routeLoads.getStats` | Estadísticas |

## 🔄 Flujo de Trabajo

### 1. Crear Registro de Carga (Morning Standup)
```typescript
// Supervisor crea el registro para el vehículo del día
await routeLoads.create({
  vehicleId: "vehicle-123",
  driverId: "driver-456",
  loadDate: new Date(), // Hoy
  plannedDeliveries: 15, // Entregas planeadas
});
// Estado: "pending"
```

### 2. Registrar Carga de Activos
```typescript
// Supervisor registra los activos cargados
await routeLoads.registerLoad({
  routeLoadId: "load-789",
  items: [
    {
      itemType: "by_quantity",
      assetType: "cylinder",
      subtype: "20kg_cylinder",
      quantity: 50,
      weightPerUnit: 35, // 20kg gas + 15kg cilindro
    },
    {
      itemType: "by_serial",
      assetType: "tank",
      subtype: "1000L_tank",
      quantity: 3,
      serialNumbers: ["GS-ABC123", "GS-DEF456", "GS-GHI789"],
    },
  ],
  notes: "Carga verificada por supervisor",
});
// Estado: "loading" -> "loaded"
// Activos actualizados: status = "in_route"
```

### 3. Despachar Vehículo
```typescript
// Vehículo sale de la planta
await routeLoads.dispatch({
  routeLoadId: "load-789",
  departureTime: new Date(),
});
// Estado: "dispatched" -> "in_progress"
```

### 4. Completar Ruta
```typescript
// Vehículo regresa
await routeLoads.complete({
  routeLoadId: "load-789",
  completedDeliveries: 14, // 14 de 15 entregas
  returnTime: new Date(),
  notes: "1 cliente no disponible",
});
// Estado: "completed"
// Si quedaron activos, retornan a stock
```

### 5. Cancelar Carga (si es necesario)
```typescript
await routeLoads.cancel({
  routeLoadId: "load-789",
  reason: "Vehículo en mantenimiento",
});
// Estado: "cancelled"
// Activos retornan a stock automáticamente
```

## 🔒 Seguridad

### Control de Acceso por Rol
| Procedimiento | Roles Permitidos |
|---------------|------------------|
| `list`, `get`, `getDailySummary`, `getTodayPending` | Todos los autenticados |
| `create`, `registerLoad`, `dispatch`, `complete` | Supervisor, Admin |
| `cancel`, `getStats` | Admin |

### Actualización Automática de Activos
- Cuando se registra carga **por serie**: assets cambian a `in_route`
- Cuando se cancela o completa: assets cambian a `in_stock`

## 📊 Dashboard de Supervisor

### Resumen del Día
```typescript
const summary = await routeLoads.getDailySummary({ date: new Date() });
// {
//   pending: 2,    // Cargas pendientes
//   loading: 1,     // En proceso de carga
//   dispatched: 3,   // En ruta
//   completed: 5,    // Completadas
//   totalCylinders: 250,
//   totalTanks: 15,
//   totalWeight: 12500, // kg
// }
```

### Cargas Pendientes de Hoy
```typescript
const pending = await routeLoads.getTodayPending();
// [
//   { id: "...", vehicleId: "...", status: "pending", plannedDeliveries: 15 },
//   ...
// ]
```

## 📈 Casos de Uso

### Carga por Serie (Traza Completa)
```
1. Supervisor registra seriales específicos
2. Sistema actualiza cada asset a "in_route"
3. GPS tracking registra ubicación
4. Al entregar: asset -> "delivered"
5. Al retornar: asset -> "in_stock"
```

### Carga por Cantidad (Simplificada)
```
1. Supervisor registra: "50 cilindros de 20kg"
2. Sistema suma al total del día
3. No actualiza assets individuales
4. Útil para conteos rápidos
```

## 🧪 Verificaciones de QA

| ID | Escenario | Resultado |
|----|-----------|-----------|
| QA-1 | Crear carga para vehículo | Estado: "pending" |
| QA-2 | Registrar items por serie | Assets -> "in_route" |
| QA-3 | Registrar items por cantidad | Totales actualizados |
| QA-4 | Despachar sin cargar | Error: "Cannot dispatch" |
| QA-5 | Cancelar carga con assets | Assets -> "in_stock" |
| QA-6 | Completar ruta | Estado: "completed" |
| QA-7 | Ver resumen del día | Stats correctos |
| QA-8 | Ver carga de otro tenant | Error: FORBIDDEN |
| QA-9 | Usuario sin rol supervisor crea | Error: FORBIDDEN |
| QA-10 | Carga múltiple en un día | Multiple records OK |

## 📁 Archivos Relacionados

- [`packages/db/src/schema.ts`](../../../../packages/db/src/schema.ts) - Definición de esquema
- [`packages/api/src/router/routeLoads.ts`](../../../../packages/api/src/router/routeLoads.ts) - Router de API
- [`packages/api/src/root.ts`](../../../../packages/api/src/root.ts) - Root router
- [`packages/api/src/trpc.ts`](../../../../packages/api/src/trpc.ts) - Procedimientos tRPC

## ✅ Checklist de Implementación

- [x] Definir enums de estado y tipo de items
- [x] Crear tabla `route_loads` para registros de carga
- [x] Crear tabla `route_load_items` para items individuales
- [x] Crear tabla `daily_load_summary` para resúmenes
- [x] Implementar `create` para crear registro inicial
- [x] Implementar `registerLoad` con actualización de assets
- [x] Implementar `dispatch` para despachar
- [x] Implementar `complete` para finalizar
- [x] Implementar `cancel` con retorno de assets
- [x] Implementar `getTodayPending`
- [x] Implementar `getDailySummary`
- [x] Implementar `getStats`
- [x] Agregar validaciones de tenant
- [x] Configurar control de acceso por rol
- [x] Registrar en root router
- [x] Documentar implementación

## 🔜 Próximos Pasos

1. **Crear UI de gestión de cargas** (Next.js)
   - Panel de supervisor
   - Forms de carga de activos
   - Dashboard de resumen diario

2. **Integrar con sistema de entregas** (Epic 4)
   - Vincular cargas con órdenes de entrega
   - Seguimiento de entregas completadas

3. **Reportes de eficiencia**
   - Peso cargado vs entregas completadas
   - Tiempos de ruta
