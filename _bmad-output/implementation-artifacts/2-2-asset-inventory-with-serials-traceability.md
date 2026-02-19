# Story 2.2: Asset Inventory with Serials Traceability

Status: in-progress

## Story

As an Admin,
I want to track all gas cylinders and tanks with unique serial numbers,
So that I can trace their location, maintenance history, and ownership throughout their lifecycle.

## Acceptance Criteria

1. **Given** I am logged in as an Admin
2. **When** I navigate to Settings → Assets
3. **Then** I can:
   - See a list of all assets (cylinders/tanks) with:
     - Serial number (unique per tenant)
     - Asset type (cylinder, tank)
     - Capacity (kg or liters)
     - Current status (in_stock, in_route, delivered, maintenance, retired)
     - Current location/owner
     - Last inspection date
   - Register new assets with details:
     - Serial number (barcode/QR ready)
     - Asset type and subtype
     - Manufacturing date
     - Capacity and dimensions
     - Current status
     - Purchase price and date
4. **And** each asset has a complete history log:
   - Creation
   - Status changes
   - Location changes
   - Maintenance records
   - Inspections
5. **And** assets are scoped to the organization (tenant isolation)

## Tasks / Subtasks

### 1. Database Schema Extensions

- [ ] Create `assets` table in `packages/db/src/schema.ts`
- [ ] Create `asset_history` table for traceability
- [ ] Add asset types enum
- [ ] Add asset status enum
- [ ] Add asset movement types

### 2. API Router - Assets

- [ ] Create `packages/api/src/router/assets.ts`
- [ ] Implement `listAssets` procedure (admin)
- [ ] Implement `getAsset` procedure
- [ ] Implement `createAsset` procedure (admin)
- [ ] Implement `updateAsset` procedure (admin)
- [ ] Implement `getAssetHistory` procedure
- [ ] Implement `recordMovement` procedure

### 3. Asset Serial Generation

- [ ] Create serial number generator
- [ ] Generate QR/barcode compatible serials
- [ ] Validate unique serials per tenant

### 4. Frontend - Asset Management UI

- [ ] Create `apps/nextjs/src/app/(dashboard)/settings/assets/page.tsx`
- [ ] Create assets table component
- [ ] Create asset detail view with history timeline
- [ ] Create asset registration form

## Implementation Details

### Asset Schema

```typescript
// assets table
- id: string (UUID)
- tenantId: string (FK to organization)
- serialNumber: string (unique per tenant)
- assetType: enum (cylinder, tank)
- subtype: string (e.g., "20kg_cylinder", "1000L_tank")
- capacity: number (kg or liters)
- status: enum (in_stock, in_route, delivered, maintenance, retired)
- currentOwnerId: string (FK to user - driver or customer)
- currentOwnerType: enum (driver, customer)
- location: text
- manufacturingDate: date
- purchaseDate: date
- purchasePrice: number
- lastInspectionDate: date
- nextInspectionDate: date
- weightEmpty: number (tare weight)
- notes: text
- createdAt: timestamp
- updatedAt: timestamp
```

### Asset History Schema

```typescript
// asset_history table
- id: string (UUID)
- assetId: string (FK to assets)
- action: enum (created, status_changed, location_changed, assigned, returned, inspection, maintenance, retired)
- previousValue: text
- newValue: text
- performedBy: string (FK to user)
- notes: text
- createdAt: timestamp
```

## Files Created/Modified

### Backend
- `packages/api/src/router/assets.ts` (new)
- `packages/db/src/schema.ts` (updated)

### Frontend
- `apps/nextjs/src/app/(dashboard)/settings/assets/page.tsx` (new)
- `apps/nextjs/src/components/assets/*` (new components)

## Testing Strategy

### Unit Tests
- [ ] Asset creation with unique serial validation
- [ ] Serial number generation
- [ ] History recording on status changes

### Integration Tests
- [ ] Full asset lifecycle workflow
- [ ] Asset assignment to drivers
- [ ] Asset return process

### Manual Testing
- [ ] Asset creation with all fields
- [ ] QR code generation and scanning
- [ ] Asset history timeline display
- [ ] Status change workflow
