# Story 5.1: Real-time Fleet Map View (OSM)

As a Dispatcher,
I want to see the live location of all vehicles and their status on a map,
So that I can monitor the delivery progress in real-time.

## Acceptance Criteria

- **Given** the "Full Map" monitoring view (/dashboard/fleet)
- **When** vehicles are active and transmitting GPS coordinates
- **Then** the map displays markers for each vehicle (using OpenStreetMap).
- **And** markers are color-coded: Blue (In Route), Gray (Idle), Red (Problem).
- **And** clicking a marker shows a popup with Driver Name, Vehicle Plate, and Current Order #.

## Technical Tasks

- [ ] Create `apps/nextjs/src/app/(dashboard)/fleet/page.tsx`.
- [ ] Integrate Leaflet.js or Mapbox for OSM rendering.
- [ ] Integrate with `api.tracking.listActiveVehicles` (or equivalent).
- [ ] Implement live updates using Supabase Realtime subscriptions.
