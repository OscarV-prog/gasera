import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, like, sql } from "@acme/db";
import { db } from "@acme/db/client";
import { assetHistory, assets } from "@acme/db/schema";

import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

/**
 * Generate unique serial number
 */
function generateSerialNumber(): string {
  const prefix = "GS"; // Gasera Serial
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Asset Router - Story 2.2: Asset Inventory with Serials Traceability
 * Manages gas platform assets, their status, movement, and history
 */
export const assetsRouter = createTRPCRouter({
  /**
   * List all assets with filtering
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
        type: z.enum(["cylinder", "tank"]).optional(),
        status: z
          .enum(["in_stock", "in_route", "delivered", "maintenance", "retired"])
          .optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, type, status, search } = input;

      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        return {
          items: [],
          total: 0,
          totalPages: 0,
        };
      }
      const filters = [eq(assets.tenantId, tenantId)];

      if (type) filters.push(eq(assets.assetType, type));
      if (status) filters.push(eq(assets.status, status));
      if (search) filters.push(like(assets.serialNumber, `%${search}%`));

      const [total] = await db
        .select({ count: sql<number>`count(*)` })
        .from(assets)
        .where(and(...filters));

      const items = await db
        .select()
        .from(assets)
        .where(and(...filters))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(assets.createdAt));

      return {
        items,
        total: Number(total?.count ?? 0),
        totalPages: Math.ceil(Number(total?.count ?? 0) / limit),
      };
    }),

  /**
   * Get asset details by ID
   */
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const asset = await db.query.assets.findFirst({
        where: and(eq(assets.id, input.id), eq(assets.tenantId, tenantId)),
        with: {
          // Add relations here if needed (e.g., owner, history)
        },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activo no encontrado",
        });
      }

      return asset;
    }),

  /**
   * Get asset history
   */
  getHistory: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(assetHistory)
        .where(eq(assetHistory.assetId, input.assetId))
        .orderBy(desc(assetHistory.createdAt));
    }),

  /**
   * Create new asset
   */
  create: adminProcedure
    .input(
      z.object({
        serialNumber: z.string().optional(),
        assetType: z.enum(["cylinder", "tank"]),
        subtype: z.string(), // e.g. "20kg", "30kg"
        capacity: z.number(),
        manufacturingDate: z.date().optional(),
        purchaseDate: z.date().optional(),
        purchasePrice: z.number().optional(),
        weightEmpty: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      const serialNumber = input.serialNumber || generateSerialNumber();

      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [newAsset] = await db
        .insert(assets)
        .values({
          id,
          tenantId,
          serialNumber,
          assetType: input.assetType,
          subtype: input.subtype,
          capacity: input.capacity,
          manufacturingDate: input.manufacturingDate,
          purchaseDate: input.purchaseDate,
          purchasePrice: input.purchasePrice,
          weightEmpty: input.weightEmpty,
          notes: input.notes,
          status: "in_stock",
        })
        .returning();

      // Log history
      await db.insert(assetHistory).values({
        id: crypto.randomUUID(),
        assetId: id,
        action: "created",
        newValue: `Asset registered with serial ${serialNumber}`,
        performedBy: ctx.session.user.id,
      });

      return newAsset;
    }),

  /**
   * Update asset status (e.g., maintenance, decommission)
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "in_stock",
          "in_route",
          "delivered",
          "maintenance",
          "retired",
        ]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const asset = await db.query.assets.findFirst({
        where: and(eq(assets.id, input.id), eq(assets.tenantId, tenantId)),
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activo no encontrado",
        });
      }

      await db
        .update(assets)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(assets.id, input.id));

      // Log history
      await db.insert(assetHistory).values({
        id: crypto.randomUUID(),
        assetId: input.id,
        action: "status_changed",
        previousValue: asset.status,
        newValue: input.status,
        notes: input.notes,
        performedBy: ctx.session.user.id,
      });

      return { success: true };
    }),

  /**
   * Assign asset to driver or customer
   */
  assign: adminProcedure
    .input(
      z.object({
        assetId: z.string(),
        ownerId: z.string(),
        ownerType: z.enum(["driver", "customer"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const asset = await db.query.assets.findFirst({
        where: and(eq(assets.id, input.assetId), eq(assets.tenantId, tenantId)),
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activo no encontrado",
        });
      }

      await db
        .update(assets)
        .set({
          currentOwnerId: input.ownerId,
          currentOwnerType: input.ownerType,
          status: "in_route", // If assigned to driver usually means in route
          updatedAt: new Date(),
        })
        .where(eq(assets.id, input.assetId));

      await db.insert(assetHistory).values({
        id: crypto.randomUUID(),
        assetId: input.assetId,
        action: "assigned",
        newValue: `Assigned to ${input.ownerType}: ${input.ownerId}`,
        performedBy: ctx.session.user.id,
      });

      return { success: true };
    }),

  /**
   * Delete asset
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const asset = await db.query.assets.findFirst({
        where: and(eq(assets.id, input.id), eq(assets.tenantId, tenantId)),
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activo no encontrado",
        });
      }

      await db
        .delete(assets)
        .where(and(eq(assets.id, input.id), eq(assets.tenantId, tenantId)));

      return { success: true };
    }),
});
