# Story 4.1: Order Creation (Manual & Bulk)

As an Operator,
I want to create orders manually or upload them from a file,
So that I can quickly digitize customer requests.

## Acceptance Criteria

### Manual Creation

- **Given** I am in the "Orders" management panel
- **When** I click "New Order"
- **Then** I am presented with a form to select a Customer, Address, Requested Date, and Priority.
- **And** I can add multiple Order Items (Product Type, Subtype, Quantity, Unit Price).
- **And** the system automatically calculates Subtotal, Tax (16%), and Total.
- **And** upon submission, the order is created with "Pending" status.

### Bulk Creation (Optional for now, but planned)

- **When** I upload a CSV/XLSX file
- **Then** the system validates the format and imports valid rows.

## Technical Tasks

- [ ] Create `apps/nextjs/src/app/(dashboard)/orders/new/page.tsx`.
- [ ] Implement form logic using Zod and React Hook Form.
- [ ] Integrate with `api.orders.create` mutation.
- [ ] Add toast notifications for success/error.
