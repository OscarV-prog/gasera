import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, ilike, inArray, not, or, sql } from "@acme/db";
import { db } from "@acme/db/client";
import {
  customerAddresses,
  customers,
  drivers,
  orderHistory,
  orderItems,
  orders,
  vehicles,
} from "@acme/db/schema";

import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

/**
 * Order Router - Story 4.1: Order Lifecycle & State Machine
 */
export const ordersRouter = createTRPCRouter({
  /**
   * List orders with filtering
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z
          .enum([
            "pending",
            "assigned",
            "in_progress",
            "delivered",
            "cancelled",
            "failed",
          ])
          .optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, page, status, priority, search } = input;
      const offset = (page - 1) * limit;

      const tenantId = ctx.session.user.tenantId;

      // Return empty if no tenant (user not fully set up)
      if (!tenantId) {
        return { data: [], total: 0, totalPages: 0 };
      }

      const filters = [eq(orders.tenantId, tenantId)];

      if (status) filters.push(eq(orders.status, status));
      if (priority) filters.push(eq(orders.priority, priority));
      if (search) {
        filters.push(
          or(
            ilike(orders.orderNumber, `%${search}%`),
            ilike(orders.customerNotes, `%${search}%`),
            ilike(orders.internalNotes, `%${search}%`),
          )!,
        );
      }

      const [total] = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(and(...filters));

      const items = await db
        .select()
        .from(orders)
        .where(and(...filters))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(orders.createdAt));

      return {
        data: items,
        total: Number(total?.count ?? 0),
        totalPages: Math.ceil(Number(total?.count ?? 0) / limit),
      };
    }),

  /**
   * Get order by ID with items
   */
  /**
   * Get order by ID with full details (items, customer, address, history)
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Usuario sin tenant asignado",
        });
      }

      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, input.id), eq(orders.tenantId, tenantId)),
      });

      if (!order) {
        return null;
      }

      // Fetch related data in parallel
      const [items, history, customer, address] = await Promise.all([
        // Items
        db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
        // History
        db
          .select()
          .from(orderHistory)
          .where(eq(orderHistory.orderId, order.id))
          .orderBy(desc(orderHistory.createdAt)),
        // Customer
        db.query.customers.findFirst({
          where: eq(customers.id, order.customerId),
        }),
        // Address
        db.query.customerAddresses.findFirst({
          where: eq(customerAddresses.id, order.customerAddressId),
        }),
      ]);

      return {
        ...order,
        items,
        history,
        customer: customer || {
          id: order.customerId,
          businessName: "Cliente Desconocido",
          customerCode: "N/A",
        },
        address: address || {
          stock: "",
          street: "Dirección",
          externalNumber: "Desconocida",
          neighborhood: "",
          city: "",
          state: "",
          postalCode: "",
        },
      };
    }),

  /**
   * Create new order
   */
  create: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        addressId: z.string(),
        requestedDeliveryDate: z.date(),
        requestedDeliveryTime: z.string(),
        priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
        items: z.array(
          z.object({
            itemType: z.string(),
            itemModel: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
          }),
        ),
        customerNotes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const orderId = crypto.randomUUID();
      const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Usuario sin tenant asignado",
        });
      }

      const calculateTotal = input.items.reduce(
        (acc, item) => acc + item.quantity * item.unitPrice,
        0,
      );

      // 1. Create Order
      const [newOrder] = await db
        .insert(orders)
        .values({
          id: orderId,
          tenantId,
          orderNumber,
          customerId: input.customerId,
          customerAddressId: input.addressId,
          status: "pending",
          priority: input.priority,
          requestedDate: input.requestedDeliveryDate,
          subtotal: calculateTotal,
          taxAmount: Math.round(calculateTotal * 0.16),
          totalAmount: Math.round(calculateTotal * 1.16),
          customerNotes: input.customerNotes,
          createdBy: ctx.session.user.id,
        })
        .returning();

      // 2. Create Items
      if (input.items.length > 0) {
        await db.insert(orderItems).values(
          input.items.map((item) => ({
            id: crypto.randomUUID(),
            tenantId,
            orderId,
            productType: item.itemType,
            productSubtype: item.itemModel,
            productName: `${item.itemType} ${item.itemModel}`,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice,
          })),
        );
      }

      // 3. Log History
      await db.insert(orderHistory).values({
        id: crypto.randomUUID(),
        tenantId,
        orderId,
        newStatus: "pending",
        changedBy: ctx.session.user.id,
        changedByRole: "system",
        notes: "Orden creada",
      });

      return newOrder;
    }),

  /**
   * Update order status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "pending",
          "assigned",
          "in_progress",
          "delivered",
          "cancelled",
          "failed",
        ]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, input.id), eq(orders.tenantId, tenantId)),
      });

      if (!order) throw new TRPCError({ code: "NOT_FOUND" });

      await db
        .update(orders)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.id));

      await db.insert(orderHistory).values({
        id: crypto.randomUUID(),
        tenantId,
        orderId: input.id,
        previousStatus: order.status,
        newStatus: input.status,
        changedBy: ctx.session.user.id,
        changedByRole: "user",
        notes: input.notes,
      });

      return { success: true };
    }),

  /**
   * Transition order status (frontend alias for updateStatus)
   */
  transitionStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        newStatus: z.enum([
          "pending",
          "assigned",
          "in_progress",
          "delivered",
          "cancelled",
          "failed",
        ]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, input.orderId), eq(orders.tenantId, tenantId)),
      });

      if (!order) throw new TRPCError({ code: "NOT_FOUND" });

      await db
        .update(orders)
        .set({
          status: input.newStatus,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.orderId));

      await db.insert(orderHistory).values({
        id: crypto.randomUUID(),
        tenantId,
        orderId: input.orderId,
        previousStatus: order.status,
        newStatus: input.newStatus,
        changedBy: ctx.session.user.id,
        changedByRole: "user",
        notes: input.notes,
      });

      return { success: true };
    }),

  /**
   * Get dashboard metrics
   */
  getDashboardMetrics: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;

    // If user doesn't have a tenant yet, return empty metrics
    if (!tenantId) {
      return {
        counts: {
          total: 0,
          delivered: 0,
          inProgress: 0,
          pending: 0,
        },
        urgentOrders: [],
      };
    }

    const [total] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.tenantId, tenantId));

    const [delivered] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(eq(orders.tenantId, tenantId), eq(orders.status, "delivered")),
      );

    const [inProgress] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(eq(orders.tenantId, tenantId), eq(orders.status, "in_progress")),
      );

    const [pending] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(eq(orders.tenantId, tenantId), eq(orders.status, "pending")));

    const urgentOrders = await db.query.orders.findMany({
      where: and(
        eq(orders.tenantId, tenantId),
        eq(orders.priority, "urgent"),
        // Not delivered or cancelled
        not(inArray(orders.status, ["delivered", "cancelled"])),
      ),
      limit: 5,
      orderBy: desc(orders.createdAt),
    });

    return {
      counts: {
        total: Number(total?.count ?? 0),
        delivered: Number(delivered?.count ?? 0),
        inProgress: Number(inProgress?.count ?? 0),
        pending: Number(pending?.count ?? 0),
      },
      urgentOrders,
    };
  }),

  /**
   * List deliveries with joined data for logistics view
   */
  listDeliveries: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, page, status, search } = input;
      const offset = (page - 1) * limit;
      const tenantId = ctx.session.user.tenantId;

      if (!tenantId) {
        return { data: [], total: 0, totalPages: 0 };
      }

      const conditions = [eq(orders.tenantId, tenantId)];

      if (status && status !== "all") {
        if (status === "active") {
          conditions.push(inArray(orders.status, ["assigned", "in_progress"]));
        } else {
          conditions.push(eq(orders.status, status as any));
        }
      }

      if (search) {
        conditions.push(
          or(
            ilike(orders.orderNumber, `%${search}%`),
            ilike(customers.businessName, `%${search}%`),
            ilike(customers.tradeName, `%${search}%`),
            ilike(drivers.name, `%${search}%`),
          )!,
        );
      }

      // 1. Get total count
      const [total] = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .leftJoin(drivers, eq(orders.assignedDriverId, drivers.id))
        .where(and(...conditions));

      // 2. Get data with joins
      const items = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          customerName: sql<string>`COALESCE(${customers.tradeName}, ${customers.businessName})`,
          customerAddress: sql<string>`${customerAddresses.street} || ' ' || ${customerAddresses.externalNumber} || ', ' || ${customerAddresses.neighborhood}`,
          driverName: drivers.name,
          vehicleUnit: vehicles.licensePlate, // Using licensePlate as generic unit identifier for now
          // We can add items summary later if needed, for now simplified
          itemCount: sql<number>`(SELECT count(*) FROM ${orderItems} WHERE ${orderItems.orderId} = ${orders.id})`,
          deliveryDate: orders.scheduledDate,
          requestedDate: orders.requestedDate,
        })
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .leftJoin(
          customerAddresses,
          eq(orders.customerAddressId, customerAddresses.id),
        )
        .leftJoin(drivers, eq(orders.assignedDriverId, drivers.id))
        .leftJoin(vehicles, eq(orders.assignedVehicleId, vehicles.id))
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(orders.createdAt));

      return {
        data: items,
        total: Number(total?.count ?? 0),
        totalPages: Math.ceil(Number(total?.count ?? 0) / limit),
      };
    }),
});
