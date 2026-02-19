# Historia 2-3: Driver Safety Certification Management

## 📋 Resumen
| Campo | Detalle |
|-------|---------|
| **Épica** | Epic 2: Resource & Asset Management |
| **Historia** | 2-3: Driver Safety & Certification Management |
| **Estado** | ✅ Completada |
| **Fecha** | 2024-02-09 |
| **Archivos modificados** | `packages/db/src/schema.ts`, `packages/api/src/router/certifications.ts`, `packages/api/src/root.ts` |

## 🎯 Objetivo
Implementar un sistema de gestión de licencias y certificaciones de seguridad para conductores, con alertas visuales en el dashboard cuando las certificaciones estén vencidas o próximas a vencer.

## 📦 Tablas Creadas

### 1. `driver_certifications` - Tabla de Certificaciones de Conductores
```typescript
// packages/db/src/schema.ts (líneas 308-324)

export const driverCertifications = pgTable("driver_certifications", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),           // Multi-tenancy
  driverId: text("driver_id").notNull(),          // User ID del conductor
  certificationType: certificationTypeEnum("certification_type").notNull(),
  certificationName: text("certification_name").notNull(),
  issuingAuthority: text("issuing_authority").notNull(), // Institución emisora
  documentUrl: text("document_url"),              // URL del documento PDF
  issueDate: timestamp("issue_date").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  status: certificationStatusEnum("certification_status").default("valid").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => sql`now()`).notNull(),
});
```

### 2. `certification_alert_settings` - Configuración de Alertas
```typescript
// packages/db/src/schema.ts (líneas 329-341)

export const certificationAlertSettings = pgTable("certification_alert_settings", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),           // Multi-tenancy
  certificationType: certificationTypeEnum("certification_type").notNull(),
  daysBeforeExpiration: integer("days_before_expiration").default(30).notNull(),
  isEnabled: integer({ mode: "boolean" }).default(true).notNull(),
  notifyAdmins: integer({ mode: "boolean" }).default(true).notNull(),
  notifyDriver: integer({ mode: "boolean" }).default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => sql`now()`).notNull(),
});
```

## 📊 Enums Definidos

### Certification Type Enum
```typescript
export const certificationTypeEnum = pgEnum("certification_type", [
  "drivers_license",           // Licencia de conducir
  "hazmat_certification",     // Certificación de materiales peligrosos
  "safety_training",          // Capacitación de seguridad
  "first_aid",                // Primeros auxilios
  "vehicle_inspection",       // Inspección de vehículo
  "weight_limit_authorization", // Autorización de peso
  "gas_handling",             // Manejo de gas
]);
```

### Certification Status Enum
```typescript
export const certificationStatusEnum = pgEnum("certification_status", [
  "valid",            // Vigente
  "expired",          // Vencida
  "pending_renewal",  // Pendiente de renovación
  "revoked",          // Revocada
  "suspended",        // Suspendida
]);
```

## 🔌 API Router: `certificationsRouter`

### Endpoints Implementados

| Método | Procedimiento | Endpoint | Descripción |
|--------|---------------|----------|-------------|
| `listByDriver` | `protectedProcedure` | `certifications.listByDriver` | Lista certificaciones de un conductor |
| `listAll` | `adminProcedure` | `certifications.listAll` | Lista todas las certificaciones (admin) |
| `get` | `protectedProcedure` | `certifications.get` | Obtiene detalles de una certificación |
| `create` | `adminProcedure` | `certifications.create` | Crea nueva certificación |
| `update` | `adminProcedure` | `certifications.update` | Actualiza certificación |
| `renew` | `adminProcedure` | `certifications.renew` | Renueva certificación |
| `revoke` | `adminProcedure` | `certifications.revoke` | Revoca certificación |
| `getExpiringSoon` | `adminProcedure` | `certifications.getExpiringSoon` | Certificaciones próximas a vencer |
| `getExpired` | `adminProcedure` | `certifications.getExpired` | Certificaciones vencidas |
| `getDriversWithValidCerts` | `adminProcedure` | `certifications.getDriversWithValidCerts` | Conductores con certificaciones válidas |
| `getStats` | `adminProcedure` | `certifications.getStats` | Estadísticas de certificaciones |
| `updateAlertSettings` | `adminProcedure` | `certifications.updateAlertSettings` | Configura alertas |
| `getAlertSettings` | `adminProcedure` | `certifications.getAlertSettings` | Obtiene configuración de alertas |

### Detalle de Procedimientos

#### `certifications.create`
```typescript
adminProcedure
  .input(
    z.object({
      driverId: z.string(),
      certificationType: z.enum([...]),
      certificationName: z.string(),
      issuingAuthority: z.string(),
      documentUrl: z.string().optional(),
      issueDate: z.date(),
      expirationDate: z.date(),
      notes: z.string().optional(),
    })
  )
  .mutation(...)
```
- Determina automáticamente el estado inicial basado en la fecha de vencimiento
- Si ya está vencida: `expired`
- Si vence en menos de 30 días: `pending_renewal`
- De lo contrario: `valid`

#### `certifications.getExpiringSoon`
```typescript
adminProcedure
  .input(z.object({ daysAhead: z.number().default(30) }))
  .query(...)
```
- Retorna certificaciones que vencen en los próximos N días
- Útil para el dashboard de alertas

#### `certifications.getStats`
```typescript
adminProcedure.query(...)
```
Retorna estadísticas para el dashboard:
```typescript
{
  total: number,
  byStatus: {
    valid: number,
    expired: number,
    pending_renewal: number,
    revoked: number,
    suspended: number,
  },
  expiringInNext30Days: number,
}
```

## 🔒 Seguridad

### Validaciones por Tenant
- Todos los queries incluyen `eq(certifications.tenantId, tenantId)`
- Usuarios solo ven certificaciones de su organización

### Control de Acceso por Rol
| Procedimiento | Roles Permitidos |
|---------------|------------------|
| `listByDriver`, `get` | Todos los usuarios autenticados |
| `listAll`, `getExpiringSoon`, `getExpired`, `getDriversWithValidCerts`, `getStats`, `getAlertSettings`, `updateAlertSettings`, `create`, `update`, `renew`, `revoke` | Solo admins |

## 🔔 Sistema de Alertas

### Alertas Visuales en Dashboard
El sistema soporta múltiples tipos de alertas:

1. **Certificaciones Próximas a Vencer**
   - Alertas configurables por tipo de certificación
   - Días antes del vencimiento configurable (por defecto 30 días)
   - Notificaciones a admins y/o conductores

2. **Certificaciones Vencidas**
   - Alertas críticas en rojo
   - Bloqueo de conductores sin certificaciones válidas

3. **Configuración Flexible**
```typescript
certificationAlertSettings {
  certificationType: "drivers_license",
  daysBeforeExpiration: 30,
  isEnabled: true,
  notifyAdmins: true,
  notifyDriver: true,
}
```

## 📊 Casos de Uso Soportados

### 1. Registro de Nueva Certificación
```typescript
await certifications.create({
  driverId: "user-123",
  certificationType: "drivers_license",
  certificationName: "Licencia Tipo A",
  issuingAuthority: "Tráfico México",
  issueDate: new Date("2024-01-01"),
  expirationDate: new Date("2025-01-01"),
});
// Estado automatico: "valid"
```

### 2. Renovación de Certificación
```typescript
await certifications.renew({
  id: "cert-456",
  newExpirationDate: new Date("2026-01-01"),
  issuingAuthority: "Tráfico México",
});
// Estado cambia a: "valid"
```

### 3. Revocación de Certificación
```typescript
await certifications.revoke({
  id: "cert-456",
  reason: "Incumplimiento de normas",
});
// Estado cambia a: "revoked"
```

### 4. Obtener Alertas para Dashboard
```typescript
const expiringSoon = await certifications.getExpiringSoon({ daysAhead: 30 });
const expired = await certifications.getExpired();
const stats = await certifications.getStats();
```

## 🧪 Verificaciones de Calidad (QA/Test)

### Casos de Prueba Sugeridos

| ID | Escenario | Resultado Esperado |
|----|-----------|-------------------|
| QA-1 | Crear certificación con fecha futura | Estado: "valid" |
| QA-2 | Crear certificación vencida | Estado: "expired" |
| QA-3 | Crear certificación proxima a vencer (<30 días) | Estado: "pending_renewal" |
| QA-4 | Listar certificaciones de otro tenant | Error: FORBIDDEN |
| QA-5 | Renovación extiende fecha | Estado: "valid" |
| QA-6 | Revocación cambia estado | Estado: "revoked" |
| QA-7 | getExpiringSoon con 15 días | Solo certificaciones en ese rango |
| QA-8 | getStats retorna conteos correctos | Stats accurate |
| QA-9 | Usuario no-admin intenta crear | Error: FORBIDDEN |
| QA-10 | Alertas configurables por tipo | Configuración guardada |

### Checklist de Testing

- [ ] Verificar aislamiento de datos por tenant
- [ ] Verificar control de acceso por rol
- [ ] Verificar cálculo automático de estado
- [ ] Verificar alertas configurables
- [ ] Verificar paginación de listados
- [ ] Verificar manejo de fechas límite
- [ ] Verificar documentos URL válidos
- [ ] Verificar estadísticas accurate

## 📁 Archivos Relacionados

- [`packages/db/src/schema.ts`](../../../../packages/db/src/schema.ts) - Definición de esquema
- [`packages/api/src/router/certifications.ts`](../../../../packages/api/src/router/certifications.ts) - Router de API
- [`packages/api/src/root.ts`](../../../../packages/api/src/root.ts) - Root router
- [`packages/api/src/trpc.ts`](../../../../packages/api/src/trpc.ts) - Procedimientos tRPC

## ✅ Checklist de Implementación

- [x] Definir enums de tipos y estados de certificaciones
- [x] Crear tabla `driver_certifications` con todos los campos necesarios
- [x] Crear tabla `certification_alert_settings` para configuración de alertas
- [x] Implementar procedimiento `listByDriver`
- [x] Implementar procedimiento `listAll` con filtros
- [x] Implementar procedimiento `get` para detalles
- [x] Implementar procedimiento `create` con cálculo automático de estado
- [x] Implementar procedimiento `update`
- [x] Implementar procedimiento `renew`
- [x] Implementar procedimiento `revoke`
- [x] Implementar procedimiento `getExpiringSoon`
- [x] Implementar procedimiento `getExpired`
- [x] Implementar procedimiento `getDriversWithValidCerts`
- [x] Implementar procedimiento `getStats`
- [x] Implementar procedimientos de configuración de alertas
- [x] Agregar validaciones de tenant
- [x] Configurar control de acceso por rol
- [x] Registrar en root router
- [x] Documentar implementación

## 🔜 Próximos Pasos

1. **Crear UI de certificaciones** (Next.js)
   - Dashboard de alertas visuales
   - Forms de gestión de certificaciones
   - Vista de conductor con estado de certificaciones

2. **Integrar con asignación de vehículos**
   - Verificar certificaciones válidas antes de asignar ruta
   - Bloquear conductores con certificaciones vencidas

3. **Sistema de notificaciones**
   - Envío de emails/Push antes del vencimiento
   - Recordatorios automáticos
