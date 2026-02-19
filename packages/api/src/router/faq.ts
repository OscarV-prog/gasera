import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, ilike, or } from "@acme/db";
import { db } from "@acme/db/client";
import { faqCategories, faqItems, supportContacts } from "@acme/db/schema";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  supervisorProcedure,
} from "../trpc";

/**
 * FAQ Router - Story 3.2: Technical Support Help Center (FAQ)
 * Manages FAQ categories, items, and support contact information
 */
export const faqRouter = createTRPCRouter({
  // ============================================================================
  // FAQ CATEGORIES
  // ============================================================================

  /**
   * List all FAQ categories
   */
  listCategories: protectedProcedure
    .input(
      z
        .object({
          isActive: z.boolean().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        return {
          data: [],
          total: 0,
          page: input?.page ?? 1,
          limit: input?.limit ?? 20,
          totalPages: 0,
        };
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = [eq(faqCategories.tenantId, tenantId)];

      if (input?.isActive !== undefined) {
        conditions.push(eq(faqCategories.isActive, input.isActive ? 1 : 0));
      }

      const [data, total] = await Promise.all([
        ctx.db
          .select()
          .from(faqCategories)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(faqCategories.displayOrder, desc(faqCategories.createdAt))
          .limit(limit)
          .offset(offset),
        ctx.db
          .select({ count: faqCategories.id })
          .from(faqCategories)
          .where(eq(faqCategories.tenantId, tenantId)),
      ]);

      return {
        data,
        total: total.length ? Number(total[0]?.count ?? 0) : 0,
        page,
        limit,
        totalPages: Math.ceil(
          (total.length ? Number(total[0]?.count ?? 0) : 0) / limit,
        ),
      };
    }),

  /**
   * Create a FAQ category
   */
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(50),
        description: z.string().max(200).optional(),
        displayOrder: z.number().min(0).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      const [category] = await ctx.db
        .insert(faqCategories)
        .values({
          ...input,
          id: `faqcat_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
        })
        .returning();

      return category;
    }),

  /**
   * Update a FAQ category
   */
  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).max(50).optional(),
        description: z.string().max(200).optional(),
        displayOrder: z.number().min(0).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      const { id, isActive, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };

      if (isActive !== undefined) {
        updateData.isActive = isActive ? 1 : 0;
      }

      const [category] = await ctx.db
        .update(faqCategories)
        .set({ ...updateData, updatedAt: new Date() })
        .where(
          and(eq(faqCategories.id, id), eq(faqCategories.tenantId, tenantId)),
        )
        .returning();

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "FAQ category not found",
        });
      }

      return category;
    }),

  /**
   * Delete a FAQ category
   */
  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      await ctx.db
        .delete(faqCategories)
        .where(
          and(
            eq(faqCategories.id, input.id),
            eq(faqCategories.tenantId, tenantId),
          ),
        );

      return { success: true };
    }),

  // ============================================================================
  // FAQ ITEMS
  // ============================================================================

  /**
   * List all FAQ items
   */
  listItems: protectedProcedure
    .input(
      z
        .object({
          categoryId: z.string().optional(),
          search: z.string().optional(),
          isActive: z.boolean().optional(),
          isFeatured: z.boolean().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        return {
          data: [],
          total: 0,
          page: input?.page ?? 1,
          limit: input?.limit ?? 20,
          totalPages: 0,
        };
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = [eq(faqItems.tenantId, tenantId)];

      if (input?.categoryId) {
        conditions.push(eq(faqItems.categoryId, input.categoryId));
      }

      if (input?.search) {
        const searchConditions = or(
          ilike(faqItems.question, `%${input.search}%`),
          ilike(faqItems.answer, `%${input.search}%`),
          ilike(faqItems.keywords, `%${input.search}%`),
        );
        if (searchConditions) conditions.push(searchConditions);
      }

      if (input?.isActive !== undefined) {
        conditions.push(eq(faqItems.isActive, input.isActive ? 1 : 0));
      }

      if (input?.isFeatured !== undefined) {
        conditions.push(eq(faqItems.isFeatured, input.isFeatured ? 1 : 0));
      }

      const [data, total] = await Promise.all([
        ctx.db
          .select({
            id: faqItems.id,
            tenantId: faqItems.tenantId,
            categoryId: faqItems.categoryId,
            question: faqItems.question,
            answer: faqItems.answer,
            keywords: faqItems.keywords,
            isActive: faqItems.isActive,
            isFeatured: faqItems.isFeatured,
            views: faqItems.views,
            createdAt: faqItems.createdAt,
            updatedAt: faqItems.updatedAt,
            categoryName: faqCategories.name,
          })
          .from(faqItems)
          .leftJoin(faqCategories, eq(faqItems.categoryId, faqCategories.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(
            desc(faqItems.isFeatured),
            desc(faqItems.views),
            desc(faqItems.createdAt),
          )
          .limit(limit)
          .offset(offset),
        ctx.db
          .select({ count: faqItems.id })
          .from(faqItems)
          .where(eq(faqItems.tenantId, tenantId)),
      ]);

      return {
        data,
        total: total.length ? Number(total[0]?.count ?? 0) : 0,
        page,
        limit,
        totalPages: Math.ceil(
          (total.length ? Number(total[0]?.count ?? 0) : 0) / limit,
        ),
      };
    }),

  /**
   * Get a single FAQ item by ID
   */
  getItemById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log("getItemById input:", input);
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      const [item] = await ctx.db
        .select()
        .from(faqItems)
        .where(and(eq(faqItems.id, input.id), eq(faqItems.tenantId, tenantId)));

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "FAQ item not found",
        });
      }

      // Increment views
      // await ctx.db
      //   .update(faqItems)
      //   .set({ views: (item.views ?? 0) + 1 })
      //   .where(eq(faqItems.id, input.id));

      return item;
    }),

  /**
   * Create a FAQ item
   */
  createItem: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        question: z.string().min(5).max(500),
        answer: z.string().min(10).max(5000),
        keywords: z.string().max(500).optional(),
        isFeatured: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      const [item] = await ctx.db
        .insert(faqItems)
        .values({
          ...input,
          id: `faqitem_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
          isFeatured: input.isFeatured ? 1 : 0,
        })
        .returning();

      return item;
    }),

  /**
   * Update a FAQ item
   */
  updateItem: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        categoryId: z.string().optional(),
        question: z.string().min(5).max(500).optional(),
        answer: z.string().min(10).max(5000).optional(),
        keywords: z.string().max(500).optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      const { id, isActive, isFeatured, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };

      if (isActive !== undefined) {
        updateData.isActive = isActive ? 1 : 0;
      }
      if (isFeatured !== undefined) {
        updateData.isFeatured = isFeatured ? 1 : 0;
      }

      const [item] = await ctx.db
        .update(faqItems)
        .set({ ...updateData, updatedAt: new Date() })
        .where(and(eq(faqItems.id, id), eq(faqItems.tenantId, tenantId)))
        .returning();

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "FAQ item not found",
        });
      }

      return item;
    }),

  /**
   * Delete a FAQ item
   */
  deleteItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      await ctx.db
        .delete(faqItems)
        .where(and(eq(faqItems.id, input.id), eq(faqItems.tenantId, tenantId)));

      return { success: true };
    }),

  // ============================================================================
  // SUPPORT CONTACTS
  // ============================================================================

  /**
   * Get support contact information
   */
  getSupportContact: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;
    if (!tenantId) return null;

    const [contact] = await ctx.db
      .select()
      .from(supportContacts)
      .where(eq(supportContacts.tenantId, tenantId))
      .orderBy(desc(supportContacts.updatedAt))
      .limit(1);

    return contact ?? null;
  }),

  /**
   * Update support contact information
   */
  updateSupportContact: protectedProcedure
    .input(
      z.object({
        supportPhone: z.string().min(10).max(15),
        supportEmail: z.string().email(),
        supportWhatsapp: z.string().optional(),
        supportHours: z.string().optional(),
        emergencyPhone: z.string().optional(),
        officeAddress: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      // Check if exists
      const [existing] = await ctx.db
        .select()
        .from(supportContacts)
        .where(eq(supportContacts.tenantId, tenantId))
        .limit(1);

      if (existing) {
        const [contact] = await ctx.db
          .update(supportContacts)
          .set({
            ...input,
            updatedBy: ctx.session.user.id,
            updatedAt: new Date(),
          })
          .where(eq(supportContacts.id, existing.id))
          .returning();
        return contact;
      } else {
        const [contact] = await ctx.db
          .insert(supportContacts)
          .values({
            ...input,
            id: `suppc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`,
            tenantId,
            updatedBy: ctx.session.user.id,
            updatedAt: new Date(),
          })
          .returning();
        return contact;
      }
    }),
});
