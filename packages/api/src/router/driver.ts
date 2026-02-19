import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, count, desc, eq, gte, lte, sql } from "@acme/db";
import { db } from "@acme/db/client";
import {
  orders,
  routeIncidents,
  routeLoads,
  syncQueue,
  vehicles,
} from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

/**
 * Driver Router - Mobile app operations for drivers
 */
export const driverRouter = {
  /**
   * Get driver's assigned vehicle for today
   */
  getAssignedVehicle: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tenantId = ctx.session.user.tenantId;
    if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const driverId = ctx.session.user.id;

    // Find today's route load for this driver
    const todayRouteLoad = await db
      .select({
        routeLoad: routeLoads,
        vehicle: vehicles,
      })
      .from(routeLoads)
      .innerJoin(vehicles, eq(routeLoads.vehicleId, vehicles.id))
      .where(
        and(
          eq(routeLoads.tenantId, tenantId),
          eq(routeLoads.driverId, driverId),
          eq(routeLoads.status, "in_progress"),
          gte(routeLoads.departureTime, today),
          lte(routeLoads.departureTime, tomorrow),
        ),
      )
      .limit(1);

    return todayRouteLoad[0] || null;
  }),

  /**
   * Get driver's route load with all orders
   */
  getRouteLoad: protectedProcedure
    .input(z.object({ routeLoadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const routeLoad = await db
        .select({
          id: routeLoads.id,
          vehicleId: routeLoads.vehicleId,
          driverId: routeLoads.driverId,
          loadDate: routeLoads.loadDate,
          status: routeLoads.status,
          departureTime: routeLoads.departureTime,
          plannedDeliveries: routeLoads.plannedDeliveries,
          completedDeliveries: routeLoads.completedDeliveries,
          notes: routeLoads.notes,
          createdAt: routeLoads.createdAt,
        })
        .from(routeLoads)
        .where(
          and(
            eq(routeLoads.id, input.routeLoadId),
            eq(routeLoads.tenantId, tenantId),
          ),
        )
        .limit(1);

      if (!routeLoad[0]) {
        throw new Error("Route load not found");
      }

      // Get all orders assigned to this route load via orders
      const routeOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerId: orders.customerId,
          status: orders.status,
          totalAmount: orders.totalAmount,
          deliveryLatitude: orders.deliveryLatitude,
          deliveryLongitude: orders.deliveryLongitude,
          customerNotes: orders.customerNotes,
          deliveryInstructions: orders.deliveryInstructions,
          paymentMethod: orders.paymentMethod,
          paymentReceived: orders.paymentReceived,
        })
        .from(orders)
        .where(
          and(
            eq(orders.assignedVehicleId, routeLoad[0].vehicleId),
            eq(orders.tenantId, tenantId),
            sql`${orders.assignedDriverId} = ${routeLoad[0].driverId}`,
          ),
        );

      return {
        routeLoad: routeLoad[0],
        orders: routeOrders,
      };
    }),

  /**
   * Get next order for delivery
   */
  getNextOrder: protectedProcedure
    .input(z.object({ routeLoadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const driverId = ctx.session.user.id;

      const nextOrder = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerId: orders.customerId,
          status: orders.status,
          totalAmount: orders.totalAmount,
          deliveryLatitude: orders.deliveryLatitude,
          deliveryLongitude: orders.deliveryLongitude,
          customerNotes: orders.customerNotes,
          deliveryInstructions: orders.deliveryInstructions,
          paymentMethod: orders.paymentMethod,
          paymentReceived: orders.paymentReceived,
        })
        .from(orders)
        .where(
          and(
            eq(orders.assignedDriverId, driverId),
            eq(orders.tenantId, tenantId),
            eq(orders.status, "in_progress"),
          ),
        )
        .limit(1);

      return nextOrder[0] || null;
    }),

  /**
   * Verify GPS location for delivery
   */
  verifyDeliveryLocation: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        latitude: z.string().regex(/^-?\d+(\.\d+)?$/),
        longitude: z.string().regex(/^-?\d+(\.\d+)?$/),
        accuracy: z.number().optional(),
        maxDistanceMeters: z.number().min(10).max(1000).default(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const order = await db
        .select({
          deliveryAddressLat: orders.deliveryLatitude,
          deliveryAddressLng: orders.deliveryLongitude,
        })
        .from(orders)
        .where(and(eq(orders.id, input.orderId), eq(orders.tenantId, tenantId)))
        .limit(1);

      const address = order[0];

      if (!address?.deliveryAddressLat || !address?.deliveryAddressLng) {
        // No coordinates available, allow delivery
        return {
          isValid: true,
          distanceMeters: 0,
          message: "No address coordinates available",
        };
      }

      // Calculate distance using Haversine formula
      const customerLat = parseFloat(address.deliveryAddressLat);
      const customerLng = parseFloat(address.deliveryAddressLng);
      const deliveryLat = parseFloat(input.latitude);
      const deliveryLng = parseFloat(input.longitude);

      const distanceMeters = calculateDistance(
        customerLat,
        customerLng,
        deliveryLat,
        deliveryLng,
      );

      const isValid = distanceMeters <= input.maxDistanceMeters;

      return {
        isValid,
        distanceMeters: Math.round(distanceMeters),
        message: isValid
          ? "Location verified successfully"
          : `Too far from delivery address (${Math.round(distanceMeters)}m away)`,
      };
    }),

  /**
   * Complete a delivery with payment and signature
   */
  completeDelivery: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentMethod: z.enum([
          "cash",
          "credit_card",
          "debit_card",
          "bank_transfer",
          "credit_account",
        ]),
        paymentReceived: z.number().min(0),
        paymentReference: z.string().optional(),
        signatureDataUrl: z.string().optional(),
        signedByName: z.string().min(2).max(100),
        photoUrl: z.string().optional(),
        deliveryNotes: z.string().max(500).optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const driverId = ctx.session.user.id;
      const now = new Date();

      const orderId = input.orderId;

      // Update the order with delivery info
      await db
        .update(orders)
        .set({
          status: "delivered",
          paymentMethod: input.paymentMethod,
          paymentReceived: input.paymentReceived,
          paymentReference: input.paymentReference || undefined,
          deliveryLatitude: input.latitude || orders.deliveryLatitude,
          deliveryLongitude: input.longitude || orders.deliveryLongitude,
          signatureImageUrl: input.signatureDataUrl || undefined,
          deliveryTime: now,
          updatedAt: now,
        })
        .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)));

      return {
        success: true,
        message: "Delivery completed successfully",
      };
    }),

  /**
   * Report an incident
   */
  reportIncident: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "leak",
          "vehicle_issue",
          "customer_absent",
          "access_denied",
          "safety_hazard",
          "equipment_failure",
          "other",
        ]),
        severity: z.enum(["low", "medium", "high", "critical"]),
        latitude: z.string().regex(/^-?\d+(\.\d+)?$/),
        longitude: z.string().regex(/^-?\d+(\.\d+)?$/),
        description: z.string().min(10).max(2000),
        photoUrls: z.string().optional(),
        routeLoadId: z.string().optional(),
        vehicleId: z.string().optional(),
        orderId: z.string().optional(),
        customerId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const driverId = ctx.session.user.id;
      const now = new Date();

      const incidentId = crypto.randomUUID();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
      const incidentNumber = `INC-${dateStr}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      await db.insert(routeIncidents).values({
        id: incidentId,
        tenantId,
        incidentNumber,
        driverId,
        type: input.type,
        severity: input.severity,
        latitude: input.latitude,
        longitude: input.longitude,
        description: input.description,
        photoUrls: input.photoUrls ?? null,
        routeLoadId: input.routeLoadId ?? null,
        vehicleId: input.vehicleId ?? null,
        orderId: input.orderId ?? null,
        customerId: input.customerId ?? null,
        status: "open",
        createdAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        incidentNumber,
        message: "Incident reported successfully",
      };
    }),

  /**
   * Get all incidents for driver
   */
  getMyIncidents: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["open", "in_progress", "resolved", "escalated", "closed"])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const driverId = ctx.session.user.id;

      const conditions = [
        eq(routeIncidents.tenantId, tenantId),
        eq(routeIncidents.driverId, driverId),
      ];

      if (input.status) {
        conditions.push(eq(routeIncidents.status, input.status as any));
      }

      return db
        .select({
          id: routeIncidents.id,
          incidentNumber: routeIncidents.incidentNumber,
          type: routeIncidents.type,
          severity: routeIncidents.severity,
          status: routeIncidents.status,
          latitude: routeIncidents.latitude,
          longitude: routeIncidents.longitude,
          description: routeIncidents.description,
          photoUrls: routeIncidents.photoUrls,
          createdAt: routeIncidents.createdAt,
        })
        .from(routeIncidents)
        .where(and(...conditions))
        .orderBy(desc(routeIncidents.createdAt))
        .limit(input.limit);
    }),

  /**
   * Get pending sync queue items
   */
  getPendingSync: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;
    if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

    return db
      .select({
        id: syncQueue.id,
        entityType: syncQueue.entityType,
        entityId: syncQueue.entityId,
        operation: syncQueue.operation,
        payload: syncQueue.payload,
        status: syncQueue.status,
        createdAt: syncQueue.createdAt,
      })
      .from(syncQueue)
      .where(
        and(eq(syncQueue.tenantId, tenantId), eq(syncQueue.status, "pending")),
      )
      .orderBy(desc(syncQueue.createdAt))
      .limit(50);
  }),

  /**
   * Add item to sync queue (for offline support)
   */
  addToSyncQueue: protectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string(),
        operation: z.enum(["create", "update", "delete"]),
        payload: z.string(), // JSON string
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const now = new Date();

      const syncId = crypto.randomUUID();
      await db.insert(syncQueue).values({
        id: syncId,
        tenantId,
        entityType: input.entityType,
        entityId: input.entityId,
        operation: input.operation,
        payload: input.payload,
        status: "pending",
        createdAt: now,
      });

      return {
        success: true,
        message: "Item added to sync queue",
      };
    }),

  /**
   * Mark sync item as synced
   */
  markSynced: protectedProcedure
    .input(z.object({ syncId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(syncQueue)
        .set({ status: "synced", syncedAt: new Date() })
        .where(eq(syncQueue.id, input.syncId));

      return { success: true };
    }),

  /**
   * Get today's delivery statistics
   */
  getTodayStats: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;
    if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const driverId = ctx.session.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get driver's completed deliveries today
    const [completedDeliveries] = await db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, tenantId),
          eq(orders.assignedDriverId, driverId),
          eq(orders.status, "delivered"),
          gte(orders.updatedAt, today),
          lte(orders.updatedAt, tomorrow),
        ),
      );

    // Get driver's open incidents
    const [openIncidentsResult] = await db
      .select({ count: count() })
      .from(routeIncidents)
      .where(
        and(
          eq(routeIncidents.tenantId, tenantId),
          eq(routeIncidents.driverId, driverId),
          eq(routeIncidents.status, "open"),
        ),
      );
    const openIncidents = openIncidentsResult?.count || 0;

    return {
      completedDeliveries: completedDeliveries?.count || 0,
      openIncidents,
    };
  }),

  /**
   * Get current location and vehicle status
   */
  getCurrentStatus: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;
    if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const driverId = ctx.session.user.id;

    // Get current route load
    const currentRouteLoad = await db
      .select({
        routeLoad: routeLoads,
        vehicle: vehicles,
      })
      .from(routeLoads)
      .innerJoin(vehicles, eq(routeLoads.vehicleId, vehicles.id))
      .where(
        and(
          eq(routeLoads.tenantId, tenantId),
          eq(routeLoads.driverId, driverId),
          eq(routeLoads.status, "in_progress"),
        ),
      )
      .limit(1);

    // Get pending orders count for this driver
    let pendingOrders = 0;
    if (currentRouteLoad[0]) {
      const [result] = await db
        .select({ count: count() })
        .from(orders)
        .where(
          and(
            eq(orders.assignedDriverId, driverId),
            eq(orders.tenantId, tenantId),
            eq(orders.status, "in_progress"),
          ),
        );
      pendingOrders = result?.count || 0;
    }

    return {
      hasActiveRoute: !!currentRouteLoad[0],
      routeLoad: currentRouteLoad[0]?.routeLoad || null,
      vehicle: currentRouteLoad[0]?.vehicle || null,
      pendingOrders,
    };
  }),
} satisfies TRPCRouterRecord;

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
