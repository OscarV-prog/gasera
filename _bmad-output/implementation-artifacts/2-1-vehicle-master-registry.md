# Story 2.1: Vehicle Master Registry

Status: in-progress

## Story

As an Admin,
I want to register and manage all vehicles in my organization,
So that I can track fleet inventory, capacity, and assign drivers.

## Acceptance Criteria

1. **Given** I am logged in as an Admin
2. **When** I navigate to Settings → Vehicles
3. **Then** I can:
   - See a list of all registered vehicles with:
     - License plate
     - Vehicle type (truck, van, etc.)
     - Capacity (weight and volume)
     - Status (active, maintenance, retired)
     - Assigned driver (if any)
   - Add new vehicles with details:
     - License plate (unique per organization)
     - Vehicle type
     - Brand and model
     - Year
     - VIN number
     - Capacity (weight in kg, volume in liters)
     - Fuel type
     - Registration expiry date
     - Insurance expiry date
4. **And** vehicle capacity is validated against order requirements
5. **And** vehicles are scoped to the organization (tenant isolation)

## Tasks / Subtasks

### 1. Database Schema Extensions

- [ ] Create `vehicles` table in `packages/db/src/schema.ts`
- [ ] Add vehicle types enum
- [ ] Add vehicle status enum
- [ ] Add vehicle capacity tracking

### 2. API Router - Vehicles

- [ ] Create `packages/api/src/router/vehicles.ts`
- [ ] Implement `listVehicles` procedure (admin)
- [ ] Implement `getVehicle` procedure
- [ ] Implement `createVehicle` procedure (admin)
- [ ] Implement `updateVehicle` procedure (admin)
- [ ] Implement `deleteVehicle` procedure (admin)
- [ ] Implement `assignDriver` procedure (admin)
- [ ] Implement `unassignDriver` procedure (admin)

### 3. Vehicle Capacity Validation

- [ ] Create capacity calculation helpers
- [ ] Validate vehicle capacity against order weight
- [ ] Track vehicle utilization metrics

### 4. Frontend - Vehicle Management UI

- [ ] Create `apps/nextjs/src/app/(dashboard)/settings/vehicles/page.tsx`
- [ ] Create vehicles table component
- [ ] Create add/edit vehicle form
- [ ] Create vehicle detail view

## Implementation Details

### Vehicle Schema

```typescript
// vehicles table
- id: string (UUID)
- tenantId: string (FK to organization)
- licensePlate: string (unique per tenant)
- vehicleType: enum (truck, van, pickup, motorcycle)
- brand: string
- model: string
- year: number
- vin: string (VIN number)
- capacityWeight: number (kg)
- capacityVolume: number (liters)
- fuelType: enum (gasoline, diesel, electric, hybrid)
- status: enum (active, maintenance, retired)
- assignedDriverId: string (FK to user, nullable)
- registrationExpiry: date
- insuranceExpiry: date
- notes: text
- createdAt: timestamp
- updatedAt: timestamp
```

### Vehicle Types

```typescript
VEHICLE_TYPES = {
  truck: { name: "Camión", capacityWeight: 15000, capacityVolume: 30000 },
  van: { name: "Van", capacityWeight: 3000, capacityVolume: 8000 },
  pickup: { name: "Pickup", capacityWeight: 1000, capacityVolume: 2000 },
  motorcycle: { name: "Motocicleta", capacityWeight: 100, capacityVolume: 200 },
}
```

## Files Created/Modified

### Backend
- `packages/api/src/router/vehicles.ts` (new)
- `packages/db/src/schema.ts` (updated)

### Frontend
- `apps/nextjs/src/app/(dashboard)/settings/vehicles/page.tsx` (new)
- `apps/nextjs/src/components/vehicles/*` (new components)

## Testing Strategy

### Unit Tests
- [ ] Vehicle creation validation
- [ ] Capacity calculation
- [ ] Driver assignment logic

### Integration Tests
- [ ] Full CRUD workflow for vehicles
- [ ] Vehicle-driver assignment
- [ ] Tenant isolation enforcement

### Manual Testing
- [ ] Vehicle creation with all fields
- [ ] License plate uniqueness validation
- [ ] Driver assignment and unassignment
- [ ] Vehicle status changes
