// ============================================================================
// EPIC 7: Driver Mobile App
// ============================================================================
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Route Incident Type Enum
 */
export const routeIncidentTypeEnum = pgEnum("route_incident_type", [
  "leak",           // Fuga de gas
  "vehicle_issue", // Problema con vehículo
  "customer_absent", // Cliente ausente
  "access_denied", // Acceso negado
  "safety_hazard", // Riesgo de seguridad
  "equipment_failure", // Falla de equipo
  "other",          // Otro
]);

/**
 * Route Incident Status Enum
 */
export const routeIncidentStatusEnum = pgEnum("route_incident_status", [
  "open",      // Abierto
  "in_progress", // En proceso
  "resolved",  // Resuelto
  "escalated",  // Escalado
  "closed",     // Cerrado
]);

/**
 * Route Incidents Table - Reportes de incidentes desde la ruta
 */
export const routeIncidents = pgTable("route_incidents", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  
  // Incident identification
  incidentNumber: text("incident_number").notNull(), // INC-2026-00001
  
  // Related entities
  routeLoadId: text("route_load_id"),
  vehicleId: text("vehicle_id"),
  driverId: text("driver_id").notNull(),
  orderId: text("order_id"),
  customerId: text("customer_id"),
  
  // Incident details
  type: routeIncidentTypeEnum("incident_type").notNull(),
  severity: text("severity").default("medium").notNull(),
  
  // Location
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  
  // Description
  description: text("description").notNull(),
  
  // Media
  photoUrls: text("photo_urls"), // JSON array de URLs
  
  // Status and resolution
  status: routeIncidentStatusEnum("status").default("open").notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by"),
  resolutionNotes: text("resolution_notes"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Sync Queue Table - Cola de sincronización offline
 */
export const syncQueue = pgTable("sync_queue", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  
  // Entity info
  entityType: text("entity_type").notNull(), // "order_delivery", "incident", etc.
  entityId: text("entity_id").notNull(),
  
  // Operation
  operation: text("operation").notNull(),
  
  // Data
  payload: text("payload").notNull(), // JSON con los datos
  
  // Status
  status: text("status").default("pending").notNull(),
  retryCount: integer("retry_count").default(0),
  lastError: text("last_error"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  syncedAt: timestamp("synced_at"),
});

/**
 * Order Deliveries Table - Detalles de entrega con GPS y firma
 */
export const orderDeliveries = pgTable("order_deliveries", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  orderId: text("order_id").notNull(),
  
  // GPS Validation
  deliveryLatitude: text("delivery_latitude"),
  deliveryLongitude: text("delivery_longitude"),
  deliveryAccuracy: text("delivery_accuracy"), // GPS accuracy in meters
  distanceFromAddress: text("distance_from_address"), // Distance from address in meters
  
  // Timestamp
  deliveryTime: timestamp("delivery_time").notNull(),
  
  // Signature
  signatureImageUrl: text("signature_image_url"),
  signedByName: text("signed_by_name"), // Nombre de quien recibió
  
  // Photo proof
  photoUrl: text("photo_url"),
  
  // Delivery confirmation
  confirmedBy: text("confirmed_by").notNull(), // Driver ID
  confirmedAt: timestamp("confirmed_at").notNull(),
  
  // Notes
  deliveryNotes: text("delivery_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Sync Queue Schemas
 */
export const CreateSyncQueueSchema = createInsertSchema(syncQueue, {
  payload: z.string().min(1),
}).omit({
  id: true,
  tenantId: true,
  status: true,
  retryCount: true,
  lastError: true,
  createdAt: true,
  syncedAt: true,
});

export const UpdateSyncQueueSchema = createInsertSchema(syncQueue).partial().extend({
  id: z.string(),
});

/**
 * Route Incident Schemas
 */
export const CreateRouteIncidentSchema = createInsertSchema(routeIncidents, {
  description: z.string().min(10).max(2000),
  photoUrls: z.string().optional(),
}).omit({
  id: true,
  tenantId: true,
  incidentNumber: true,
  status: true,
  resolvedAt: true,
  resolvedBy: true,
  resolutionNotes: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateRouteIncidentSchema = createInsertSchema(routeIncidents).partial().extend({
  id: z.string(),
});

/**
 * Order Delivery Schemas
 */
export const CreateOrderDeliverySchema = createInsertSchema(orderDeliveries, {
  deliveryNotes: z.string().max(500).optional(),
  signedByName: z.string().max(100).optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

export const UpdateOrderDeliverySchema = createInsertSchema(orderDeliveries).partial().extend({
  id: z.string(),
});

/**
 * Delivery Verification Schema
 */
export const DeliveryVerificationSchema = z.object({
  orderId: z.string(),
  latitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  longitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  accuracy: z.number().optional(), // GPS accuracy in meters
  maxDistanceMeters: z.number().min(10).max(1000).default(100),
});

/**
 * Complete Delivery Schema
 */
export const CompleteDeliverySchema = z.object({
  orderId: z.string(),
  paymentMethod: z.enum(["cash", "credit_card", "debit_card", "transfer", "check", "other"]),
  paymentReceived: z.number().min(0),
  paymentReference: z.string().optional(),
  signatureDataUrl: z.string().optional(), // Base64 signature image
  signedByName: z.string().min(2).max(100),
  photoUrl: z.string().optional(),
  deliveryNotes: z.string().max(500).optional(),
});

/**
 * Report Incident Schema
 */
export const ReportIncidentSchema = createInsertSchema(routeIncidents, {
  type: z.enum(["leak", "vehicle_issue", "customer_absent", "access_denied", "safety_hazard", "equipment_failure", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  latitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  longitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  description: z.string().min(10).max(2000),
  photoUrls: z.string().optional(), // JSON array
}).omit({
  id: true,
  tenantId: true,
  incidentNumber: true,
  driverId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});
