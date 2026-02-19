import { sql } from "drizzle-orm";
import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Vehicle Types Enum
 */
export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "truck",
  "van",
  "pickup",
  "motorcycle",
]);

/**
 * Vehicle Status Enum
 */
export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "active",
  "maintenance",
  "retired",
]);

/**
 * Fuel Type Enum
 */
export const fuelTypeEnum = pgEnum("fuel_type", [
  "gasoline",
  "diesel",
  "electric",
  "hybrid",
]);

/**
 * Vehicles Table
 */
export const vehicles = pgTable("vehicles", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  licensePlate: text("license_plate").notNull(),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  vin: text("vin"),
  capacityWeight: integer("capacity_weight").default(0), // kg
  capacityVolume: integer("capacity_volume").default(0), // liters
  fuelType: fuelTypeEnum("fuel_type").default("diesel").notNull(),
  status: vehicleStatusEnum("vehicle_status").default("active").notNull(),
  assignedDriverId: text("assigned_driver_id"),

  // Last known GPS coordinates (for proximity search)
  lastLatitude: text("last_latitude"),
  lastLongitude: text("last_longitude"),
  lastLocationUpdatedAt: timestamp("last_location_updated_at"),

  registrationExpiry: timestamp("registration_expiry"),
  insuranceExpiry: timestamp("insurance_expiry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Invitation Status Enum
 */
export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "expired",
  "cancelled",
]);

/**
 * User Role Enum (for invitations)
 */
export const userRoleEnum = pgEnum("user_role", [
  "superadmin",
  "admin",
  "supervisor",
  "operator",
  "chofer",
  "cliente",
]);

/**
 * Invitations Table
 */
export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull(),
  organizationId: text("organization_id").notNull(),
  invitedBy: text("invited_by").notNull(),
  status: invitationStatusEnum("status").default("pending").notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
});

/**
 * Organization Table
 */
export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subdomain: text("subdomain").unique(),
  logoUrl: text("logo_url"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),

  // Subscription details (stored as text for simplicity)
  subscriptionPlan: text("subscription_plan").default("free").notNull(),
  subscriptionStatus: text("subscription_status").default("active").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),

  // Usage limits
  maxUsers: text("max_users").default("5").notNull(),
  maxVehicles: text("max_vehicles").default("2").notNull(),

  // Configuration
  settings: text("settings").default("{}"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Audit Log Table
 */
export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  actorId: text("actor_id").notNull(),
  actorEmail: text("actor_email").notNull(),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Post Table (example multi-tenant table)
 */
export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  tenantId: t.text("tenant_id").notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

/**
 * Schemas
 */
export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateOrganizationSchema = createInsertSchema(organizations, {
  name: z.string().min(2).max(100),
  subdomain: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  maxUsers: z.string().optional(),
  maxVehicles: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateOrganizationSchema = createInsertSchema(organizations)
  .partial()
  .extend({
    id: z.string(),
  });

export const CreateVehicleSchema = createInsertSchema(vehicles, {
  licensePlate: z.string().min(5).max(20),
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z
    .number()
    .min(1950)
    .max(new Date().getFullYear() + 1),
  vin: z.string().length(17).optional(),
  capacityWeight: z.number().min(0).max(50000),
  capacityVolume: z.number().min(0).max(100000),
  notes: z.string().max(500).optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateVehicleSchema = createInsertSchema(vehicles)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * Asset Types Enum
 */
export const assetTypeEnum = pgEnum("asset_type", ["cylinder", "tank"]);

/**
 * Asset Status Enum
 */
export const assetStatusEnum = pgEnum("asset_status", [
  "in_stock",
  "in_route",
  "delivered",
  "maintenance",
  "retired",
]);

/**
 * Asset History Action Enum
 */
export const assetHistoryActionEnum = pgEnum("asset_history_action", [
  "created",
  "status_changed",
  "location_changed",
  "assigned",
  "returned",
  "inspection",
  "maintenance",
  "retired",
]);

/**
 * Assets Table
 */
export const assets = pgTable("assets", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  serialNumber: text("serial_number").notNull(),
  assetType: assetTypeEnum("asset_type").notNull(),
  subtype: text("subtype").notNull(), // e.g., "20kg_cylinder", "1000L_tank"
  capacity: integer("capacity").notNull(), // kg or liters
  status: assetStatusEnum("asset_status").default("in_stock").notNull(),
  currentOwnerId: text("current_owner_id"),
  currentOwnerType: text("current_owner_type"), // "driver" or "customer"
  location: text("location"),
  manufacturingDate: timestamp("manufacturing_date"),
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: integer("purchase_price"),
  lastInspectionDate: timestamp("last_inspection_date"),
  nextInspectionDate: timestamp("next_inspection_date"),
  weightEmpty: integer("weight_empty"), // tare weight
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Asset History Table
 */
export const assetHistory = pgTable("asset_history", {
  id: text("id").primaryKey(),
  assetId: text("asset_id").notNull(),
  action: assetHistoryActionEnum("action").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  performedBy: text("performed_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const certificationTypeEnum = pgEnum("certification_type", [
  "drivers_license", // Licencia de conducir
  "hazmat_certification", // Certificación de materiales peligrosos
  "safety_training", // Capacitación de seguridad
  "first_aid", // Primeros auxilios
  "vehicle_inspection", // Inspección de vehículo
  "weight_limit_authorization", // Autorización de peso
  "gas_handling", // Manejo de gas
]);

/**
 * Certification Status Enum
 */
export const certificationStatusEnum = pgEnum("certification_status", [
  "valid", // Vigente
  "expired", // Vencida
  "pending_renewal", // Pendiente de renovación
  "revoked", // Revocada
  "suspended", // Suspendida
]);

/**
 * Driver Certifications Table
 */
export const driverCertifications = pgTable("driver_certifications", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  driverId: text("driver_id").notNull(), // User ID del conductor
  certificationType: certificationTypeEnum("certification_type").notNull(),
  certificationName: text("certification_name").notNull(),
  issuingAuthority: text("issuing_authority").notNull(), // Institución que emite
  documentUrl: text("document_url"), // URL del documento PDF
  issueDate: timestamp("issue_date").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  status: certificationStatusEnum("certification_status")
    .default("valid")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Certification Alert Settings Table
 */
export const certificationAlertSettings = pgTable(
  "certification_alert_settings",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    certificationType: certificationTypeEnum("certification_type").notNull(),
    daysBeforeExpiration: integer("days_before_expiration")
      .default(30)
      .notNull(),
    isEnabled: integer("is_enabled").default(1).notNull(),
    notifyAdmins: integer("notify_admins").default(1).notNull(),
    notifyDriver: integer("notify_driver").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => sql`now()`)
      .notNull(),
  },
);

/**
 * Load Status Enum
 */
export const loadStatusEnum = pgEnum("load_status", [
  "pending", // Pendiente de cargar
  "loading", // En proceso de carga
  "loaded", // Cargado completo
  "dispatched", // Despachado
  "in_progress", // En ruta
  "completed", // Ruta completada
  "cancelled", // Cancelado
]);

/**
 * Load Item Type Enum
 */
export const loadItemTypeEnum = pgEnum("load_item_type", [
  "by_serial", // Por número de serie individual
  "by_quantity", // Por cantidad (tipo/subtipo)
]);

/**
 * Route Loads Table - Registro de carga diaria de vehículos
 */
export const routeLoads = pgTable("route_loads", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  vehicleId: text("vehicle_id").notNull(),
  driverId: text("driver_id"), // Conductor asignado
  loadDate: timestamp("load_date").notNull(), // Fecha de carga
  status: loadStatusEnum("load_status").default("pending").notNull(),
  plannedDeliveries: integer("planned_deliveries").default(0), // Entregas planeadas
  completedDeliveries: integer("completed_deliveries").default(0), // Entregas completadas
  totalCylindersLoaded: integer("total_cylinders_loaded").default(0),
  totalTanksLoaded: integer("total_tanks_loaded").default(0),
  totalWeightLoaded: integer("total_weight_loaded").default(0), // kg
  departureTime: timestamp("departure_time"),
  returnTime: timestamp("return_time"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Route Load Items Table - Items individuales de la carga
 */
export const routeLoadItems = pgTable("route_load_items", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  routeLoadId: text("route_load_id").notNull(),
  itemType: loadItemTypeEnum("item_type").notNull(),
  assetType: text("asset_type"), // "cylinder" | "tank" (for by_quantity)
  subtype: text("subtype"), // e.g., "20kg_cylinder" (for by_quantity)
  quantity: integer("quantity").notNull(),
  serialNumbers: text("serial_numbers"), // JSON array de serials (for by_serial)
  weightPerUnit: integer("weight_per_unit"), // Peso por unidad en kg
  totalWeight: integer("total_weight").notNull(), // Peso total en kg
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Daily Load Summary Table - Resumen diario por tipo de activo
 */
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

// ============================================================================
// EPIC 3: Customer Experience & Support Admin
// ============================================================================

/**
 * Customer Type Enum
 */
export const customerTypeEnum = pgEnum("customer_type", [
  "residential",
  "corporate",
  "government",
]);

/**
 * Customer Status Enum
 */
export const customerStatusEnum = pgEnum("customer_status", [
  "active",
  "inactive",
  "suspended",
  "prospect",
]);

/**
 * Address Type Enum
 */
export const addressTypeEnum = pgEnum("address_type", [
  "delivery",
  "billing",
  "both",
]);

/**
 * Contact Type Enum
 */
export const contactTypeEnum = pgEnum("contact_type", [
  "primary",
  "billing",
  "technical",
  "emergency",
]);

/**
 * Customers Table - Customer CRM
 */
export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),

  // Basic info
  customerCode: text("customer_code").notNull(), // Código único del cliente
  customerType: customerTypeEnum("customer_type").notNull(),

  // Business info
  businessName: text("business_name"), // Razón social (corporate)
  tradeName: text("trade_name"), // Nombre comercial

  // Tax info (RFC for Mexico)
  taxId: text("tax_id"), // RFC
  taxRegime: text("tax_regime"), // Régimen fiscal

  // Contact info
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  alternatePhone: text("alternate_phone"),

  // Status and classification
  status: customerStatusEnum("customer_status").default("prospect").notNull(),
  priority: integer("priority").default(1).notNull(), // 1=low, 5=high

  // Financial
  creditLimit: integer("credit_limit").default(0),
  paymentTerms: text("payment_terms").default("contado"),

  // Notes
  notes: text("notes"),

  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Customer Addresses Table - Delivery Addresses
 */
export const customerAddresses = pgTable("customer_addresses", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  customerId: text("customer_id").notNull(),

  // Address info
  nickname: text("nickname"), // Casa Juan, Oficinas, etc.
  street: text("street").notNull(),
  externalNumber: text("external_number").notNull(), // Número exterior
  internalNumber: text("internal_number"), // Número interior
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  municipality: text("municipality").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").default("México").notNull(),

  // GPS coordinates (for OSM validation)
  latitude: text("latitude"),
  longitude: text("longitude"),

  // Address type
  addressType: addressTypeEnum("address_type").default("delivery").notNull(),
  isDefaultDelivery: integer("is_default_delivery").default(0).notNull(),
  isDefaultBilling: integer("is_default_billing").default(0).notNull(),

  // Delivery instructions
  deliveryInstructions: text("delivery_instructions"), // Horarios, referencias
  accessNotes: text("access_notes"), // Notas de acceso

  // Status
  isActive: integer("is_active").default(1).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Customer Contacts Table - Contact Persons
 */
export const customerContacts = pgTable("customer_contacts", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  customerId: text("customer_id").notNull(),

  // Contact info
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  position: text("position"), // Cargo

  // Contact details
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  alternatePhone: text("alternate_phone"),

  // Contact type
  contactType: contactTypeEnum("contact_type").notNull(),
  isPrimary: integer("is_primary").default(0).notNull(),

  // Notifications
  receivesNotifications: integer("receives_notifications").default(1).notNull(),

  // Status
  isActive: integer("is_active").default(1).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Product Categories Enum
 */
export const productCategoryEnum = pgEnum("product_category", [
  "gas-lp",
  "gas-estacionario",
  "servicios",
  "accesorios",
  "otro",
]);

/**
 * Products Table
 */
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: productCategoryEnum("category").default("gas-lp").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock"), // Null for services
  unit: text("unit").notNull(), // "cilindro", "litro", "servicio", "pieza"
  status: text("status").default("active").notNull(), // "active", "inactive"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

export const CreateProductSchema = createInsertSchema(products, {
  name: (schema) => schema.min(2).max(100),
  price: (schema) => schema.min(0),
  stock: (schema) => schema.min(0).optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * FAQ Category Enum
 */
export const faqCategoryEnum = pgEnum("faq_category", [
  "general",
  "account",
  "delivery",
  "billing",
  "technical",
  "emergency",
]);

/**
 * FAQ Categories Table
 */
export const faqCategories = pgTable("faq_categories", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(), // Null for global FAQ
  name: text("name").notNull(),
  description: text("description"),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * FAQ Items Table
 */
export const faqItems = pgTable("faq_items", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(), // Null for global FAQ
  categoryId: text("category_id").notNull(),

  // Question and Answer
  question: text("question").notNull(),
  answer: text("answer").notNull(),

  // Meta
  keywords: text("keywords"), // Comma-separated for search
  views: integer("views").default(0).notNull(),

  // Status
  isActive: integer("is_active").default(1).notNull(),
  isFeatured: integer("is_featured").default(0).notNull(), // Show on top

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Support Contacts Table
 */
export const supportContacts = pgTable("support_contacts", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),

  // Contact info
  supportPhone: text("support_phone").notNull(),
  supportEmail: text("support_email").notNull(),
  supportWhatsapp: text("support_whatsapp"),

  // Hours
  supportHours: text("support_hours").default("L-V 9:00-18:00"),
  emergencyPhone: text("emergency_phone"),

  // Location
  officeAddress: text("office_address"),

  updatedBy: text("updated_by").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

/**
 * Legal Document Type Enum
 */
export const legalDocumentTypeEnum = pgEnum("legal_document_type", [
  "privacy_policy",
  "terms_of_service",
  "cookie_policy",
  "disclaimer",
]);

/**
 * Legal Documents Table
 */
export const legalDocuments = pgTable("legal_documents", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),

  // Document info
  documentType: legalDocumentTypeEnum("legal_document_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),

  // Current version reference
  currentVersion: text("current_version").notNull(),

  // Status
  isActive: integer("is_active").default(1).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Legal Versions Table - Version history for legal documents
 */
export const legalVersions = pgTable("legal_versions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  documentId: text("document_id").notNull(),

  // Version info
  version: text("version").notNull(), // e.g., "1.0", "1.1"
  content: text("content").notNull(), // Full legal text (Markdown/HTML)

  // Effective dates
  effectiveDate: timestamp("effective_date").notNull(),
  expirationDate: timestamp("expiration_date"),

  // Status
  isCurrent: integer("is_current").default(0).notNull(),

  // Change summary
  changeSummary: text("change_summary"), // What changed in this version

  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * App Platforms Enum
 */
export const appPlatformEnum = pgEnum("app_platform", [
  "driver_app",
  "client_app",
]);

/**
 * App Versioning Table
 */
export const appVersions = pgTable("app_versions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),

  // Version info
  platform: appPlatformEnum("app_platform").notNull(),
  versionCode: text("version_code").notNull(), // e.g., "1.0.0"
  versionNumber: integer("version_number").notNull(), // For comparisons

  // Download info
  downloadUrl: text("download_url"),
  storeUrl: text("store_url"),

  // Requirements
  minOsVersion: text("min_os_version"),

  // Status
  isMandatory: integer("is_mandatory").default(0).notNull(), // Force update
  isActive: integer("is_active").default(1).notNull(),

  // Release notes
  releaseNotes: text("release_notes"),

  publishedBy: text("published_by").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * User Legal Acceptances Table - Track user acceptance of terms
 */
export const userLegalAcceptances = pgTable("user_legal_acceptances", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),

  // User and document
  userId: text("user_id").notNull(),
  documentId: text("document_id").notNull(),
  versionId: text("version_id").notNull(),

  // Acceptance
  acceptedAt: timestamp("accepted_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  // Document info at acceptance (snapshot)
  documentTitle: text("document_title").notNull(),
  documentVersion: text("document_version").notNull(),
  contentHash: text("content_hash"), // Hash of content at acceptance
});

// ============================================================================
// SCHEMAS FOR EPIC 3
// ============================================================================

/**
 * Customer Schemas
 */
export const CreateCustomerSchema = createInsertSchema(customers, {
  customerCode: z.string().min(3).max(20),
  businessName: z.string().min(2).max(200).optional(),
  tradeName: z.string().min(2).max(100).optional(),
  taxId: z.string().min(12).max(13).optional(), // RFC México
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  priority: z.number().min(1).max(5).optional(),
  creditLimit: z.number().min(0).optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCustomerSchema = createInsertSchema(customers)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * Customer Address Schemas
 */
export const CreateCustomerAddressSchema = createInsertSchema(
  customerAddresses,
  {
    street: z.string().min(2).max(200),
    externalNumber: z.string().min(1).max(20),
    neighborhood: z.string().min(2).max(100),
    city: z.string().min(2).max(100),
    municipality: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    postalCode: z.string().min(4).max(10),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    deliveryInstructions: z.string().max(500).optional(),
  },
).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCustomerAddressSchema = createInsertSchema(customerAddresses)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * Customer Contact Schemas
 */
export const CreateCustomerContactSchema = createInsertSchema(
  customerContacts,
  {
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
  },
).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCustomerContactSchema = createInsertSchema(customerContacts)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * FAQ Category Schemas
 */
export const CreateFaqCategorySchema = createInsertSchema(faqCategories, {
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateFaqCategorySchema = createInsertSchema(faqCategories)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * FAQ Item Schemas
 */
export const CreateFaqItemSchema = createInsertSchema(faqItems, {
  question: z.string().min(5).max(500),
  answer: z.string().min(10).max(5000),
  keywords: z.string().max(500).optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateFaqItemSchema = createInsertSchema(faqItems)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * Support Contact Schemas
 */
export const CreateSupportContactSchema = createInsertSchema(supportContacts, {
  supportPhone: z.string().min(10).max(15),
  supportEmail: z.string().email(),
  supportWhatsapp: z.string().optional(),
  supportHours: z.string().optional(),
  emergencyPhone: z.string().optional(),
  officeAddress: z.string().optional(),
}).omit({
  id: true,
  tenantId: true,
  updatedAt: true,
});

export const UpdateSupportContactSchema = createInsertSchema(supportContacts)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * Legal Document Schemas
 */
export const CreateLegalDocumentSchema = createInsertSchema(legalDocuments, {
  title: z.string().min(5).max(200),
  description: z.string().max(500).optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateLegalDocumentSchema = createInsertSchema(legalDocuments)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * Legal Version Schemas
 */
export const CreateLegalVersionSchema = createInsertSchema(legalVersions, {
  version: z.string().min(3).max(20),
  content: z.string().min(10),
  changeSummary: z.string().max(1000).optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

export const UpdateLegalVersionSchema = createInsertSchema(legalVersions)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * App Version Schemas
 */
export const CreateAppVersionSchema = createInsertSchema(appVersions, {
  versionCode: z.string().min(3).max(20),
  versionNumber: z.number(),
  downloadUrl: z.string().optional(),
  storeUrl: z.string().optional(),
  minOsVersion: z.string().optional(),
  releaseNotes: z.string().optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

export const UpdateAppVersionSchema = createInsertSchema(appVersions)
  .partial()
  .extend({
    id: z.string(),
  });

// ============================================================================
// EPIC 4: Order Lifecycle & Fulfillment
// ============================================================================

/**
 * Order Status Enum - State Machine
 */
export const orderStatusEnum = pgEnum("order_status", [
  "pending", // Pedido nuevo, sin asignar
  "assigned", // Asignado a vehículo/conductor
  "in_progress", // En camino al cliente
  "delivered", // Entregado exitosamente
  "cancelled", // Cancelado
  "failed", // Fallo en entrega (no disponible, etc.)
]);

/**
 * Order Priority Enum
 */
export const orderPriorityEnum = pgEnum("order_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

/**
 * Payment Method Enum
 */
export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "credit_card",
  "debit_card",
  "bank_transfer",
  "credit_account", // Pago a crédito
]);

/**
 * Payment Status Enum
 */
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "partial",
  "refunded",
  "failed",
]);

/**
 * Orders Table - Main order entity
 */
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),

  // Order identification
  orderNumber: text("order_number").notNull(), // ORD-2026-00001

  // Customer reference
  customerId: text("customer_id").notNull(),
  customerAddressId: text("customer_address_id").notNull(),

  // Status and priority (State Machine)
  status: orderStatusEnum("order_status").default("pending").notNull(),
  priority: orderPriorityEnum("order_priority").default("normal").notNull(),

  // Assignment
  assignedVehicleId: text("assigned_vehicle_id"),
  assignedDriverId: text("assigned_driver_id"),
  assignedAt: timestamp("assigned_at"),

  // Delivery schedule
  requestedDate: timestamp("requested_date").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),

  // Financial
  subtotal: integer("subtotal").notNull(),
  taxAmount: integer("tax_amount").default(0).notNull(),
  totalAmount: integer("total_amount").notNull(),

  // Payment
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentStatus: paymentStatusEnum("payment_status")
    .default("pending")
    .notNull(),
  paymentReceived: integer("payment_received").default(0),
  paymentReceivedAt: timestamp("payment_received_at"),
  paymentReference: text("payment_reference"), // Referencia de transferencia

  // Delivery Proof (GPS & Signature)
  deliveryLatitude: text("delivery_latitude"),
  deliveryLongitude: text("delivery_longitude"),
  deliveryAccuracy: text("delivery_accuracy"), // GPS accuracy in meters
  deliveryTime: timestamp("delivery_time"),
  signatureImageUrl: text("signature_image_url"),

  // Notes
  customerNotes: text("customer_notes"), // Notas del cliente
  internalNotes: text("internal_notes"), // Notas internas
  deliveryInstructions: text("delivery_instructions"),

  // Timestamps
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Order Items Table - Products/Services in an order
 */
export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  orderId: text("order_id").notNull(),

  // Product info
  productType: text("product_type").notNull(), // "cylinder", "tank", "service"
  productSubtype: text("product_subtype").notNull(), // "20kg", "100L", etc.
  productName: text("product_name").notNull(),

  // Quantities
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),

  // Totals
  lineTotal: integer("line_total").notNull(),

  // Asset reference (for traceability)
  assetId: text("asset_id"), // Serial del cilindro/tanque específico

  // Notes
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Order History Table - Audit trail for state changes
 */
export const orderHistory = pgTable("order_history", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  orderId: text("order_id").notNull(),

  // State change info
  previousStatus: orderStatusEnum("previous_status"),
  newStatus: orderStatusEnum("new_status").notNull(),

  // Actor
  changedBy: text("changed_by").notNull(),
  changedByRole: text("changed_by_role").notNull(), // "admin", "driver", "system"

  // Details
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Order Status Transition Rules Table
 */
export const orderStatusTransitions = pgEnum("order_status_transition", [
  "pending_to_assigned",
  "pending_to_cancelled",
  "assigned_to_in_progress",
  "assigned_to_cancelled",
  "in_progress_to_delivered",
  "in_progress_to_failed",
  "in_progress_to_cancelled",
  "failed_to_pending", // Reagendar
  "failed_to_cancelled",
]);

// ============================================================================
// EPIC 6: Business Operations & Finance
// ============================================================================

/**
 * Return Load Status Enum
 */
export const returnLoadStatusEnum = pgEnum("return_load_status", [
  "pending", // Pendiente de registrar
  "in_progress", // En proceso de registro
  "completed", // Completado
  "discrepancy", // Con discrepancias
  "cancelled", // Cancelado
]);

/**
 * Return Load Item Type Enum
 */
export const returnItemTypeEnum = pgEnum("return_item_type", [
  "full", // Cilindro/tanque lleno devuelto
  "empty", // Cilindro/tanque vacío devuelto
  "exchange", // Intercambio (entrega lleno, recibe vacío)
  "missing", // No entregado (falta)
  "damaged", // Dañado
]);

/**
 * Return Loads Table - Registro de devolución al finalizar ruta
 */
export const returnLoads = pgTable("return_loads", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  routeLoadId: text("route_load_id").notNull(), // Referencia a carga inicial
  vehicleId: text("vehicle_id").notNull(),
  driverId: text("driver_id"),
  returnDate: timestamp("return_date").notNull(),
  status: returnLoadStatusEnum("return_load_status")
    .default("pending")
    .notNull(),

  // Totals
  totalFullReturned: integer("total_full_returned").default(0),
  totalEmptyReturned: integer("total_empty_returned").default(0),
  totalExchanged: integer("total_exchanged").default(0),
  totalMissing: integer("total_missing").default(0),
  totalDamaged: integer("total_damaged").default(0),

  // Weight totals (kg)
  totalWeightFullReturned: integer("total_weight_full_returned").default(0),
  totalWeightEmptyReturned: integer("total_weight_empty_returned").default(0),

  // Notes
  notes: text("notes"),
  discrepancyNotes: text("discrepancy_notes"),

  // Reconciled by
  reconciledBy: text("reconciled_by"),
  reconciledAt: timestamp("reconciled_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Return Load Items Table - Items individuales de la devolución
 */
export const returnLoadItems = pgTable("return_load_items", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  returnLoadId: text("return_load_id").notNull(),
  orderId: text("order_id"), // Referencia a orden

  // Item type and details
  itemType: returnItemTypeEnum("return_item_type").notNull(),
  assetType: text("asset_type"), // "cylinder" | "tank"
  subtype: text("subtype"), // e.g., "20kg_cylinder"
  serialNumber: text("serial_number"), // Para seguimiento individual

  // Quantities
  quantity: integer("quantity").notNull(),
  weightPerUnit: integer("weight_per_unit"), // kg
  totalWeight: integer("total_weight").notNull(),

  // Notes
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Discrepancy Type Enum
 */
export const discrepancyTypeEnum = pgEnum("discrepancy_type", [
  "missing_asset", // Activo no devuelto
  "weight_mismatch", // Discrepancia de peso
  "damaged_asset", // Activo dañado
  "over_inventory", // Inventario excedente
  "other", // Otro
]);

/**
 * Discrepancy Status Enum
 */
export const discrepancyStatusEnum = pgEnum("discrepancy_status", [
  "pending",
  "investigating",
  "resolved",
  "written_off",
]);

/**
 * Discrepancies Table - Registro de discrepancias de inventario
 */
export const discrepancies = pgTable("discrepancies", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  returnLoadId: text("return_load_id"),
  orderId: text("order_id"),

  // Discrepancy details
  type: discrepancyTypeEnum("discrepancy_type").notNull(),
  assetType: text("asset_type"),
  serialNumber: text("serial_number"),
  expectedQuantity: integer("expected_quantity"),
  actualQuantity: integer("actual_quantity"),
  discrepancyQuantity: integer("discrepancy_quantity").notNull(),

  // Resolution
  status: discrepancyStatusEnum("status").default("pending"),
  resolutionNotes: text("resolution_notes"),
  resolvedBy: text("resolved_by"),
  resolvedAt: timestamp("resolved_at"),

  // Financial impact
  estimatedValue: integer("estimated_value"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Billing Request Status Enum
 */
export const billingRequestStatusEnum = pgEnum("billing_request_status", [
  "requested", // Solicitado por cliente
  "pending", // Pendiente de revisión
  "approved", // Aprobado para facturación
  "issued", // Factura emitida
  "delivered", // Factura entregada al cliente
  "cancelled", // Cancelado
  "rejected", // Rechazado
]);

/**
 * CFDI Use Enum (Mexico tax code)
 */
export const cfdiUseEnum = pgEnum("cfdi_use", [
  "G01", // Adquisición de mercancías
  "G02", // Devoluciones, descuentos o bonificaciones
  "G03", // Gastos en general
  "I01", // Construcciones
  "I02", // Mobilario y equipo de oficina
  "I03", // Equipo de transporte
  "I04", // Herramientas y refacciones
  "I05", // Equipo de comunicación
  "I06", // Activos intangibles
  "I07", // Gastos
  "I08", // Otros
]);

/**
 * Billing Requests Table - Solicitudes de facturación
 */
export const billingRequests = pgTable("billing_requests", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  customerId: text("customer_id").notNull(),
  orderId: text("order_id"), // Orden relacionada

  // Request details
  requestDate: timestamp("request_date").defaultNow().notNull(),

  // Customer fiscal data
  taxId: text("tax_id").notNull(), // RFC
  businessName: text("business_name").notNull(), // Razón social
  taxRegime: text("tax_regime"), // Régimen fiscal
  cfdiUse: cfdiUseEnum("cfdi_use"), // Uso de CFDI
  email: text("email").notNull(), // Email para enviar factura

  // Financial
  subtotal: integer("subtotal").notNull(),
  taxAmount: integer("tax_amount").default(0).notNull(),
  totalAmount: integer("total_amount").notNull(),

  // Status
  status: billingRequestStatusEnum("billing_request_status")
    .default("requested")
    .notNull(),

  // Invoice info
  invoiceNumber: text("invoice_number"), // UUID del SAT
  invoiceDate: timestamp("invoice_date"),

  // Document storage
  pdfUrl: text("pdf_url"),
  xmlUrl: text("xml_url"),

  // Processing
  processedBy: text("processed_by"),
  processedAt: timestamp("processed_at"),

  // Notes
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Report Type Enum
 */
export const reportTypeEnum = pgEnum("report_type", [
  "sales_by_product", // Ventas por producto
  "sales_by_driver", // Ventas por conductor
  "sales_by_period", // Ventas por período
  "driver_performance", // Rendimiento de conductores
  "inventory_turn", // Rotación de inventario
  "delivery_summary", // Resumen de entregas
  "reconciliation", // Conciliación
  "financial_summary", // Resumen financiero
]);

/**
 * Report Format Enum
 */
export const reportFormatEnum = pgEnum("report_format", ["pdf", "csv", "xlsx"]);

/**
 * Report Status Enum
 */
export const reportStatusEnum = pgEnum("report_status", [
  "generating",
  "completed",
  "failed",
]);

/**
 * Generated Reports Table - Reportes generados
 */
export const generatedReports = pgTable("generated_reports", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),

  // Report definition
  reportType: reportTypeEnum("report_type").notNull(),
  reportName: text("report_name").notNull(),

  // Parameters
  dateFrom: timestamp("date_from").notNull(),
  dateTo: timestamp("date_to").notNull(),
  filters: text("filters"), // JSON con filtros adicionales

  // Output
  format: reportFormatEnum("report_format").notNull(),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),

  // Status
  status: reportStatusEnum("status").default("generating"),

  // Statistics
  totalRecords: integer("total_records"),
  totalAmount: integer("total_amount"),

  // Generated by
  generatedBy: text("generated_by").notNull(),

  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// ============================================================================
// SCHEMAS FOR EPIC 6
// ============================================================================

/**
 * Return Load Schema
 */
export const CreateReturnLoadSchema = createInsertSchema(returnLoads, {
  notes: z.string().optional(),
  discrepancyNotes: z.string().optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateReturnLoadSchema = createInsertSchema(returnLoads)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * Return Load Item Schema
 */
export const CreateReturnLoadItemSchema = createInsertSchema(returnLoadItems, {
  serialNumber: z.string().optional(),
  notes: z.string().optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

/**
 * Billing Request Schema
 */
export const CreateBillingRequestSchema = createInsertSchema(billingRequests, {
  notes: z.string().optional(),
}).omit({
  id: true,
  tenantId: true,
  requestDate: true,
  status: true,
  invoiceNumber: true,
  invoiceDate: true,
  pdfUrl: true,
  xmlUrl: true,
  processedBy: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateBillingRequestSchema = createInsertSchema(billingRequests)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * Generate Report Schema
 */
export const GenerateReportSchema = z.object({
  reportType: reportTypeEnum,
  reportName: z.string().min(3).max(100),
  dateFrom: z.date(),
  dateTo: z.date(),
  format: z.enum(["pdf", "csv", "xlsx"]).default("pdf"),
  filters: z.string().optional(),
});

export * from "./auth-schema";

// ============================================================================
// EPIC 5: Real-time Logistics & Fleet Monitoring
// ============================================================================

/**
 * Vehicle Tracking Status Enum
 */
export const vehicleTrackingStatusEnum = pgEnum("vehicle_tracking_status", [
  "idle", // Vehículo estacionado/sin actividad
  "in_route", // En ruta de entrega
  "loading", // Cargando en planta
  "problem", // Problema reportado
  "offline", // Sin transmisión GPS
]);

/**
 * Vehicle Tracking Table - GPS coordinates for real-time fleet monitoring
 */
export const vehicleTracking = pgTable("vehicle_tracking", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  vehicleId: text("vehicle_id").notNull(),
  driverId: text("driver_id"),

  // GPS coordinates
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  altitude: text("altitude"),
  accuracy: text("accuracy"), // GPS accuracy in meters
  speed: text("speed"), // Current speed in km/h
  heading: text("heading"), // Direction in degrees (0-360)

  // Status
  status: vehicleTrackingStatusEnum("vehicle_tracking_status")
    .default("idle")
    .notNull(),

  // Context
  currentOrderId: text("current_order_id"),
  routeLoadId: text("route_load_id"),

  // Device info
  deviceId: text("device_id"),
  batteryLevel: text("battery_level"), // Percentage

  // Timestamps
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  serverReceivedAt: timestamp("server_received_at").defaultNow().notNull(),
});

/**
 * Device Platform Enum
 */
export const devicePlatformEnum = pgEnum("device_platform", [
  "ios",
  "android",
  "web",
]);

/**
 * Device Tokens Table - For push notifications (Expo/FCM)
 */
export const deviceTokens = pgTable("device_tokens", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  userId: text("user_id").notNull(),

  // Token info
  deviceToken: text("device_token").notNull(),
  platform: devicePlatformEnum("device_platform").notNull(),

  // Device info
  deviceId: text("device_id"),
  deviceName: text("device_name"),
  appVersion: text("app_version"),

  // Status
  isActive: integer("is_active").default(1).notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Notification Type Enum
 */
export const notificationTypeEnum = pgEnum("notification_type", [
  "order_assigned", // Nueva orden asignada
  "order_updated", // Orden actualizada
  "order_cancelled", // Orden cancelada
  "route_changed", // Ruta modificada
  "priority_change", // Cambio de prioridad
  "delivery_reminder", // Recordatorio de entrega
  "safety_alert", // Alerta de seguridad
  "system_message", // Mensaje del sistema
]);

/**
 * Notification Priority Enum
 */
export const notificationPriorityEnum = pgEnum("notification_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

/**
 * Notification Status Enum
 */
export const notificationStatusEnum = pgEnum("notification_status", [
  "pending", // En cola para envío
  "sent", // Enviado exitosamente
  "delivered", // Confirmado por dispositivo
  "read", // Leído por usuario
  "failed", // Falló el envío
]);

/**
 * Notifications Table - Push notification history
 */
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),

  // Target
  userId: text("user_id").notNull(),
  deviceTokenId: text("device_token_id"),

  // Content
  title: text("title").notNull(),
  body: text("body").notNull(),
  data: text("data"), // JSON payload for deep linking

  // Type and priority
  type: notificationTypeEnum("notification_type").notNull(),
  priority: notificationPriorityEnum("notification_priority")
    .default("normal")
    .notNull(),

  // Related entity
  entityType: text("entity_type"), // "order", "route", etc.
  entityId: text("entity_id"),

  // Status
  status: notificationStatusEnum("notification_status")
    .default("pending")
    .notNull(),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),

  // Error info
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),

  // Creator
  createdBy: text("created_by"), // null if system-generated

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Messaging Conversations Table
 */
export const messagingConversations = pgTable("messaging_conversations", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),

  // Participants
  participantIds: text("participant_ids").notNull(), // JSON array of user IDs

  // Context
  relatedEntityType: text("related_entity_type"), // "order", "route", "vehicle"
  relatedEntityId: text("related_entity_id"),

  // Status
  isActive: integer("is_active").default(1).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

/**
 * Message Type Enum
 */
export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "location", // GPS location share
  "system", // System message (e.g., "Driver assigned")
]);

/**
 * Messages Table
 */
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  conversationId: text("conversation_id").notNull(),

  // Sender
  senderId: text("sender_id").notNull(),
  senderRole: text("sender_role").notNull(),

  // Content
  type: messageTypeEnum("message_type").default("text").notNull(),
  content: text("content").notNull(),

  // Attachments
  attachments: text("attachments"), // JSON array of URLs

  // Location data (for location messages)
  latitude: text("latitude"),
  longitude: text("longitude"),

  // Status
  isRead: integer("is_read").default(0).notNull(),
  readBy: text("read_by"), // JSON array of user IDs who read

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// SCHEMAS FOR EPIC 5
// ============================================================================

/**
 * Vehicle Tracking Schemas
 */
export const CreateVehicleTrackingSchema = createInsertSchema(vehicleTracking, {
  latitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  longitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  accuracy: z.string().optional(),
  speed: z.string().optional(),
  heading: z.string().optional(),
}).omit({
  id: true,
  tenantId: true,
  recordedAt: true,
  serverReceivedAt: true,
});

export const UpdateVehicleTrackingSchema = createInsertSchema(vehicleTracking)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * Device Token Schemas
 */
export const CreateDeviceTokenSchema = createInsertSchema(deviceTokens, {
  deviceToken: z.string().min(10),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  appVersion: z.string().optional(),
}).omit({
  id: true,
  tenantId: true,
  isActive: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateDeviceTokenSchema = createInsertSchema(deviceTokens)
  .partial()
  .extend({
    id: z.string(),
  });

/**
 * Notification Schemas
 */
export const CreateNotificationSchema = createInsertSchema(notifications, {
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.string().optional(),
}).omit({
  id: true,
  tenantId: true,
  status: true,
  sentAt: true,
  deliveredAt: true,
  readAt: true,
  errorMessage: true,
  retryCount: true,
  createdAt: true,
});

/**
 * Proximity Search Schema
 */
export const ProximitySearchSchema = z.object({
  latitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  longitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  radiusKm: z.number().min(1).max(100).default(50), // Search radius in km
  limit: z.number().min(1).max(50).default(10),
  excludeVehicleIds: z.array(z.string()).optional(),
  vehicleStatus: z
    .enum(["idle", "in_route", "loading", "problem", "offline"])
    .optional(),
});

/**
 * Message Schemas
 */
export const CreateMessageSchema = createInsertSchema(messages, {
  content: z.string().min(1).max(2000),
  attachments: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
}).omit({
  id: true,
  tenantId: true,
  conversationId: true,
  senderId: true,
  senderRole: true,
  isRead: true,
  readBy: true,
  createdAt: true,
});

// ============================================================================
// EPIC 7: Driver Mobile App
// ============================================================================
export * from "./schema-epic7";

// ============================================================================
// BACKOFFICE TABLES (Dashboard Redesign)
// ============================================================================

export const drivers = pgTable("drivers", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  licenseNumber: text("license_number").notNull(),
  // licenseExpiry: timestamp("license_expiry"),
  assignedUnitId: text("assigned_unit_id"),
  currentLocation: text("current_location"),
  totalDeliveries: integer("total_deliveries").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  status: text("status").notNull().default("disconnected"), // 'available', 'busy', 'disconnected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

export const customerReports = pgTable("customer_reports", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  reportNumber: text("report_number").notNull(),
  customerId: text("customer_id").notNull(),
  category: text("category").notNull(), // 'delivery', 'product', 'service', 'billing'
  subject: text("subject").notNull(),
  description: text("description"),
  priority: text("priority").notNull(), // 'low', 'medium', 'high', 'urgent'
  status: text("status").notNull().default("pending"), // 'pending', 'in-progress', 'resolved'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const driverReports = pgTable("driver_reports", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  reportNumber: text("report_number").notNull(),
  driverId: text("driver_id").notNull(),
  unitId: text("unit_id"),
  issueType: text("issue_type").notNull(), // 'mechanical', 'accident', 'flat-tire', 'other'
  location: text("location"),
  description: text("description"),
  status: text("status").notNull().default("pending"), // 'pending', 'in-progress', 'resolved'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const faqs = pgTable("faqs", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  orderNumber: integer("order_number").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(), // 'delivery', 'payment', 'product', 'general'
  status: text("status").notNull().default("active"), // 'active', 'inactive'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => sql`now()`)
    .notNull(),
});
