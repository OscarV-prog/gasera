# Story 6.1: End-of-Day Inventory Reconciliation

As a Supervisor,
I want to reconcile the vehicle's inventory at the end of a route,
So that I can detect any missing assets or gas discrepancies.

## Acceptance Criteria

- **Given** I am in the "Operations > Reconciliation" panel
- **When** a vehicle returns and I enter the returned assets (Full/Empty/Damaged)
- **Then** the system calculates: (Initial Load) - (Delivered) - (Returned) = (Discrepancy).
- **And** if Discrepancy != 0, a warning is shown and a "Discrepancy Report" is generated.
- **And** inventory levels in the plant are updated accordingly.

## Technical Tasks

- [ ] Create `apps/nextjs/src/app/(dashboard)/operations/reconciliation/page.tsx`.
- [ ] Implement multi-step form for returning assets.
- [ ] Integrate with `api.operations.reconcile` (or equivalent).
- [ ] Add logic to update `Asset` status to "In Stock".
