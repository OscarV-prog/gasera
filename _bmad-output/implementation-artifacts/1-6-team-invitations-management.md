# Story 1.6: Team Invitations Management

Status: in-progress

## Story

As an Admin,
I want to invite team members to my organization with specific roles,
So that I can build my team and assign appropriate permissions.

## Acceptance Criteria

1. **Given** I am logged in as an Admin
2. **When** I navigate to Organization Settings → Team
3. **Then** I can:
   - See a list of current team members with their roles
   - Invite new members via email
   - Assign roles to invited members (Admin, Chofer, Cliente)
   - Resend or cancel pending invitations
   - Remove members from the organization
4. **And** invited users receive an email with:
   - Organization name
   - Assigned role
   - Link to accept invitation
5. **And** invited users can create an account (or link to existing)

## Tasks / Subtasks

### 1. Database Schema Extensions

- [ ] Create `invitations` table in `packages/db/src/schema.ts`
- [ ] Add invitation status enum (pending, accepted, expired, cancelled)
- [ ] Create invitation token for secure acceptance

### 2. API Router - Invitations

- [ ] Create `packages/api/src/router/invitations.ts`
- [ ] Implement `listInvitations` procedure
- [ ] Implement `sendInvitation` procedure (admin only)
- [ ] Implement `resendInvitation` procedure
- [ ] Implement `cancelInvitation` procedure
- [ ] Implement `acceptInvitation` procedure (public)
- [ ] Implement `listTeamMembers` procedure

### 3. API Router - Team Management

- [ ] Create `packages/api/src/router/team.ts`
- [ ] Implement `removeMember` procedure (admin only)
- [ ] Implement `updateMemberRole` procedure (admin only)
- [ ] Implement `getMemberCount` procedure

### 4. Email Service Integration

- [ ] Create `packages/api/src/services/email.ts`
- [ ] Implement invitation email template
- [ ] Implement email sending (mock or real provider)

### 5. Frontend - Team Management UI

- [ ] Create `apps/nextjs/src/app/(dashboard)/settings/team/page.tsx`
- [ ] Create team members table component
- [ ] Create invite member modal
- [ ] Create invitation list component

## Implementation Details

### Invitation Flow

```
1. Admin fills invite form (email + role)
2. System creates invitation record with token
3. System sends email to invitee
4. Invitee clicks link → /invite/:token
5. Invitee signs up or logs in
6. System creates user with assigned tenant_id and role
7. Invitation marked as accepted
```

### Invitation Schema

```typescript
// invitations table
- id: string (UUID)
- email: string (invitee email)
- role: roleEnum (admin, chofer, cliente)
- organizationId: string (FK to organizations)
- invitedBy: string (FK to user)
- status: enum (pending, accepted, expired, cancelled)
- token: string (unique invite token)
- expiresAt: timestamp
- createdAt: timestamp
- acceptedAt: timestamp (null until accepted)
```

## Files Created/Modified

### Backend
- `packages/api/src/router/invitations.ts` (new)
- `packages/api/src/router/team.ts` (new)
- `packages/api/src/services/email.ts` (new)
- `packages/db/src/schema.ts` (updated)

### Frontend
- `apps/nextjs/src/app/(dashboard)/settings/team/page.tsx` (new)
- `apps/nextjs/src/app/invite/[token]/page.tsx` (new)
- `apps/nextjs/src/components/team/*` (new components)

## Testing Strategy

### Unit Tests
- [ ] Invitation creation with validation
- [ ] Token generation and verification
- [ ] Role assignment logic

### Integration Tests
- [ ] Full invitation workflow
- [ ] Accept invitation creates user
- [ ] Admin-only actions enforcement

### Manual Testing
- [ ] Send invitation from admin panel
- [ ] Receive and accept invitation
- [ ] Verify user appears in team list
- [ ] Test invitation expiry
