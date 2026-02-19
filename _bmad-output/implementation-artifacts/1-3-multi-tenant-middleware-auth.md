# Story 1.3: Multi-tenancy Middleware & Auth

Status: in-progress

## Story

As a SuperAdmin,
I want a middleware that enforces tenant isolation and validates user roles,
So that each organization can only access their own data and users have appropriate permissions.

## Acceptance Criteria

1. **Given** the Next.js middleware and tRPC context
2. **When** a user accesses any protected route
3. **Then** the middleware validates:
   - User is authenticated (session exists)
   - User has a valid tenant_id
   - User has a valid role (superadmin, admin, chofer, cliente)
4. **And** tRPC procedures automatically filter queries by tenant_id
5. **And** superadmin routes bypass tenant isolation

## Tasks / Subtasks

### 1. Middleware Enhancement

- [ ] Update `apps/nextjs/src/middleware.ts` to:
  - Extract and validate tenant_id from session
  - Add tenant-based route protection
  - Handle subdomain-based tenant resolution

### 2. tRPC Tenant Context

- [ ] Create tenant context middleware in `packages/api/src/trpc.ts`
- [ ] Add `tenantProcedure` for tenant-scoped operations
- [ ] Add `superadminProcedure` for superadmin-only operations

### 3. Database Tenant Guards

- [ ] Create tenant guard helpers in `packages/db/src/guards.ts`
- [ ] Add tenant_id validation to all queries
- [ ] Implement RLS-ready query helpers

### 4. Role-based Access Control

- [ ] Create role validation utilities in `packages/api/src/rbac.ts`
- [ ] Define role permissions matrix
- [ ] Add role middleware to tRPC procedures

## Implementation Details

### Middleware Logic

```typescript
// middleware.ts flow
1. Check session cookie exists
2. Extract user session data (including tenantId and role)
3. Validate tenant exists and is active
4. Check role-based route access
5. Redirect or allow based on validation
```

### tRPC Tenant Procedures

```typescript
// protectedProcedure already includes tenantId from context
// New procedures:
- tenantProcedure: Scoped to user's tenant
- superadminProcedure: Only for superadmin role
```

## Dev Notes

- Uses existing Better-Auth session for authentication
- Tenant isolation enforced at application level (RLS at database level to be added)
- Role enum: ["superadmin", "admin", "chofer", "cliente"]

## Files Modified

- `apps/nextjs/src/middleware.ts`
- `packages/api/src/trpc.ts`
- `packages/api/src/rbac.ts` (new)
- `packages/db/src/guards.ts` (new)

## Testing Strategy

- Unit tests for middleware redirects
- Integration tests for tenant isolation
- Manual testing of role-based access
