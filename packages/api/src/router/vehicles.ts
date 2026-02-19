import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, ne, sql } from "@acme/db";
import { db } from "@acme/db/client";
import { user, vehicles } from "@acme/db/schema";

import { adminProcedure, protectedProcedure } from "../trpc";

export const vehiclesRouter = {
  /**
   * List all vehicles for current organization
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;

    if (!tenantId) {
      return [];
    }

    const vehs = await db
      .select({
        id: vehicles.id,
        licensePlate: vehicles.licensePlate,
        vehicleType: vehicles.vehicleType,
        brand: vehicles.brand,
        model: vehicles.model,
        year: vehicles.year,
        capacityWeight: vehicles.capacityWeight,
        capacityVolume: vehicles.capacityVolume,
        fuelType: vehicles.fuelType,
        status: vehicles.status,
        assignedDriverId: vehicles.assignedDriverId,
        registrationExpiry: vehicles.registrationExpiry,
        insuranceExpiry: vehicles.insuranceExpiry,
        createdAt: vehicles.createdAt,
        updatedAt: vehicles.updatedAt,
      })
      .from(vehicles)
      .where(eq(vehicles.tenantId, tenantId))
      .orderBy(desc(vehicles.createdAt));

    return vehs;
  }),

  /**
   * Get single vehicle details
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const veh = await db.query.vehicles.findFirst({
        where: (v, { eq, and }) =>
          and(eq(v.id, input.id), eq(v.tenantId, tenantId)),
      });

      if (!veh) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      return veh;
    }),

  /**
   * Create new vehicle (admin only)
   */
  create: protectedProcedure
    .input(
      z.object({
        licensePlate: z.string().min(5).max(20),
        vehicleType: z.enum(["truck", "van", "pickup", "motorcycle"]),
        brand: z.string().min(1).max(50),
        model: z.string().min(1).max(50),
        year: z
          .number()
          .min(1950)
          .max(new Date().getFullYear() + 1)
          .optional(),
        vin: z.string().length(17).optional(),
        capacityWeight: z.number().min(0).max(50000).default(0),
        capacityVolume: z.number().min(0).max(100000).default(0),
        fuelType: z
          .enum(["gasoline", "diesel", "electric", "hybrid"])
          .default("diesel"),
        registrationExpiry: z.date().optional(),
        insuranceExpiry: z.date().optional(),
        notes: z.string().max(500).optional(),
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

      // Check for duplicate license plate
      const existing = await db.query.vehicles.findFirst({
        where: (v, { eq, and }) =>
          and(eq(v.licensePlate, input.licensePlate), eq(v.tenantId, tenantId)),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Vehicle with this license plate already exists",
        });
      }

      await db.insert(vehicles).values({
        id: crypto.randomUUID(),
        tenantId,
        ...input,
        status: "active",
      });

      return { success: true };
    }),

  /**
   * Update vehicle (admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        licensePlate: z.string().min(5).max(20).optional(),
        vehicleType: z
          .enum(["truck", "van", "pickup", "motorcycle"])
          .optional(),
        brand: z.string().min(1).max(50).optional(),
        model: z.string().min(1).max(50).optional(),
        year: z
          .number()
          .min(1950)
          .max(new Date().getFullYear() + 1)
          .optional(),
        vin: z.string().length(17).optional(),
        capacityWeight: z.number().min(0).max(50000).optional(),
        capacityVolume: z.number().min(0).max(100000).optional(),
        fuelType: z
          .enum(["gasoline", "diesel", "electric", "hybrid"])
          .optional(),
        status: z.enum(["active", "maintenance", "retired"]).optional(),
        registrationExpiry: z.date().optional(),
        insuranceExpiry: z.date().optional(),
        notes: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, ...updates } = input;

      // Verify vehicle exists
      const existing = await db.query.vehicles.findFirst({
        where: (v, { eq, and }) => and(eq(v.id, id), eq(v.tenantId, tenantId)),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      await db
        .update(vehicles)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(vehicles.id, id), eq(vehicles.tenantId, tenantId)));

      return { success: true };
    }),

  /**
   * Delete vehicle (admin only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const existing = await db.query.vehicles.findFirst({
        where: (v, { eq, and }) =>
          and(eq(v.id, input.id), eq(v.tenantId, tenantId)),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      await db
        .delete(vehicles)
        .where(and(eq(vehicles.id, input.id), eq(vehicles.tenantId, tenantId)));

      return { success: true };
    }),

  /**
   * Assign driver to vehicle (admin only)
   */
  assignDriver: adminProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        driverId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Verify vehicle exists
      const vehicle = await db.query.vehicles.findFirst({
        where: (v, { eq, and }) =>
          and(eq(v.id, input.vehicleId), eq(v.tenantId, tenantId)),
      });

      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      // Verify driver exists and belongs to same tenant
      if (input.driverId) {
        const driver = await db
          .select()
          .from(user)
          .where(eq(user.id, input.driverId))
          .then((r) => r[0]);

        if (driver?.tenantId !== tenantId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Driver not found or does not belong to your organization",
          });
        }
      }

      await db
        .update(vehicles)
        .set({ assignedDriverId: input.driverId, updatedAt: new Date() })
        .where(
          and(
            eq(vehicles.id, input.vehicleId),
            eq(vehicles.tenantId, tenantId),
          ),
        );

      return { success: true };
    }),

  /**
   * Get available drivers for assignment
   */
  listDrivers: adminProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;
    if (!tenantId) return [];

    const drivers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(and(eq(user.tenantId, tenantId), eq(user.role, "chofer")));

    return drivers;
  }),

  /**
   * Get vehicle statistics
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;
    if (!tenantId) {
      return {
        total: 0,
        active: 0,
        maintenance: 0,
        retired: 0,
      };
    }

    const allVehicles = await db
      .select({ status: vehicles.status })
      .from(vehicles)
      .where(eq(vehicles.tenantId, tenantId));

    const stats = {
      total: allVehicles.length,
      active: allVehicles.filter((v) => v.status === "active").length,
      maintenance: allVehicles.filter((v) => v.status === "maintenance").length,
      retired: allVehicles.filter((v) => v.status === "retired").length,
    };

    return stats;
  }),
} satisfies TRPCRouterRecord;
