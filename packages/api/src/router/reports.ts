import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, ilike, or, sql } from "@acme/db";
import { db } from "@acme/db/client";
import { customerReports, driverReports } from "@acme/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const reportsRouter = createTRPCRouter({
  // ============================================================================
  // CUSTOMER REPORTS
  // ============================================================================

  listCustomerReports: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        status: z.string().optional(),
        priority: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) return { data: [], total: 0 };

      const conditions = [eq(customerReports.tenantId, tenantId)];

      if (input.status && input.status !== "all")
        conditions.push(eq(customerReports.status, input.status));
      if (input.priority && input.priority !== "all")
        conditions.push(eq(customerReports.priority, input.priority));
      if (input.search) {
        conditions.push(
          or(
            ilike(customerReports.reportNumber, `%${input.search}%`),
            ilike(customerReports.subject, `%${input.search}%`),
          )!,
        );
      }

      const items = await db
        .select()
        .from(customerReports)
        .where(and(...conditions))
        .limit(input.limit)
        .orderBy(desc(customerReports.createdAt));

      // Get count
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(customerReports)
        .where(and(...conditions));

      return {
        data: items,
        total: Number(totalResult?.count ?? 0),
      };
    }),

  getCustomerReport: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const report = await db.query.customerReports.findFirst({
        where: (reports, { eq, and }) =>
          and(eq(reports.id, input.id), eq(reports.tenantId, tenantId)),
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      return report;
    }),

  createCustomerReport: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        category: z.string(),
        subject: z.string(),
        description: z.string().optional(),
        priority: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const reportNumber = `REP-CUST-${Date.now()}`;
      const id = crypto.randomUUID();

      await db.insert(customerReports).values({
        id,
        tenantId,
        reportNumber,
        ...input,
        status: "pending",
      });

      return { id };
    }),

  updateCustomerReportStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .update(customerReports)
        .set({
          status: input.status,
          resolvedAt: input.status === "resolved" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(customerReports.id, input.id),
            eq(customerReports.tenantId, tenantId),
          ),
        );

      return { success: true };
    }),

  // ============================================================================
  // DRIVER REPORTS
  // ============================================================================

  listDriverReports: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        status: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) return { data: [], total: 0 };

      const conditions = [eq(driverReports.tenantId, tenantId)];

      if (input.status && input.status !== "all")
        conditions.push(eq(driverReports.status, input.status));

      if (input.search) {
        conditions.push(
          or(
            ilike(driverReports.reportNumber, `%${input.search}%`),
            ilike(driverReports.description, `%${input.search}%`),
          )!,
        );
      }

      const items = await db
        .select()
        .from(driverReports)
        .where(and(...conditions))
        .limit(input.limit)
        .orderBy(desc(driverReports.createdAt));

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(driverReports)
        .where(and(...conditions));

      return {
        data: items,
        total: Number(totalResult?.count ?? 0),
      };
    }),

  getDriverReport: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const report = await db.query.driverReports.findFirst({
        where: (reports, { eq, and }) =>
          and(eq(reports.id, input.id), eq(reports.tenantId, tenantId)),
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      return report;
    }),

  createDriverReport: protectedProcedure
    .input(
      z.object({
        driverId: z.string(),
        unitId: z.string().optional(),
        issueType: z.string(),
        location: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const reportNumber = `REP-DRIV-${Date.now()}`;
      const id = crypto.randomUUID();

      await db.insert(driverReports).values({
        id,
        tenantId,
        reportNumber,
        ...input,
        status: "pending",
      });

      return { id };
    }),

  updateDriverReportStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .update(driverReports)
        .set({
          status: input.status,
          resolvedAt: input.status === "resolved" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(driverReports.id, input.id),
            eq(driverReports.tenantId, tenantId),
          ),
        );

      return { success: true };
    }),
});
