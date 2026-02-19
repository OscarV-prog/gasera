import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@acme/db";
import { db } from "@acme/db/client";
import { deviceTokens, vehicles, vehicleTracking } from "@acme/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

/**
 * Tracking Router - Epic 5: Real-time Logistics
 */
export const trackingRouter = createTRPCRouter({
  /**
   * Get current positions of all active vehicles
   */
  getFleetPositions: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;

    // Return empty if no tenant (user not fully set up)
    if (!tenantId) {
      return [];
    }

    // 1. Get all active vehicles for the tenant
    const fleet = await db
      .select()
      .from(vehicles)
      .where(
        and(eq(vehicles.tenantId, tenantId), eq(vehicles.status, "active")),
      );

    if (fleet.length === 0) return [];

    // 2. Get latest tracking data for these vehicles
    // For simplicity, we get the latest location for each
    const positions = await Promise.all(
      fleet.map(async (v) => {
        const latest = await db.query.vehicleTracking.findFirst({
          where: eq(vehicleTracking.vehicleId, v.id),
          orderBy: desc(vehicleTracking.serverReceivedAt),
        });

        return {
          vehicleId: v.id,
          vehicleName: `${v.brand} ${v.model} (${v.licensePlate})`,
          latitude: latest?.latitude || v.lastLatitude,
          longitude: latest?.longitude || v.lastLongitude,
          status: latest?.status || "offline",
          speed: latest?.speed || "0",
          batteryLevel: latest?.batteryLevel || "0",
          updatedAt: latest?.serverReceivedAt || v.lastLocationUpdatedAt,
        };
      }),
    );

    return positions;
  }),

  /**
   * Get history for a specific vehicle
   */
  getVehicleHistory: protectedProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .query(async ({ input }) => {
      const filters = [eq(vehicleTracking.vehicleId, input.vehicleId)];

      return await db
        .select()
        .from(vehicleTracking)
        .where(and(...filters))
        .orderBy(desc(vehicleTracking.serverReceivedAt))
        .limit(100);
    }),

  /**
   * Register push notification token for a user
   */
  registerDeviceToken: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        platform: z.enum(["ios", "android", "web"]),
        deviceId: z.string().optional(),
        deviceName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must belong to an organization",
        });
      }

      // Upsert logic
      const existing = await db.query.deviceTokens.findFirst({
        where: and(
          eq(deviceTokens.userId, ctx.session.user.id),
          eq(deviceTokens.deviceToken, input.token),
        ),
      });

      if (existing) {
        await db
          .update(deviceTokens)
          .set({
            isActive: 1,
            lastUsedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(deviceTokens.id, existing.id));
        return { success: true, id: existing.id };
      }

      const id = crypto.randomUUID();
      await db.insert(deviceTokens).values({
        id,
        tenantId,
        userId: ctx.session.user.id,
        deviceToken: input.token,
        platform: input.platform,
        deviceId: input.deviceId,
        deviceName: input.deviceName,
        isActive: 1,
        lastUsedAt: new Date(),
      });

      return { success: true, id };
    }),
});
