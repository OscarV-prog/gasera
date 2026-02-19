# Story 1.2: Multi-tenant Database Schema

Status: done

## Story

As a SuperAdmin,
I want a database structure that supports multiple organizations,
So that each company's data is isolated and manageable.

## Acceptance Criteria

1. **Given** the Drizzle schema in `packages/db`
2. **When** I add the `organizations` table and update `user` and `Post` models with a `tenantId` relationship
3. **Then** the project builds successfully, validating the schema changes
4. **And** the `organizations` table includes fields for `name`, `subdomain`, and `subscriptionStatus`.

## Tasks / Subtasks

- [x] Schema Implementation
  - [x] Define `organizations` table in `schema.ts`.
  - [x] Add `tenantId` to `Post` table.
  - [x] Add `tenantId` and `role` (enum) to `user` table in `auth-schema.ts`.
- [x] Build Verification
  - [x] Run `pnpm run build -F @acme/db` to verify schema.
  - [x] Run full monorepo build to ensure no regressions.

## Dev Notes

- **Template Discrepancy**: The T3 Turbo template uses **Drizzle ORM** instead of Prisma. Schema changes were performed in `.ts` files rather than `.prisma`.
- **Enums**: Introduced `roleEnum` for SuperAdmin, Admin, Chofer, and Cliente.
- **Isolation**: Every multi-tenant entity now requires a `tenantId`.

## Dev Agent Record

### Agent Model Used
Antigravity (Google Deepmind)

### Debug Log References
- Fixed missing `text` and `timestamp` imports in `schema.ts`.
- Verified build compatibility with Next.js environment validation.

### Completion Notes List
- Organizations table is ready for onboarding.
- User table supports roles and tenancy.
- Infrastructure established for RLS (to be implemented in 1.3).
