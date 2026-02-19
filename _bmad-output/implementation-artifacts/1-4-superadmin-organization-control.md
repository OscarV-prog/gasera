# Story 1.4: Superadmin Organization Control

Status: in-progress

## Story

As a SuperAdmin,
I want a dashboard to manage all organizations, their subscriptions, and configurations,
So that I can oversee the entire platform and manage tenant-level settings.

## Acceptance Criteria

1. **Given** I am logged in as a SuperAdmin
2. **When** I access `/superadmin` or `/admin/organizations`
3. **Then** I see a list of all organizations with:
   - Organization name and subdomain
   - Subscription status (active, suspended, cancelled)
   - User count and plan type
   - Created and last activity dates
4. **And** I can perform CRUD operations on organizations:
   - Create new organization
   - Edit organization details
   - Suspend/activate organization
   - Delete organization (with safety check)
5. **And** I can manage subscription plans per organization

## Tasks / Subtasks

### 1. Database Schema Extensions

- [ ] Add subscription plans enum in `packages/db/src/schema.ts`
- [ ] Add subscription fields to organizations table
- [ ] Create audit log table for superadmin actions

### 2. API Router - Organizations

- [ ] Create `packages/api/src/routers/superadmin.ts`
- [ ] Implement `listOrganizations` procedure
- [ ] Implement `getOrganization` procedure
- [ ] Implement `createOrganization` procedure
- [ ] Implement `updateOrganization` procedure
- [ ] Implement `suspendOrganization` procedure
- [ ] Implement `deleteOrganization` procedure

### 3. API Router - Subscriptions

- [ ] Create `packages/api/src/routers/subscriptions.ts`
- [ ] Implement `listPlans` procedure
- [ ] Implement `assignPlan` procedure
- [ ] Implement `cancelSubscription` procedure

### 4. API Router - Audit Logs

- [ ] Create `packages/api/src/routers/audit.ts`
- [ ] Implement `listAuditLogs` procedure
- [ ] Create audit log middleware

### 5. Frontend - Superadmin Dashboard

- [ ] Create `apps/nextjs/src/app/(dashboard)/superadmin/page.tsx`
- [ ] Create organizations table component
- [ ] Create organization detail modal/page
- [ ] Create subscription management component

### 6. Frontend - API Client

- [ ] Create `apps/nextjs/src/lib/superadmin.ts` API client
- [ ] Type-safe API calls to superadmin router

## Implementation Details

### Subscription Plans

```typescript
const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    maxUsers: 5,
    maxVehicles: 2,
    features: ["basic_delivery", "inventory_basic"],
  },
  STARTER: {
    name: "Starter",
    price: 99,
    maxUsers: 20,
    maxVehicles: 10,
    features: ["basic_delivery", "inventory_basic", "reports_basic"],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 299,
    maxUsers: 50,
    maxVehicles: 25,
    features: ["basic_delivery", "inventory_advanced", "reports_advanced", "api_access"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: null, // Custom
    maxUsers: -1, // Unlimited
    maxVehicles: -1,
    features: ["all", "dedicated_support", "custom_integrations"],
  },
} as const;
```

### Superadmin Router Structure

```typescript
// packages/api/src/routers/superadmin.ts
export const superadminRouter = createTRPCRouter({
  organizations: createProtectedRouter({
    list: protectedProcedure.query(...),
    get: superadminProcedure.query(...),
    create: superadminProcedure.mutation(...),
    update: superadminProcedure.mutation(...),
    suspend: superadminProcedure.mutation(...),
    delete: superadminProcedure.mutation(...),
  }),
  subscriptions: createProtectedRouter({
    listPlans: protectedProcedure.query(...),
    assign: superadminProcedure.mutation(...),
  }),
  audit: createProtectedRouter({
    list: superadminProcedure.query(...),
  }),
});
```

## Files Created/Modified

### Backend
- `packages/api/src/routers/superadmin.ts` (new)
- `packages/api/src/routers/subscriptions.ts` (new)
- `packages/api/src/routers/audit.ts` (new)
- `packages/db/src/schema.ts` (updated)
- `apps/nextjs/src/app/(dashboard)/superadmin/page.tsx` (new)

### Frontend
- `apps/nextjs/src/app/(dashboard)/superadmin/ OrganizationsTable.tsx` (new)
- `apps/nextjs/src/app/(dashboard)/superadmin/CreateOrgModal.tsx` (new)
- `apps/nextjs/src/lib/superadmin.ts` (new)

## Testing Strategy

### Unit Tests
- [ ] Router validation with Zod schemas
- [ ] Permission checks (superadmin only)
- [ ] Subscription plan assignment logic

### Integration Tests
- [ ] Full CRUD workflow for organizations
- [ ] Subscription plan changes
- [ ] Audit log creation

### Manual Testing
- [ ] Superadmin dashboard loads all organizations
- [ ] Organization creation with validation
- [ ] Subscription plan assignment
- [ ] Organization suspension/resumption
