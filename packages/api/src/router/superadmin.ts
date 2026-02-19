import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { superadminProcedure } from "../trpc";
import { db } from "@acme/db/client";
import { organizations, auditLogs } from "@acme/db/schema";
import { desc, eq, ilike, and, or } from "@acme/db";

export const SUBSCRIPTION_PLANS = {
  free: { name: "Free", price: 0, maxUsers: 5, maxVehicles: 2 },
  starter: { name: "Starter", price: 99, maxUsers: 20, maxVehicles: 10 },
  professional: { name: "Professional", price: 299, maxUsers: 50, maxVehicles: 25 },
  enterprise: { name: "Enterprise", price: null, maxUsers: -1, maxVehicles: -1 },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export const superadminRouter = {
  listOrganizations: superadminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
        search: z.string().optional(),
        status: z.enum(["active", "suspended", "cancelled", "past_due", "all"]).optional(),
        plan: z.enum(["free", "starter", "professional", "enterprise"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor, search, status, plan } = input;

      const conditions = [];
      if (search) {
        conditions.push(
          or(
            ilike(organizations.name, `%${search}%`),
            ilike(organizations.subdomain, `%${search}%`)
          )
        );
      }
      if (status && status !== "all") {
        conditions.push(eq(organizations.subscriptionStatus, status));
      }
      if (plan) {
        conditions.push(eq(organizations.subscriptionPlan, plan));
      }

      const items = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          subdomain: organizations.subdomain,
          contactEmail: organizations.contactEmail,
          subscriptionPlan: organizations.subscriptionPlan,
          subscriptionStatus: organizations.subscriptionStatus,
          createdAt: organizations.createdAt,
          updatedAt: organizations.updatedAt,
        })
        .from(organizations)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limit + 1)
        .orderBy(desc(organizations.createdAt));

      let nextCursor: typeof cursor = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
    }),

  getOrganization: superadminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const org = await db.query.organizations.findFirst({
        where: (org, { eq }) => eq(org.id, input.id),
      });
      if (!org) throw new Error("Organization not found");
      return org;
    }),

  createOrganization: superadminProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        subdomain: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
        contactEmail: z.string().email(),
        contactPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db.query.organizations.findFirst({
        where: (org, { eq }) => eq(org.subdomain, input.subdomain),
      });
      if (existing) throw new Error("Subdomain already exists");

      await db.insert(organizations).values({
        id: crypto.randomUUID(),
        name: input.name,
        subdomain: input.subdomain,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone ?? null,
        maxUsers: "5",
        maxVehicles: "2",
        subscriptionPlan: "free",
        subscriptionStatus: "active",
      });
      return { success: true };
    }),

  updateOrganization: superadminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).max(100).optional(),
        subdomain: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await db
        .update(organizations)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(organizations.id, id));
      return { success: true };
    }),

  toggleOrganizationStatus: superadminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["active", "suspended"]),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(organizations)
        .set({ subscriptionStatus: input.status, updatedAt: new Date() })
        .where(eq(organizations.id, input.id));
      return { success: true };
    }),

  deleteOrganization: superadminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(organizations).where(eq(organizations.id, input.id));
      return { success: true };
    }),

  assignSubscription: superadminProcedure
    .input(
      z.object({
        organizationId: z.string(),
        plan: z.enum(["free", "starter", "professional", "enterprise"]),
        durationMonths: z.number().min(1).max(12).default(1),
      })
    )
    .mutation(async ({ input }) => {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + input.durationMonths);
      const planConfig = SUBSCRIPTION_PLANS[input.plan];

      await db
        .update(organizations)
        .set({
          subscriptionPlan: input.plan,
          subscriptionStatus: "active",
          subscriptionExpiresAt: expiresAt,
          maxUsers: String(planConfig.maxUsers),
          maxVehicles: String(planConfig.maxVehicles),
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, input.organizationId));

      return { success: true };
    }),

  listPlans: superadminProcedure.query(async () => {
    return Object.entries(SUBSCRIPTION_PLANS).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }),

  listAuditLogs: superadminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        entityType: z.string().optional(),
        actorId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor, entityType, actorId } = input;
      const conditions = [];
      if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
      if (actorId) conditions.push(eq(auditLogs.actorId, actorId));

      const logs = await db
        .select()
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limit + 1)
        .orderBy(desc(auditLogs.createdAt));

      let nextCursor: typeof cursor = undefined;
      if (logs.length > limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem!.id;
      }

      return { items: logs, nextCursor };
    }),
} satisfies TRPCRouterRecord;

