import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, ilike, or, sql } from "@acme/db";
import { db } from "@acme/db/client";
import { products } from "@acme/db/schema";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  supervisorProcedure,
} from "../trpc";

/**
 * Products Router - Management of catalog products and services
 */
export const productsRouter = createTRPCRouter({
  /**
   * List products with pagination and search
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
        search: z.string().optional(),
        category: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, search, category } = input;
      const tenantId = ctx.session.user.tenantId;

      if (!tenantId) {
        return { data: [], total: 0, totalPages: 0 };
      }

      const filters: any[] = [eq(products.tenantId, tenantId)];

      if (search) {
        filters.push(ilike(products.name, `%${search}%`));
      }

      if (category && category !== "all") {
        filters.push(eq(products.category, category as any));
      }

      const [total] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(...filters));

      const items = await db
        .select()
        .from(products)
        .where(and(...filters))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(products.createdAt));

      return {
        data: items,
        total: Number(total?.count ?? 0),
        totalPages: Math.ceil(Number(total?.count ?? 0) / limit),
      };
    }),

  /**
   * Get product by ID
   */
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const product = await db.query.products.findFirst({
        where: and(eq(products.id, input.id), eq(products.tenantId, tenantId)),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Producto no encontrado",
        });
      }

      return product;
    }),

  /**
   * Create new product
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        category: z.enum([
          "gas-lp",
          "gas-estacionario",
          "servicios",
          "accesorios",
          "otro",
        ]),
        price: z.number().min(0),
        stock: z.number().optional(),
        unit: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [newProduct] = await db
        .insert(products)
        .values({
          id: crypto.randomUUID(),
          tenantId,
          ...input,
          price: input.price.toString(),
        })
        .returning();

      return newProduct;
    }),

  /**
   * Update product
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        category: z
          .enum([
            "gas-lp",
            "gas-estacionario",
            "servicios",
            "accesorios",
            "otro",
          ])
          .optional(),
        price: z.number().min(0).optional(),
        stock: z.number().optional(),
        unit: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.price !== undefined) updateData.price = data.price.toString();

      const [updated] = await db
        .update(products)
        .set({ ...updateData, updatedAt: new Date() })
        .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
        .returning();

      return updated;
    }),

  /**
   * Delete product
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .delete(products)
        .where(and(eq(products.id, input.id), eq(products.tenantId, tenantId)));

      return { success: true };
    }),
});
