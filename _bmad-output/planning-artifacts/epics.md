---
stepsCompleted: [1, 2, 3, 4]
status: "complete"
workflowType: "epics-and-stories"
project_name: "gasera"
user_name: "Petroil"
date: "2026-02-09T12:05:00-07:00"
inputDocuments: ["prd.md", "architecture.md", "Documentación App Gasera.docx"]
---

# gasera - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for gasera, decomposing the requirements from the PRD, UX Design (extracted from Documentación App Gasera.docx), and technical requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Multi-tenant SaaS logic isolation via `tenant_id`.
FR2: Super-Admin panel for managing companies and subscriptions.
FR3: Role-Based Access Control (RBAC) (Super-Admin, Admin, Chofer, Cliente).
FR4: Vehicle master registry with capacity and load tracking.
FR5: Asset traceability (cylinders/tanks) via serials.
FR6: Driver license and safety certification alerts.
FR7: Initial load registration for daily routes.
FR8: Automatic inventory reconciliation at route closure.
FR9: Anomaly/leak detection and reporting.
FR10: Manual and bulk order creation from BackOffice.
FR11: Intelligent assignment based on proximity and inventory.
FR12: Immutable order state machine (Pending -> On Way -> Delivered -> Cancelled).
FR13: Offline-first mobile operation for drivers.
FR14: GPS-validated delivery coordinates.
FR15: Payment registration (Cash/Digital) and signature capture.
FR16: (From DOCX) Advanced BackOffice dashboard with "Activity Recent" and Quick Access.
FR17: (From DOCX) Customer management with multiple delivery addresses.
FR18: (From DOCX) Technical support management with editable FAQ and contact info.
FR19: (From DOCX) App Info management (Privacy/Terms) for both Driver and Client apps.
FR20: (From DOCX) Real-time delivery monitoring with OSM mapping and "Full Map" view.
FR21: (From DOCX) Push notification messaging system for Clients and Choferes.
FR22: (From DOCX) Billing (Facturación) request management with CFDI usage.
FR23: (From DOCX) Exportable business reports (Sales, Products, Choferes).

### NonFunctional Requirements

NFR1: Push notification latency < 5 seconds for drivers.
NFR2: Offline functionality for core delivery registration.
NFR3: Scalability for 100 companies and 500 active drivers in Year 1.
NFR4: Backend-enforced security for all API endpoints.
NFR5: Encryption of personal/sensitive data.
NFR6: Immutable audit logs for inventory and finance.
NFR7: OpenStreetMap (Leaflet/Mapbox) for mapping to ensure independence.
NFR8: Battery-optimized GPS tracking.

### Additional Requirements

- **Starter Template**: **T3 Turbo** (Turborepo + Next.js + Expo). Base command: `npx create-turbo@latest -e https://github.com/t3-oss/create-t3-turbo`.
- **Data Isolation**: Supabase **Row Level Security (RLS)** with mandatory `tenant_id` for all multi-tenant tables.
- **API Layer**: **tRPC** for type-safe communication between Backoffice and Server.
- **Frontend**: Next.js 16 (App Router) + Shadcn/ui + Tailwind 4.
- **Real-time Monitoring**: Supabase Realtime for fleet and order updates.
- **Audit System**: Immutable logs for inventory and payments (Triggers/Prisma Middleware).
- **Validation**: Shared **Zod** schemas across the monorepo.
- **Deployment**: Vercel (Frontend) + Supabase Cloud (Backend).
- **Priority**: **Backoffice First** approach.

### FR Coverage Map

- **FR1 (Multi-tenancy)**: Epic 1
- **FR2 (Super-Admin)**: Epic 1
- **FR3 (RBAC)**: Epic 1
- **FR4 (Vehicles)**: Epic 2
- **FR5 (Assets)**: Epic 2
- **FR6 (Safety Alerts)**: Epic 2
- **FR7 (Initial Load)**: Epic 2 / Epic 6
- **FR8 (Reconciliation)**: Epic 6
- **FR9 (Leaks)**: Epic 7
- **FR10 (Orders CRUD)**: Epic 4
- **FR11 (Assignment)**: Epic 5
- **FR12 (State Machine)**: Epic 4
- **FR13 (Offline Mobile)**: Epic 7
- **FR14 (GPS Valid)**: Epic 7 / Epic 5
- **FR15 (Payments)**: Epic 7
- **FR16 (Dashboard)**: Epic 4
- **FR17 (Customer CRM)**: Epic 3
- **FR18 (Technical Support)**: Epic 3
- **FR19 (App Info)**: Epic 3
- **FR20 (Map Monitoring)**: Epic 5
- **FR21 (Push Notifications)**: Epic 5
- **FR22 (Billing/CFDI)**: Epic 6
- **FR23 (Reports)**: Epic 6

## Epic List

### Epic 1: SaaS Foundation & Organization Control

Configure the multi-tenant core, Super-Admin capabilities, and the granular permissions system required for companies to operate independently.
**FRs covered:** FR1, FR2, FR3.

### Epic 2: Resource & Asset Management

Establish the master registries for vehicles and gas assets (cylinders), ensuring traceability and tracking driver safety certifications.
**FRs covered:** FR4, FR5, FR6, FR7.

### Epic 3: Customer Experience & Support Admin

Manage the customer database, delivery addresses, and the administrative side of technical support (FAQ, Terms, and conditions).
**FRs covered:** FR17, FR18, FR19.

### Epic 4: Order Lifecycle & Fulfillment

Implement the core workflow for order creation, bulk processing, and the dashboard summary for operators to manage daily sales.
**FRs covered:** FR10, FR12, FR16.
**Implementation Status:**

- `/dashboard/deliveries`: Vista de lista implementada con filtros y búsqueda.
- `/dashboard/deliveries/[id]`: Vista de detalle implementada con mapa y relaciones.

### Epic 5: Real-time Logistics & Fleet Monitoring

Enable live tracking of fleets on maps (OSM), intelligent proximity-based assignment, and push notification infrastructure for field communication.
**FRs covered:** FR11, FR20, FR21.

### Epic 6: Business Operations & Finance

Finalize administrative cycles with inventory reconciliation, billing (CFDI) requests, and exportable business intelligence reports.
**FRs covered:** FR8, FR22, FR23.

### Epic 7: Driver Route Execution (Mobile - Deferred)

Digitize the driver's fieldwork with offline capabilities, GPS validation for deliveries, payment collection, and signature capture.
**FRs covered:** FR9, FR13, FR14, FR15.

## Epic 1: SaaS Foundation & Organization Control

Configure the multi-tenant core, Super-Admin capabilities, and the granular permissions system required for companies to operate independently.

### Story 1.1: Initialization of T3 Turbo Monorepo

As a Developer,
I want to initialize the project using the T3 Turbo template,
So that I have a consistent structure for Web, Mobile, and shared API from day one.

**Acceptance Criteria:**

**Given** the project directory is empty
**When** I run the initialization command `npx create-turbo@latest -e https://github.com/t3-oss/create-t3-turbo`
**Then** the `apps/nextjs`, `packages/api`, `packages/db`, and `packages/ui` directories are created
**And** the project builds successfully using `npm run build` at the root.

### Story 1.2: Multi-tenant Database Schema

As a SuperAdmin,
I want a database structure that supports multiple organizations,
So that each company's data is isolated and manageable.

**Acceptance Criteria:**

**Given** the Prisma schema in `packages/db`
**When** I add the `Organization` and `User` models with a `tenant_id` relationship
**Then** I can run `prisma migrate dev` to create the tables in Supabase
**And** the `Organization` table includes fields for `name`, `subdomain`, and `subscription_status`.

### Story 1.3: Multi-tenancy Middleware & Auth

As a User,
I want the system to automatically identify my organization when I log in,
So that I only see data relevant to my company.

**Acceptance Criteria:**

**Given** a user is authenticated via Supabase Auth
**When** they access the Backoffice
**Then** the Next.js Middleware extracts the `organization_id` from the session/JWT
**And** all subsequent tRPC calls are automatically filtered by this ID using Postgres RLS policies.

### Story 1.4: SuperAdmin Organization Control

As a SuperAdmin,
I want to create, list, and manage the organizations (client companies) in the system,
So that I can onboard new customers to Gasera.

**Acceptance Criteria:**

**Given** I am logged in as a SuperAdmin
**When** I navigate to the "/admin/organizations" path
**Then** I can see a list of all registered organizations
**And** I can create a new organization with its respective details.

### Story 1.5: Role-Based Access Control (RBAC)

As an Administrator of an Organization,
I want to define specific roles for my team (Admin, Supervisor, Chofer),
So that everyone has access only to the tools they need.

**Acceptance Criteria:**

**Given** I am an Admin of my organization
**When** I manage users in the settings panel
**Then** I can assign one of the predefined roles (Admin, Supervisor, Chofer)
**And** the tRPC procedures validate these roles before executing sensitive actions.

### Story 1.6: Team Invitations Management

As an Admin,
I want to invite new members to my organization via email,
So that I can expand my administrative or supervisory team.

**Acceptance Criteria:**

**Given** I am an Admin
**When** I send an invitation to an email address
**Then** a tokenized invitation is created in the database
**And** the user receives an email to register and join my specific organization automatically.

## Epic 2: Resource & Asset Management

Establish the master registries for vehicles and gas assets (cylinders), ensuring traceability and tracking driver safety certifications.

### Story 2.1: Vehicle Master Registry

As an Admin,
I want to manage the fleet of vehicles (trucks),
So that I can assign them to routes based on their capacity.

**Acceptance Criteria:**

**Given** I am an Admin of an organization
**When** I navigate to the "Assets > Vehicles" section
**Then** I can create a new vehicle specifying its plates, model, and capacity (kg/m3)
**And** I can edit or deactivate existing vehicles in the fleet.

### Story 2.2: Asset Inventory with Serials (Traceability)

As a Supervisor,
I want to register gas assets individually using their serial numbers,
So that I can trace the history and location of each cylinder or tank.

**Acceptance Criteria:**

**Given** the inventory management panel
**When** I add a new gas asset
**Then** I must provide a unique serial number and its status (New, Used, Maintenance)
**And** the system prevents duplicate serials within the same organization.

### Story 2.3: Driver Safety & Certification Management

As an Admin,
I want to track the licenses and safety certifications of my drivers,
So that I ensure only qualified personnel are operating the fleet.

**Acceptance Criteria:**

**Given** a driver's profile in the system
**When** I upload a license or safety certificate
**Then** I must specify the expiration date
**And** the system displays a visual alert on the dashboard if any certification is expired or near expiration.

### Story 2.4: Daily Route Loading Registration

As a Supervisor,
I want to register the initial load of a vehicle before it starts its daily route,
So that I have an accurate record of the inventory leaving the plant.

**Acceptance Criteria:**

**Given** a vehicle assigned to a route today
**When** I register the "Initial Load"
**Then** I select the specific assets (by serial or quantity/type) being loaded
**And** the system updates the vehicle's current inventory status to "In Route".

## Epic 3: Customer Experience & Support Admin

Manage the customer database, delivery addresses, and the administrative side of technical support (FAQ, Terms, and conditions).

### Story 3.1: Customer CRM & Delivery Addresses

As an Admin,
I want to manage the database of customers and their multiple delivery locations,
So that I can quickly assign orders to the correct address.

**Acceptance Criteria:**

**Given** I am in the "Customers" management panel
**When** I create a new customer (Residential or Corporate)
**Then** I can add multiple addresses with their respective GPS coordinates (via OSM search)
**And** the system identifies the primary contact and billing details for each customer.

### Story 3.2: Technical Support Help Center (FAQ)

As an Admin,
I want to manage a list of Frequently Asked Questions (FAQ) and support contacts,
So that the mobile app users can resolve common issues independently.

**Acceptance Criteria:**

**Given** the "Support Admin" section in the Backoffice
**When** I add or edit an FAQ item (Category, Question, Answer)
**Then** the changes are immediately available via the API for the mobile apps
**And** I can update the support phone number and email address globally.

### Story 3.3: Legal Info & App Versioning Management

As an Admin,
I want to manage the legal documents (Privacy Policy, Terms of Service) shown in the apps,
So that I remain compliant with data protection laws.

**Acceptance Criteria:**

**Given** the "Legal Settings" panel
**When** I update the text of the Privacy Policy or Terms of Service
**Then** the mobile apps prompt users to accept the new version upon their next login
**And** the system logs the timestamp and version accepted by each user.

## Epic 4: Order Lifecycle & Fulfillment

Implement the core workflow for order creation, bulk processing, and the dashboard summary for operators to manage daily sales.

### Story 4.1: Order Creation (Manual & Bulk)

As an Operator,
I want to create orders manually or upload them from a file,
So that I can quickly digitize customer requests.

**Acceptance Criteria:**

**Given** the "Orders" management panel
**When** I create a manual order
**Then** I must select a customer, service address, and the products/quantities
**And** when I upload a CSV/XLSX file, the system validates the format and imports all valid rows as "Pending" orders.

### Story 4.2: Order State Machine Logic

As a System,
I want to enforce a strict lifecycle for each order,
So that the status reflects the current stage of fulfillment accurately.

**Acceptance Criteria:**

**Given** an existing order
**When** a status change is triggered (Assign, Start, Deliver, Cancel)
**Then** the system validates that the transition is allowed (e.g., `Pending` -> `Assigned`)
**And** a timestamped entry is added to the order history for audit purposes.

### Story 4.3: Dispatch Logistics Kanban Board

As a Dispatcher,
I want a visual board to assign orders to vehicles,
So that I can organize the day's delivery schedule efficiently.

**Acceptance Criteria:**

**Given** a list of "Pending" orders and available vehicles
**When** I drag an order card and drop it into a vehicle's column
**Then** the order status changes to "Assigned" and is linked to that specific vehicle/driver
**And** the UI reflects the current load capacity of the vehicle based on assigned orders.

### Story 4.4: Operations Dashboard & Metrics

As an Admin,
I want a high-level summary of the day's operations,
So that I can identify bottleneck or urgent delivery needs at a glance.

**Acceptance Criteria:**

**Given** I am on the dashboard homepage
**When** the page loads
**Then** I see real-time counters for "Pending", "In Route", and "Delivered" orders
**And** a list of "Urgent" orders (near SLA limit) is prominently displayed.

## Epic 5: Real-time Logistics & Fleet Monitoring

Enable live tracking of fleets on maps (OSM), intelligent proximity-based assignment, and push notification infrastructure for field communication.

### Story 5.1: Real-time Fleet Map View (OSM)

As a Dispatcher,
I want to see the live location of all vehicles and their status on a map,
So that I can monitor the delivery progress in real-time.

**Status:** ✅ Implementado (Feb 2026)
**Implementation Details:**

- Componente `FleetMap.tsx` usando `react-leaflet`.
- Región por defecto: **Mazatlán, Sinaloa**.
- Marcadores dinámicos con estados (Movimiento/Estacionado/Offline).
- Integrado en `/dashboard/fleet`.

**Acceptance Criteria:**

**Given** the "Full Map" monitoring view
**When** vehicles are active and transmitting GPS coordinates
**Then** the map displays markers for each vehicle with distinct colors based on their status (Idle, In Route, Problem)
**And** clicking a marker shows a summary of the current order and driver details.

### Story 5.2: Proximity-Based Smart Assignment

As an Operator,
I want the system to suggest the closest vehicles when creating or managing an order,
So that I can assign deliveries to the most efficient resource.

**Acceptance Criteria:**

**Given** a "Pending" order with a geo-coded delivery address
**When** I use the "Assign" tool
**Then** the system calculates the distance to all active vehicles
**And** displays a ranked list of vehicles by proximity to the delivery point.

### Story 5.3: Push Notification & Messaging Infrastructure

As a System,
I want to send instant alerts to drivers' mobile devices,
So that they are immediately aware of new assignments or schedule changes.

**Acceptance Criteria:**

**Given** a change in an order's assignment or priority
**When** the event is triggered in the backend
**Then** the system sends a push notification (via Firebase/Expo) to the assigned driver's device
**And** the delivery status is updated in the driver's task list in real-time.

## Epic 6: Business Operations & Finance

Finalize administrative cycles with inventory reconciliation, billing (CFDI) requests, and exportable business intelligence reports.

### Story 6.1: End-of-Day Inventory Reconciliation

As a Supervisor,
I want to reconcile the vehicle's inventory at the end of a route,
So that I can detect any missing assets or gas discrepancies.

**Acceptance Criteria:**

**Given** a vehicle returning from its route
**When** the supervisor enters the "Return Load" (assets returned full/empty)
**Then** the system compares `Initial Load` vs `Delivered Orders` vs `Returned Load`
**And** flags any discrepancy or missing serial number for immediate investigation.

### Story 6.2: Billing & CFDI Request Management

As an Admin,
I want to manage customer billing requests,
So that I can facilitate the issuance of tax-compliant invoices (CFDI).

**Acceptance Criteria:**

**Given** a delivered order with a "Billing Requested" status
**When** the administrator reviews the customer's fiscal data in the Backoffice
**Then** they can validate the request and mark the invoice as "Issued" (uploading the PDF/XML if manual)
**And** the customer is notified of the completed billing process.

### Story 6.3: Administrative BI & Exportable Reports

As an Owner/Manager,
I want to generate performance and sales reports,
So that I can make data-driven decisions for the business.

**Acceptance Criteria:**

**Given** the "Reports" section
**When** I select a date range and report type (Sales by Product, Driver Performance, Inventory Turn)
**Then** the system generates a dynamic table with the results
**And** I can export the data in PDF or CSV format for external processing.

## Epic 7: Driver Route Execution (Mobile - Deferred)

Digitize the driver's fieldwork with offline capabilities, GPS validation for deliveries, payment collection, and signature capture.

### Story 7.1: Route Delivery with GPS Validation

As a Driver,
I want to register an order delivery only when I am at the customer's location,
So that I can provide proof of service and prevent fraud.

**Acceptance Criteria:**

**Given** the "My Route" view in the mobile app
**When** I attempt to mark an order as "Delivered"
**Then** the app checks my current GPS coordinates against the service address
**And** it only allows the registration if I am within a 100-meter radius (configurable per tenant).

### Story 7.2: Payment Collection & Digital Signature

As a Driver,
I want to record the payment and capture the customer's signature upon delivery,
So that I have a legally and financially valid proof of delivery.

**Acceptance Criteria:**

**Given** the delivery completion screen
**When** the user indicates the payment method (Cash/Digital)
**Then** they can proceed to a signature pad on the screen for the customer to sign
**And** both the payment record and the image of the signature are saved and linked to the order.

### Story 7.3: Offline-First Data Synchronization

As a Driver,
I want to continue using the app even without an active internet connection,
So that I can complete my deliveries in remote areas without interruption.

**Acceptance Criteria:**

**Given** the app is in an area with no signal
**When** I perform delivery actions (Register Delivery, Report Incident)
**Then** the data is saved in the local device storage
**And** as soon as the signal is restored, the app automatically syncs all pending records with the server.

### Story 7.4: Route Incident & Leak Reporting

As a Driver,
I want to report hazards or inventory issues immediately from the field,
So that the headquarters can take quick action.

**Acceptance Criteria:**

**Given** an active route
**When** I use the "Report Incident" feature
**Then** I can select a category (Leak, Vehicle Issue, Customer Absent) and add a photo/description
**And** an urgent notification is sent to the supervisor's dashboard in real-time.
