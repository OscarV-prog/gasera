import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, gte, inArray, lte } from "@acme/db";
import { db } from "@acme/db/client";
import {
  assets,
  dailyLoadSummary,
  routeLoadItems,
  routeLoads,
} from "@acme/db/schema";

import {
  adminProcedure,
  protectedProcedure,
  supervisorProcedure,
} from "../trpc";

export const routeLoadsRouter = {
  /**
   * List all route loads for current organization
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        status: z
          .enum([
            "pending",
            "loading",
            "loaded",
            "dispatched",
            "in_progress",
            "completed",
            "cancelled",
            "all",
          ])
          .optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        vehicleId: z.string().optional(),
        driverId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) return { loads: [], nextCursor: undefined };
      const { limit, cursor, status, dateFrom, dateTo, vehicleId, driverId } =
        input;

      const conditions = [eq(routeLoads.tenantId, tenantId)];

      if (status && status !== "all") {
        conditions.push(eq(routeLoads.status, status));
      }
      if (dateFrom) {
        conditions.push(gte(routeLoads.loadDate, dateFrom));
      }
      if (dateTo) {
        conditions.push(lte(routeLoads.loadDate, dateTo));
      }
      if (vehicleId) {
        conditions.push(eq(routeLoads.vehicleId, vehicleId));
      }
      if (driverId) {
        conditions.push(eq(routeLoads.driverId, driverId));
      }

      const loads = await db
        .select({
          id: routeLoads.id,
          vehicleId: routeLoads.vehicleId,
          driverId: routeLoads.driverId,
          loadDate: routeLoads.loadDate,
          status: routeLoads.status,
          plannedDeliveries: routeLoads.plannedDeliveries,
          completedDeliveries: routeLoads.completedDeliveries,
          totalCylindersLoaded: routeLoads.totalCylindersLoaded,
          totalTanksLoaded: routeLoads.totalTanksLoaded,
          totalWeightLoaded: routeLoads.totalWeightLoaded,
          departureTime: routeLoads.departureTime,
          returnTime: routeLoads.returnTime,
          notes: routeLoads.notes,
          createdBy: routeLoads.createdBy,
          createdAt: routeLoads.createdAt,
        })
        .from(routeLoads)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limit + 1)
        .orderBy(desc(routeLoads.loadDate));

      let nextCursor: typeof cursor = undefined;
      if (loads.length > limit) {
        const nextItem = loads.pop();
        nextCursor = nextItem!.id;
      }

      return { loads, nextCursor };
    }),

  /**
   * Get route load details with items
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const load = await db.query.routeLoads.findFirst({
        where: (l, { eq, and }) =>
          and(eq(l.id, input.id), eq(l.tenantId, tenantId)),
      });

      if (!load) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Route load not found",
        });
      }

      const items = await db
        .select({
          id: routeLoadItems.id,
          itemType: routeLoadItems.itemType,
          assetType: routeLoadItems.assetType,
          subtype: routeLoadItems.subtype,
          quantity: routeLoadItems.quantity,
          serialNumbers: routeLoadItems.serialNumbers,
          weightPerUnit: routeLoadItems.weightPerUnit,
          totalWeight: routeLoadItems.totalWeight,
          notes: routeLoadItems.notes,
          createdAt: routeLoadItems.createdAt,
        })
        .from(routeLoadItems)
        .where(eq(routeLoadItems.routeLoadId, input.id));

      return { ...load, items };
    }),

  /**
   * Create new route load (supervisor/admin)
   */
  create: supervisorProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        driverId: z.string().optional(),
        loadDate: z.date().default(() => new Date()),
        plannedDeliveries: z.number().min(0).default(0),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must belong to an organization",
        });
      }

      const loadId = crypto.randomUUID();

      await db.insert(routeLoads).values({
        id: loadId,
        tenantId,
        ...input,
        status: "pending",
        createdBy: ctx.session.user.id,
      });

      return { success: true, id: loadId };
    }),

  /**
   * Register initial load for a vehicle
   */
  registerLoad: supervisorProcedure
    .input(
      z.object({
        routeLoadId: z.string(),
        items: z.array(
          z.object({
            itemType: z.enum(["by_serial", "by_quantity"]),
            assetType: z.enum(["cylinder", "tank"]).optional(),
            subtype: z.string().optional(),
            quantity: z.number().min(1),
            serialNumbers: z.array(z.string()).optional(),
            weightPerUnit: z.number().optional(),
            notes: z.string().optional(),
          }),
        ),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const load = await db.query.routeLoads.findFirst({
        where: (l, { eq, and }) =>
          and(eq(l.id, input.routeLoadId), eq(l.tenantId, tenantId)),
      });

      if (!load) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Route load not found",
        });
      }

      if (load.status !== "pending" && load.status !== "loading") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Cannot register load for a route that has already been dispatched",
        });
      }

      const loadItemRecords = [];
      let totalCylinders = 0;
      let totalTanks = 0;
      let totalWeight = 0;

      for (const item of input.items) {
        const itemId = crypto.randomUUID();
        const serialNumbers =
          item.itemType === "by_serial"
            ? JSON.stringify(item.serialNumbers)
            : null;
        const weightPerUnit =
          item.weightPerUnit || item.assetType === "cylinder" ? 20 : 1000; // Default weights
        const totalItemWeight = (item.quantity || 0) * weightPerUnit;

        if (item.assetType === "cylinder") {
          totalCylinders += item.quantity;
        } else if (item.assetType === "tank") {
          totalTanks += item.quantity;
        }
        totalWeight += totalItemWeight;

        loadItemRecords.push({
          id: itemId,
          tenantId,
          routeLoadId: input.routeLoadId,
          itemType: item.itemType,
          assetType: item.assetType,
          subtype: item.subtype,
          quantity: item.quantity,
          serialNumbers,
          weightPerUnit,
          totalWeight: totalItemWeight,
          notes: item.notes,
        });

        // Update asset status if loading by serial
        if (item.itemType === "by_serial" && item.serialNumbers) {
          await db
            .update(assets)
            .set({
              status: "in_route",
              currentOwnerId: load.vehicleId,
              currentOwnerType: "vehicle",
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(assets.tenantId, tenantId),
                inArray(assets.serialNumber, item.serialNumbers),
              ),
            );
        }
      }

      // Insert load items
      await db.insert(routeLoadItems).values(loadItemRecords);

      // Update route load status and totals
      const newStatus = load.status === "pending" ? "loading" : "loaded";

      await db
        .update(routeLoads)
        .set({
          status: newStatus,
          totalCylindersLoaded:
            (load.totalCylindersLoaded || 0) + totalCylinders,
          totalTanksLoaded: (load.totalTanksLoaded || 0) + totalTanks,
          totalWeightLoaded: (load.totalWeightLoaded || 0) + totalWeight,
          notes: input.notes || load.notes,
          updatedAt: new Date(),
        })
        .where(eq(routeLoads.id, input.routeLoadId));

      return {
        success: true,
        status: newStatus,
        totals: { totalCylinders, totalTanks, totalWeight },
      };
    }),

  /**
   * Dispatch vehicle (mark as dispatched)
   */
  dispatch: supervisorProcedure
    .input(
      z.object({
        routeLoadId: z.string(),
        departureTime: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const load = await db.query.routeLoads.findFirst({
        where: (l, { eq, and }) =>
          and(eq(l.id, input.routeLoadId), eq(l.tenantId, tenantId)),
      });

      if (!load) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Route load not found",
        });
      }

      if (load.status !== "loaded" && load.status !== "loading") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot dispatch a route that hasn't been loaded",
        });
      }

      await db
        .update(routeLoads)
        .set({
          status: "dispatched",
          departureTime: input.departureTime || new Date(),
          updatedAt: new Date(),
        })
        .where(eq(routeLoads.id, input.routeLoadId));

      return { success: true };
    }),

  /**
   * Complete route (mark as completed)
   */
  complete: supervisorProcedure
    .input(
      z.object({
        routeLoadId: z.string(),
        completedDeliveries: z.number().min(0).optional(),
        returnTime: z.date().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const load = await db.query.routeLoads.findFirst({
        where: (l, { eq, and }) =>
          and(eq(l.id, input.routeLoadId), eq(l.tenantId, tenantId)),
      });

      if (!load) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Route load not found",
        });
      }

      await db
        .update(routeLoads)
        .set({
          status: "completed",
          completedDeliveries:
            input.completedDeliveries ?? load.completedDeliveries,
          returnTime: input.returnTime || new Date(),
          notes: input.notes || load.notes,
          updatedAt: new Date(),
        })
        .where(eq(routeLoads.id, input.routeLoadId));

      return { success: true };
    }),

  /**
   * Cancel route load
   */
  cancel: adminProcedure
    .input(
      z.object({
        routeLoadId: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const load = await db.query.routeLoads.findFirst({
        where: (l, { eq, and }) =>
          and(eq(l.id, input.routeLoadId), eq(l.tenantId, tenantId)),
      });

      if (!load) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Route load not found",
        });
      }

      // If items were loaded, return assets to stock
      if (
        load.status === "loaded" ||
        load.status === "dispatched" ||
        load.status === "in_progress"
      ) {
        const items = await db
          .select()
          .from(routeLoadItems)
          .where(eq(routeLoadItems.routeLoadId, input.routeLoadId));

        for (const item of items) {
          if (item.serialNumbers) {
            const serials = JSON.parse(item.serialNumbers) as string[];
            await db
              .update(assets)
              .set({
                status: "in_stock",
                currentOwnerId: null,
                currentOwnerType: null,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(assets.tenantId, tenantId),
                  inArray(assets.serialNumber, serials),
                ),
              );
          }
        }
      }

      await db
        .update(routeLoads)
        .set({
          status: "cancelled",
          notes: input.reason ? `CANCELLED: ${input.reason}` : "CANCELLED",
          updatedAt: new Date(),
        })
        .where(eq(routeLoads.id, input.routeLoadId));

      return { success: true };
    }),

  /**
   * Get today's pending loads
   */
  getTodayPending: supervisorProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;
    if (!tenantId) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const loads = await db
      .select({
        id: routeLoads.id,
        vehicleId: routeLoads.vehicleId,
        driverId: routeLoads.driverId,
        loadDate: routeLoads.loadDate,
        status: routeLoads.status,
        plannedDeliveries: routeLoads.plannedDeliveries,
        totalCylindersLoaded: routeLoads.totalCylindersLoaded,
        totalTanksLoaded: routeLoads.totalTanksLoaded,
        createdAt: routeLoads.createdAt,
      })
      .from(routeLoads)
      .where(
        and(
          eq(routeLoads.tenantId, tenantId),
          gte(routeLoads.loadDate, today),
          lte(routeLoads.loadDate, tomorrow),
        ),
      )
      .orderBy(desc(routeLoads.createdAt));

    return loads;
  }),

  /**
   * Get daily summary
   */
  getDailySummary: supervisorProcedure
    .input(z.object({ date: z.date().default(() => new Date()) }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        return {
          pending: 0,
          loading: 0,
          loaded: 0,
          dispatched: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
          totalCylinders: 0,
          totalTanks: 0,
          totalWeight: 0,
          totalDeliveries: 0,
        };
      }

      const dateFrom = new Date(input.date);
      dateFrom.setHours(0, 0, 0, 0);
      const dateTo = new Date(input.date);
      dateTo.setHours(23, 59, 59, 999);

      const loads = await db
        .select({
          status: routeLoads.status,
          totalCylinders: routeLoads.totalCylindersLoaded,
          totalTanks: routeLoads.totalTanksLoaded,
          totalWeight: routeLoads.totalWeightLoaded,
          totalDeliveries: routeLoads.completedDeliveries,
        })
        .from(routeLoads)
        .where(
          and(
            eq(routeLoads.tenantId, tenantId),
            gte(routeLoads.loadDate, dateFrom),
            lte(routeLoads.loadDate, dateTo),
          ),
        );

      const summary = {
        pending: 0,
        loading: 0,
        loaded: 0,
        dispatched: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        totalCylinders: 0,
        totalTanks: 0,
        totalWeight: 0,
        totalDeliveries: 0,
      };

      for (const load of loads) {
        if (load.status) {
          summary[load.status as keyof typeof summary]++;
        }
        summary.totalCylinders += load.totalCylinders || 0;
        summary.totalTanks += load.totalTanks || 0;
        summary.totalWeight += load.totalWeight || 0;
        summary.totalDeliveries += load.totalDeliveries || 0;
      }

      return summary;
    }),

  /**
   * Get load statistics
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;
    if (!tenantId) {
      return {
        total: 0,
        byStatus: {
          pending: 0,
          loading: 0,
          loaded: 0,
          dispatched: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
        },
        today: {
          total: 0,
          pending: 0,
          loading: 0,
          dispatched: 0,
          completed: 0,
        },
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allLoads = await db
      .select({ status: routeLoads.status })
      .from(routeLoads)
      .where(eq(routeLoads.tenantId, tenantId));

    const todayLoads = await db
      .select({ status: routeLoads.status })
      .from(routeLoads)
      .where(
        and(
          eq(routeLoads.tenantId, tenantId),
          gte(routeLoads.loadDate, today),
          lte(routeLoads.loadDate, tomorrow),
        ),
      );

    const byStatus = {
      pending: allLoads.filter((l) => l.status === "pending").length,
      loading: allLoads.filter((l) => l.status === "loading").length,
      loaded: allLoads.filter((l) => l.status === "loaded").length,
      dispatched: allLoads.filter((l) => l.status === "dispatched").length,
      in_progress: allLoads.filter((l) => l.status === "in_progress").length,
      completed: allLoads.filter((l) => l.status === "completed").length,
      cancelled: allLoads.filter((l) => l.status === "cancelled").length,
    };

    const todayStats = {
      total: todayLoads.length,
      pending: todayLoads.filter((l) => l.status === "pending").length,
      loading: todayLoads.filter((l) => l.status === "loading").length,
      dispatched: todayLoads.filter(
        (l) => l.status === "dispatched" || l.status === "in_progress",
      ).length,
      completed: todayLoads.filter((l) => l.status === "completed").length,
    };

    return {
      total: allLoads.length,
      byStatus,
      today: todayStats,
    };
  }),
} satisfies TRPCRouterRecord;
