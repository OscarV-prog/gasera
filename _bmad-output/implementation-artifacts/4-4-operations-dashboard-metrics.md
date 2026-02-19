# Story 4.4: Operations Dashboard & Metrics

As an Admin,
I want a high-level summary of the day's operations,
So that I can identify bottlenecks or urgent delivery needs at a glance.

## Acceptance Criteria

- **Given** I am on the dashboard homepage (/dashboard)
- **When** the page loads
- **Then** I see real-time counters for:
  - Pending Orders
  - Assigned Orders
  - In Route Orders
  - Delivered Orders
- **And** I see a list of "Urgent" orders (High priority or near deadline).
- **And** I see a revenue summary for the day.

## Technical Tasks

- [ ] Update `apps/nextjs/src/app/(dashboard)/page.tsx`.
- [ ] Integrate with `api.orders.getDashboardMetrics` query.
- [ ] Add visual cards using Shadcn components.
- [ ] Implement responsive grid for metrics.
