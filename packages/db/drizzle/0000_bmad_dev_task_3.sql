CREATE TYPE "public"."address_type" AS ENUM('delivery', 'billing', 'both');--> statement-breakpoint
CREATE TYPE "public"."app_platform" AS ENUM('driver_app', 'client_app');--> statement-breakpoint
CREATE TYPE "public"."asset_history_action" AS ENUM('created', 'status_changed', 'location_changed', 'assigned', 'returned', 'inspection', 'maintenance', 'retired');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('in_stock', 'in_route', 'delivered', 'maintenance', 'retired');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('cylinder', 'tank');--> statement-breakpoint
CREATE TYPE "public"."billing_request_status" AS ENUM('requested', 'pending', 'approved', 'issued', 'delivered', 'cancelled', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."certification_status" AS ENUM('valid', 'expired', 'pending_renewal', 'revoked', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."certification_type" AS ENUM('drivers_license', 'hazmat_certification', 'safety_training', 'first_aid', 'vehicle_inspection', 'weight_limit_authorization', 'gas_handling');--> statement-breakpoint
CREATE TYPE "public"."cfdi_use" AS ENUM('G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('primary', 'billing', 'technical', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."customer_status" AS ENUM('active', 'inactive', 'suspended', 'prospect');--> statement-breakpoint
CREATE TYPE "public"."customer_type" AS ENUM('residential', 'corporate', 'government');--> statement-breakpoint
CREATE TYPE "public"."device_platform" AS ENUM('ios', 'android', 'web');--> statement-breakpoint
CREATE TYPE "public"."discrepancy_status" AS ENUM('pending', 'investigating', 'resolved', 'written_off');--> statement-breakpoint
CREATE TYPE "public"."discrepancy_type" AS ENUM('missing_asset', 'weight_mismatch', 'damaged_asset', 'over_inventory', 'other');--> statement-breakpoint
CREATE TYPE "public"."faq_category" AS ENUM('general', 'account', 'delivery', 'billing', 'technical', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('gasoline', 'diesel', 'electric', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."legal_document_type" AS ENUM('privacy_policy', 'terms_of_service', 'cookie_policy', 'disclaimer');--> statement-breakpoint
CREATE TYPE "public"."load_item_type" AS ENUM('by_serial', 'by_quantity');--> statement-breakpoint
CREATE TYPE "public"."load_status" AS ENUM('pending', 'loading', 'loaded', 'dispatched', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'location', 'system');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'delivered', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order_assigned', 'order_updated', 'order_cancelled', 'route_changed', 'priority_change', 'delivery_reminder', 'safety_alert', 'system_message');--> statement-breakpoint
CREATE TYPE "public"."order_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'assigned', 'in_progress', 'delivered', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."order_status_transition" AS ENUM('pending_to_assigned', 'pending_to_cancelled', 'assigned_to_in_progress', 'assigned_to_cancelled', 'in_progress_to_delivered', 'in_progress_to_failed', 'in_progress_to_cancelled', 'failed_to_pending', 'failed_to_cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'credit_account');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'partial', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."report_format" AS ENUM('pdf', 'csv', 'xlsx');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('generating', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('sales_by_product', 'sales_by_driver', 'sales_by_period', 'driver_performance', 'inventory_turn', 'delivery_summary', 'reconciliation', 'financial_summary');--> statement-breakpoint
CREATE TYPE "public"."return_item_type" AS ENUM('full', 'empty', 'exchange', 'missing', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."return_load_status" AS ENUM('pending', 'in_progress', 'completed', 'discrepancy', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('superadmin', 'admin', 'supervisor', 'operator', 'chofer', 'cliente');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('active', 'maintenance', 'retired');--> statement-breakpoint
CREATE TYPE "public"."vehicle_tracking_status" AS ENUM('idle', 'in_route', 'loading', 'problem', 'offline');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('truck', 'van', 'pickup', 'motorcycle');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('superadmin', 'admin', 'supervisor', 'operator', 'chofer', 'cliente');--> statement-breakpoint
CREATE TYPE "public"."route_incident_status" AS ENUM('open', 'in_progress', 'resolved', 'escalated', 'closed');--> statement-breakpoint
CREATE TYPE "public"."route_incident_type" AS ENUM('leak', 'vehicle_issue', 'customer_absent', 'access_denied', 'safety_hazard', 'equipment_failure', 'other');--> statement-breakpoint
CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"content" text NOT NULL,
	"tenant_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "app_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"app_platform" "app_platform" NOT NULL,
	"version_code" text NOT NULL,
	"version_number" integer NOT NULL,
	"download_url" text,
	"store_url" text,
	"min_os_version" text,
	"is_mandatory" integer DEFAULT 0 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"release_notes" text,
	"published_by" text NOT NULL,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_history" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"action" "asset_history_action" NOT NULL,
	"previous_value" text,
	"new_value" text,
	"performed_by" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"serial_number" text NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"subtype" text NOT NULL,
	"capacity" integer NOT NULL,
	"asset_status" "asset_status" DEFAULT 'in_stock' NOT NULL,
	"current_owner_id" text,
	"current_owner_type" text,
	"location" text,
	"manufacturing_date" timestamp,
	"purchase_date" timestamp,
	"purchase_price" integer,
	"last_inspection_date" timestamp,
	"next_inspection_date" timestamp,
	"weight_empty" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"actor_email" text NOT NULL,
	"old_values" text,
	"new_values" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"order_id" text,
	"request_date" timestamp DEFAULT now() NOT NULL,
	"tax_id" text NOT NULL,
	"business_name" text NOT NULL,
	"tax_regime" text,
	"cfdi_use" "cfdi_use",
	"email" text NOT NULL,
	"subtotal" integer NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"billing_request_status" "billing_request_status" DEFAULT 'requested' NOT NULL,
	"invoice_number" text,
	"invoice_date" timestamp,
	"pdf_url" text,
	"xml_url" text,
	"processed_by" text,
	"processed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certification_alert_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"certification_type" "certification_type" NOT NULL,
	"days_before_expiration" integer DEFAULT 30 NOT NULL,
	"is_enabled" integer DEFAULT 1 NOT NULL,
	"notify_admins" integer DEFAULT 1 NOT NULL,
	"notify_driver" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"nickname" text,
	"street" text NOT NULL,
	"external_number" text NOT NULL,
	"internal_number" text,
	"neighborhood" text NOT NULL,
	"city" text NOT NULL,
	"municipality" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text DEFAULT 'México' NOT NULL,
	"latitude" text,
	"longitude" text,
	"address_type" "address_type" DEFAULT 'delivery' NOT NULL,
	"is_default_delivery" integer DEFAULT 0 NOT NULL,
	"is_default_billing" integer DEFAULT 0 NOT NULL,
	"delivery_instructions" text,
	"access_notes" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"position" text,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"alternate_phone" text,
	"contact_type" "contact_type" NOT NULL,
	"is_primary" integer DEFAULT 0 NOT NULL,
	"receives_notifications" integer DEFAULT 1 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"customer_code" text NOT NULL,
	"customer_type" "customer_type" NOT NULL,
	"business_name" text,
	"trade_name" text,
	"tax_id" text,
	"tax_regime" text,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"alternate_phone" text,
	"customer_status" "customer_status" DEFAULT 'prospect' NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"credit_limit" integer DEFAULT 0,
	"payment_terms" text DEFAULT 'contado',
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_load_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"load_date" timestamp NOT NULL,
	"asset_type" text NOT NULL,
	"subtype" text NOT NULL,
	"total_quantity" integer NOT NULL,
	"total_weight" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"device_token" text NOT NULL,
	"device_platform" "device_platform" NOT NULL,
	"device_id" text,
	"device_name" text,
	"app_version" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discrepancies" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"return_load_id" text,
	"order_id" text,
	"discrepancy_type" "discrepancy_type" NOT NULL,
	"asset_type" text,
	"serial_number" text,
	"expected_quantity" integer,
	"actual_quantity" integer,
	"discrepancy_quantity" integer NOT NULL,
	"status" "discrepancy_status" DEFAULT 'pending',
	"resolution_notes" text,
	"resolved_by" text,
	"resolved_at" timestamp,
	"estimated_value" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_certifications" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"driver_id" text NOT NULL,
	"certification_type" "certification_type" NOT NULL,
	"certification_name" text NOT NULL,
	"issuing_authority" text NOT NULL,
	"document_url" text,
	"issue_date" timestamp NOT NULL,
	"expiration_date" timestamp NOT NULL,
	"certification_status" "certification_status" DEFAULT 'valid' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq_items" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"category_id" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"keywords" text,
	"views" integer DEFAULT 0 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"is_featured" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"report_type" "report_type" NOT NULL,
	"report_name" text NOT NULL,
	"date_from" timestamp NOT NULL,
	"date_to" timestamp NOT NULL,
	"filters" text,
	"report_format" "report_format" NOT NULL,
	"file_url" text,
	"file_size" integer,
	"status" "report_status" DEFAULT 'generating',
	"total_records" integer,
	"total_amount" integer,
	"generated_by" text NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" NOT NULL,
	"organization_id" text NOT NULL,
	"invited_by" text NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "legal_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"legal_document_type" "legal_document_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"current_version" text NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"document_id" text NOT NULL,
	"version" text NOT NULL,
	"content" text NOT NULL,
	"effective_date" timestamp NOT NULL,
	"expiration_date" timestamp,
	"is_current" integer DEFAULT 0 NOT NULL,
	"change_summary" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"sender_role" text NOT NULL,
	"message_type" "message_type" DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"attachments" text,
	"latitude" text,
	"longitude" text,
	"is_read" integer DEFAULT 0 NOT NULL,
	"read_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messaging_conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"participant_ids" text NOT NULL,
	"related_entity_type" text,
	"related_entity_id" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"device_token_id" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"data" text,
	"notification_type" "notification_type" NOT NULL,
	"notification_priority" "notification_priority" DEFAULT 'normal' NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"notification_status" "notification_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_history" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"order_id" text NOT NULL,
	"previous_status" "order_status",
	"new_status" "order_status" NOT NULL,
	"changed_by" text NOT NULL,
	"changed_by_role" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"order_id" text NOT NULL,
	"product_type" text NOT NULL,
	"product_subtype" text NOT NULL,
	"product_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"line_total" integer NOT NULL,
	"asset_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"order_number" text NOT NULL,
	"customer_id" text NOT NULL,
	"customer_address_id" text NOT NULL,
	"order_status" "order_status" DEFAULT 'pending' NOT NULL,
	"order_priority" "order_priority" DEFAULT 'normal' NOT NULL,
	"assigned_vehicle_id" text,
	"assigned_driver_id" text,
	"assigned_at" timestamp,
	"requested_date" timestamp NOT NULL,
	"scheduled_date" timestamp,
	"actual_delivery_date" timestamp,
	"subtotal" integer NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"payment_method" "payment_method",
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_received" integer DEFAULT 0,
	"payment_received_at" timestamp,
	"payment_reference" text,
	"delivery_latitude" text,
	"delivery_longitude" text,
	"delivery_accuracy" text,
	"delivery_time" timestamp,
	"signature_image_url" text,
	"customer_notes" text,
	"internal_notes" text,
	"delivery_instructions" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subdomain" text,
	"logo_url" text,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"subscription_plan" text DEFAULT 'free' NOT NULL,
	"subscription_status" text DEFAULT 'active' NOT NULL,
	"subscription_expires_at" timestamp,
	"max_users" text DEFAULT '5' NOT NULL,
	"max_vehicles" text DEFAULT '2' NOT NULL,
	"settings" text DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "organizations_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "return_load_items" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"return_load_id" text NOT NULL,
	"order_id" text,
	"return_item_type" "return_item_type" NOT NULL,
	"asset_type" text,
	"subtype" text,
	"serial_number" text,
	"quantity" integer NOT NULL,
	"weight_per_unit" integer,
	"total_weight" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_loads" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"route_load_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"driver_id" text,
	"return_date" timestamp NOT NULL,
	"return_load_status" "return_load_status" DEFAULT 'pending' NOT NULL,
	"total_full_returned" integer DEFAULT 0,
	"total_empty_returned" integer DEFAULT 0,
	"total_exchanged" integer DEFAULT 0,
	"total_missing" integer DEFAULT 0,
	"total_damaged" integer DEFAULT 0,
	"total_weight_full_returned" integer DEFAULT 0,
	"total_weight_empty_returned" integer DEFAULT 0,
	"notes" text,
	"discrepancy_notes" text,
	"reconciled_by" text,
	"reconciled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_load_items" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"route_load_id" text NOT NULL,
	"item_type" "load_item_type" NOT NULL,
	"asset_type" text,
	"subtype" text,
	"quantity" integer NOT NULL,
	"serial_numbers" text,
	"weight_per_unit" integer,
	"total_weight" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_loads" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"driver_id" text,
	"load_date" timestamp NOT NULL,
	"load_status" "load_status" DEFAULT 'pending' NOT NULL,
	"planned_deliveries" integer DEFAULT 0,
	"completed_deliveries" integer DEFAULT 0,
	"total_cylinders_loaded" integer DEFAULT 0,
	"total_tanks_loaded" integer DEFAULT 0,
	"total_weight_loaded" integer DEFAULT 0,
	"departure_time" timestamp,
	"return_time" timestamp,
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"support_phone" text NOT NULL,
	"support_email" text NOT NULL,
	"support_whatsapp" text,
	"support_hours" text DEFAULT 'L-V 9:00-18:00',
	"emergency_phone" text,
	"office_address" text,
	"updated_by" text NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_legal_acceptances" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"document_id" text NOT NULL,
	"version_id" text NOT NULL,
	"accepted_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"document_title" text NOT NULL,
	"document_version" text NOT NULL,
	"content_hash" text
);
--> statement-breakpoint
CREATE TABLE "vehicle_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"driver_id" text,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"altitude" text,
	"accuracy" text,
	"speed" text,
	"heading" text,
	"vehicle_tracking_status" "vehicle_tracking_status" DEFAULT 'idle' NOT NULL,
	"current_order_id" text,
	"route_load_id" text,
	"device_id" text,
	"battery_level" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"server_received_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"license_plate" text NOT NULL,
	"vehicle_type" "vehicle_type" NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer,
	"vin" text,
	"capacity_weight" integer DEFAULT 0,
	"capacity_volume" integer DEFAULT 0,
	"fuel_type" "fuel_type" DEFAULT 'diesel' NOT NULL,
	"vehicle_status" "vehicle_status" DEFAULT 'active' NOT NULL,
	"assigned_driver_id" text,
	"last_latitude" text,
	"last_longitude" text,
	"last_location_updated_at" timestamp,
	"registration_expiry" timestamp,
	"insurance_expiry" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"tenant_id" text,
	"role" "role" DEFAULT 'cliente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"order_id" text NOT NULL,
	"delivery_latitude" text,
	"delivery_longitude" text,
	"delivery_accuracy" text,
	"distance_from_address" text,
	"delivery_time" timestamp NOT NULL,
	"signature_image_url" text,
	"signed_by_name" text,
	"photo_url" text,
	"confirmed_by" text NOT NULL,
	"confirmed_at" timestamp NOT NULL,
	"delivery_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_incidents" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"incident_number" text NOT NULL,
	"route_load_id" text,
	"vehicle_id" text,
	"driver_id" text NOT NULL,
	"order_id" text,
	"customer_id" text,
	"incident_type" "route_incident_type" NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"description" text NOT NULL,
	"photo_urls" text,
	"status" "route_incident_status" DEFAULT 'open' NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" text,
	"resolution_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"operation" text NOT NULL,
	"payload" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"synced_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");