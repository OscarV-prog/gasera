# Story 7.1: Route Delivery with GPS Validation (Backoffice Audit)

As an Admin,
I want to verify that deliveries were made at the correct location,
So that I can ensure operational quality.

## Acceptance Criteria

- **Given** an order marked as "Delivered"
- **When** I view the Order Detail page
- **Then** I can see the "Proof of Delivery" section.
- **And** it displays a map comparing the "Customer Address" vs the "Actual GPS Coordinate" recorded by the driver.
- **And** a banner indicates if the delivery was "Verified" (within radius) or "Flagged" (outside radius).

## Technical Tasks

- [ ] Update Order Detail page to include Audit Map.
- [ ] Implement distance calculation logic (Haversine formula).
- [ ] Integrate with `api.orders.getDeliveryProof`.
