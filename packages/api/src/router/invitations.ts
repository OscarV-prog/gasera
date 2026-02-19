import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@acme/db";
import { db } from "@acme/db/client";
import { invitations, user } from "@acme/db/schema";

import { adminProcedure, protectedProcedure } from "../trpc";

/**
 * Invitation token helper
 */
function generateInviteToken(): string {
  return crypto.randomUUID() + "-" + crypto.randomUUID().slice(0, 8);
}

/**
 * Email service (mock for now)
 */
async function sendInvitationEmail(
  email: string,
  token: string,
  organizationName: string,
  role: string,
) {
  // TODO: Integrate with real email provider (Resend, SendGrid, etc.)
  console.log(`[Email] Sending invitation to ${email}`);
  console.log(`[Email] Organization: ${organizationName}`);
  console.log(`[Email] Role: ${role}`);
}

export const invitationsRouter = {
  /**
   * List all invitations for current organization
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    
    const orgId = ctx.session?.user?.tenantId;
    if (!orgId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must belong to an organization",
      });
    }

    const invs = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        status: invitations.status,
        createdAt: invitations.createdAt,
        expiresAt: invitations.expiresAt,
        invitedBy: invitations.invitedBy,
      })
      .from(invitations)
      .where(eq(invitations.organizationId, orgId))
      .orderBy(desc(invitations.createdAt));

    return invs;
  }),

  /**
   * List all team members for current organization
   */
  listMembers: protectedProcedure.query(async ({ ctx }) => {
    
    const orgId = ctx.session?.user?.tenantId;
    if (!orgId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must belong to an organization",
      });
    }

    const members = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.tenantId, orgId))
      .orderBy(desc(user.createdAt));

    return members;
  }),

  /**
   * Send a new invitation (admin only)
   */
  send: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["admin", "chofer", "cliente"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const orgId = ctx.session?.user?.tenantId;
      if (!orgId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must belong to an organization",
        });
      }

      // Check if user already exists in organization
      const existingUser = await db.query.user.findFirst({
        where: (u, { eq, and }) =>
          and(eq(u.email, input.email), eq(u.tenantId, orgId)),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists in this organization",
        });
      }

      // Check for pending invitation
      const existingInvite = await db.query.invitations.findFirst({
        where: (inv, { eq, and }) =>
          and(
            eq(inv.email, input.email),
            eq(inv.organizationId, orgId),
            eq(inv.status, "pending"),
          ),
      });

      if (existingInvite) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Pending invitation already exists for this email",
        });
      }

      // Create invitation
      const token = generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      await db.insert(invitations).values({
        id: crypto.randomUUID(),
        email: input.email,
        role: input.role,
        organizationId: orgId,
        invitedBy: ctx.session.user.id,
        token,
        expiresAt,
        status: "pending",
      });

      // Send email (mock)
      await sendInvitationEmail(input.email, token, "Organization", input.role);

      return { success: true };
    }),

  /**
   * Resend an invitation
   */
  resend: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const inv = await db.query.invitations.findFirst({
        where: (inv, { eq }) => eq(inv.id, input.id),
      });

      if (!inv) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (inv.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only resend pending invitations",
        });
      }

      // Generate new token
      const token = generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db
        .update(invitations)
        .set({
          token,
          expiresAt,
          createdAt: new Date(),
        })
        .where(eq(invitations.id, input.id));

      // Send email
      await sendInvitationEmail(inv.email, token, "Organization", inv.role);

      return { success: true };
    }),

  /**
   * Cancel an invitation
   */
  cancel: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .update(invitations)
        .set({ status: "cancelled" })
        .where(eq(invitations.id, input.id));

      return { success: true };
    }),

  /**
   * Accept an invitation (public - requires token)
   */
  accept: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const inv = await db.query.invitations.findFirst({
        where: (inv, { eq }) => eq(inv.token, input.token),
      });

      if (!inv) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid invitation token",
        });
      }

      if (inv.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invitation has already been ${inv.status}`,
        });
      }

      if (inv.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      
      const currentOrgId = ctx.session.user.tenantId;
      if (currentOrgId && currentOrgId !== inv.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You already belong to another organization",
        });
      }

      // Update user with organization and role
      await db
        .update(user)
        .set({
          tenantId: inv.organizationId,
          role: inv.role,
        })
        .where(eq(user.id, ctx.session.user.id));

      // Mark invitation as accepted
      await db
        .update(invitations)
        .set({
          status: "accepted",
          acceptedAt: new Date(),
        })
        .where(eq(invitations.id, inv.id));

      return { success: true };
    }),

  /**
   * Remove a team member (admin only)
   */
  removeMember: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      
      const orgId = ctx.session?.user?.tenantId;
      if (!orgId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must belong to an organization",
        });
      }

      // Cannot remove yourself
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot remove yourself",
        });
      }

      // Remove user from organization
      await db
        .update(user)
        .set({
          tenantId: null,
          role: "cliente",
        })
        .where(and(eq(user.id, input.userId), eq(user.tenantId, orgId)));

      return { success: true };
    }),

  /**
   * Update member role (admin only)
   */
  updateMemberRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["admin", "chofer", "cliente"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const orgId = ctx.session?.user?.tenantId;
      if (!orgId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must belong to an organization",
        });
      }

      // Cannot demote yourself if you're the only admin
      if (input.userId === ctx.session.user.id && input.role !== "admin") {
        const adminCount = await db.$count(
          user,
          and(eq(user.tenantId, orgId), eq(user.role, "admin")),
        );
        if (adminCount <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot demote the only admin",
          });
        }
      }

      await db
        .update(user)
        .set({ role: input.role })
        .where(and(eq(user.id, input.userId), eq(user.tenantId, orgId)));

      return { success: true };
    }),

  /**
   * Get invitation by token (public - for invite page)
   */
  getByToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const inv = await db.query.invitations.findFirst({
        where: (inv, { eq }) => eq(inv.token, input.token),
      });

      if (inv?.status !== "pending" || inv.expiresAt < new Date()) {
        return null;
      }

      return {
        email: inv.email,
        role: inv.role,
        organizationId: inv.organizationId,
      };
    }),
} satisfies TRPCRouterRecord;

