import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, ilike, or, sql } from "@acme/db";
import { db } from "@acme/db/client";
import { drivers, vehicles } from "@acme/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const driversRouter = createTRPCRouter({
  /**
   * List drivers with pagination and search
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
        search: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.log("drivers.list: starting request", {
        input,
        userId: ctx.session.user.id,
      });
      try {
        const tenantId = ctx.session.user.tenantId;
        if (!tenantId) {
          console.log("drivers.list: No tenantId found");
          return { data: [], total: 0 };
        }

        const conditions = [eq(drivers.tenantId, tenantId)];

        if (input.search) {
          conditions.push(
            or(
              ilike(drivers.name, `%${input.search}%`),
              ilike(drivers.email, `%${input.search}%`),
              ilike(drivers.phone, `%${input.search}%`),
            )!,
          );
        }

        if (input.status && input.status !== "all") {
          conditions.push(eq(drivers.status, input.status));
        }

        const [total] = await db
          .select({ count: sql<number>`count(*)` })
          .from(drivers)
          .where(and(...conditions));

        const items = await db
          .select({
            id: drivers.id,
            tenantId: drivers.tenantId,
            name: drivers.name,
            email: drivers.email,
            phone: drivers.phone,
            licenseNumber: drivers.licenseNumber,
            assignedUnitId: drivers.assignedUnitId,
            status: drivers.status,
            createdAt: drivers.createdAt,
            updatedAt: drivers.updatedAt,
            vehicleLicensePlate: vehicles.licensePlate,
          })
          .from(drivers)
          .leftJoin(vehicles, eq(drivers.assignedUnitId, vehicles.id))
          .where(and(...conditions))
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(desc(drivers.createdAt));

        console.log("drivers.list: success, found", items.length, "drivers");
        return {
          data: items,
          total: Number(total?.count ?? 0),
        };
      } catch (error: any) {
        console.error("drivers.list error:", error);
        throw error;
      }
    }),

  /**
   * Get single driver by ID
   */
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const item = await db.query.drivers.findFirst({
        where: and(eq(drivers.id, input.id), eq(drivers.tenantId, tenantId)),
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chofer no encontrado",
        });
      }

      return item;
    }),

  /**
   * Create new driver
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        licenseNumber: z.string(),
        assignedUnitId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        console.error("[DRIVERS_ROUTER] No tenant ID found in session");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      console.log("[DRIVERS_ROUTER] Creating driver with data:", {
        ...input,
        tenantId,
      });
      const id = crypto.randomUUID();

      await db.insert(drivers).values({
        id,
        tenantId,
        ...input,
        status: "disconnected", // Default
        updatedAt: new Date(),
      });

      console.log("[DRIVERS_ROUTER] Successfully created driver:", id);
      return { success: true, id };
    }),

  /**
   * Update driver
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        licenseNumber: z.string().optional(),
        assignedUnitId: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;

      await db
        .update(drivers)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(drivers.id, id), eq(drivers.tenantId, tenantId)));

      return { success: true };
    }),

  /**
   * Delete driver
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .delete(drivers)
        .where(and(eq(drivers.id, input.id), eq(drivers.tenantId, tenantId)));

      return { success: true };
    }),
});
