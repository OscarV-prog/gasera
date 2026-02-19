import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, gte } from "@acme/db";
import { db } from "@acme/db/client";
import {
  appVersions,
  legalDocuments,
  legalVersions,
  userLegalAcceptances,
} from "@acme/db/schema";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  supervisorProcedure,
} from "../trpc";

/**
 * Legal Router - Story 3.3: Legal Info & App Versioning Management
 * Manages legal documents, versions, and app version control
 */
export const legalRouter = createTRPCRouter({
  // ============================================================================
  // LEGAL DOCUMENTS
  // ============================================================================

  /**
   * List all legal documents
   */
  listDocuments: protectedProcedure
    .input(
      z
        .object({
          documentType: z
            .enum([
              "privacy_policy",
              "terms_of_service",
              "cookie_policy",
              "disclaimer",
            ])
            .optional(),
          isActive: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) return [];

      const conditions = [eq(legalDocuments.tenantId, tenantId)];

      if (input?.documentType) {
        conditions.push(eq(legalDocuments.documentType, input.documentType));
      }

      if (input?.isActive !== undefined) {
        conditions.push(eq(legalDocuments.isActive, input.isActive ? 1 : 0));
      }

      return ctx.db
        .select()
        .from(legalDocuments)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(legalDocuments.updatedAt));
    }),

  /**
   * Get a legal document with its current version
   */
  getDocument: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        documentType: z
          .enum([
            "privacy_policy",
            "terms_of_service",
            "cookie_policy",
            "disclaimer",
          ])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) return null;

      const conditions = [eq(legalDocuments.tenantId, tenantId)];

      if (input.id) {
        conditions.push(eq(legalDocuments.id, input.id));
      } else if (input.documentType) {
        conditions.push(eq(legalDocuments.documentType, input.documentType));
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either id or documentType is required",
        });
      }

      const [document] = await ctx.db
        .select()
        .from(legalDocuments)
        .where(and(...conditions))
        .limit(1);

      if (!document) {
        return null;
      }

      // Get current version
      const [version] = await ctx.db
        .select()
        .from(legalVersions)
        .where(
          and(
            eq(legalVersions.documentId, document.id),
            eq(legalVersions.isCurrent, 1),
          ),
        )
        .orderBy(desc(legalVersions.effectiveDate))
        .limit(1);

      return { ...document, currentVersion: version ?? null };
    }),

  /**
   * Create a legal document
   */
  createDocument: adminProcedure
    .input(
      z.object({
        documentType: z.enum([
          "privacy_policy",
          "terms_of_service",
          "cookie_policy",
          "disclaimer",
        ]),
        title: z.string().min(5).max(200),
        description: z.string().max(500).optional(),
        currentVersion: z.string().min(1).max(20),
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

      const [document] = await ctx.db
        .insert(legalDocuments)
        .values({
          ...input,
          id: `legdoc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
        })
        .returning();

      return document;
    }),

  /**
   * Update a legal document
   */
  updateDocument: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(5).max(200).optional(),
        description: z.string().max(500).optional(),
        currentVersion: z.string().min(1).max(20).optional(),
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

      const [document] = await ctx.db
        .update(legalDocuments)
        .set({ ...updateData, updatedAt: new Date() })
        .where(
          and(eq(legalDocuments.id, id), eq(legalDocuments.tenantId, tenantId)),
        )
        .returning();

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Legal document not found",
        });
      }

      return document;
    }),

  // ============================================================================
  // LEGAL VERSIONS
  // ============================================================================

  /**
   * List all versions for a document
   */
  listVersions: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        includeExpired: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) return [];

      const conditions = [
        eq(legalVersions.tenantId, tenantId),
        eq(legalVersions.documentId, input.documentId),
      ];

      if (!input.includeExpired) {
        conditions.push(gte(legalVersions.expirationDate, new Date()));
      }

      return ctx.db
        .select()
        .from(legalVersions)
        .where(and(...conditions))
        .orderBy(desc(legalVersions.effectiveDate));
    }),

  /**
   * Create a new version for a legal document
   */
  createVersion: adminProcedure
    .input(
      z.object({
        documentId: z.string(),
        version: z.string().min(1).max(20),
        content: z.string().min(10),
        effectiveDate: z.date(),
        expirationDate: z.date().optional(),
        changeSummary: z.string().max(1000).optional(),
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

      // Mark previous current version as not current
      await ctx.db
        .update(legalVersions)
        .set({ isCurrent: 0 })
        .where(
          and(
            eq(legalVersions.documentId, input.documentId),
            eq(legalVersions.isCurrent, 1),
          ),
        );

      const [version] = await ctx.db
        .insert(legalVersions)
        .values({
          ...input,
          id: `legver_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
          isCurrent: 1,
          createdBy: ctx.session.user.id,
        })
        .returning();

      // Update document's current version
      await ctx.db
        .update(legalDocuments)
        .set({ currentVersion: input.version, updatedAt: new Date() })
        .where(eq(legalDocuments.id, input.documentId));

      return version;
    }),

  /**
   * Set a version as current
   */
  setCurrentVersion: adminProcedure
    .input(
      z.object({
        documentId: z.string(),
        versionId: z.string(),
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

      // Get the version to set as current
      const [newCurrent] = await ctx.db
        .select()
        .from(legalVersions)
        .where(
          and(
            eq(legalVersions.id, input.versionId),
            eq(legalVersions.tenantId, tenantId),
          ),
        )
        .limit(1);

      if (!newCurrent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Version not found",
        });
      }

      // Mark all versions as not current
      await ctx.db
        .update(legalVersions)
        .set({ isCurrent: 0 })
        .where(
          and(
            eq(legalVersions.documentId, input.documentId),
            eq(legalVersions.tenantId, tenantId),
          ),
        );

      // Mark selected version as current
      await ctx.db
        .update(legalVersions)
        .set({ isCurrent: 1 })
        .where(eq(legalVersions.id, input.versionId));

      // Update document's current version
      await ctx.db
        .update(legalDocuments)
        .set({ currentVersion: newCurrent.version, updatedAt: new Date() })
        .where(eq(legalDocuments.id, input.documentId));

      return { success: true };
    }),

  // ============================================================================
  // APP VERSIONS
  // ============================================================================

  /**
   * List all app versions
   */
  listAppVersions: protectedProcedure
    .input(
      z
        .object({
          platform: z.enum(["driver_app", "client_app"]).optional(),
          isActive: z.boolean().optional(),
          isMandatory: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) return [];

      const conditions = [eq(appVersions.tenantId, tenantId)];

      if (input?.platform) {
        conditions.push(eq(appVersions.platform, input.platform));
      }

      if (input?.isActive !== undefined) {
        conditions.push(eq(appVersions.isActive, input.isActive ? 1 : 0));
      }

      if (input?.isMandatory !== undefined) {
        conditions.push(eq(appVersions.isMandatory, input.isMandatory ? 1 : 0));
      }

      return ctx.db
        .select()
        .from(appVersions)
        .where(and(...conditions))
        .orderBy(
          desc(appVersions.versionNumber),
          desc(appVersions.publishedAt),
        );
    }),

  /**
   * Get latest app version for a platform
   */
  getLatestVersion: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["driver_app", "client_app"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) return null;

      const [version] = await ctx.db
        .select()
        .from(appVersions)
        .where(
          and(
            eq(appVersions.tenantId, tenantId),
            eq(appVersions.platform, input.platform),
            eq(appVersions.isActive, 1),
          ),
        )
        .orderBy(desc(appVersions.versionNumber))
        .limit(1);

      return version ?? null;
    }),

  /**
   * Create a new app version
   */
  createAppVersion: adminProcedure
    .input(
      z.object({
        platform: z.enum(["driver_app", "client_app"]),
        versionCode: z.string().min(3).max(20),
        versionNumber: z.number(),
        downloadUrl: z.string().optional(),
        storeUrl: z.string().optional(),
        minOsVersion: z.string().optional(),
        isMandatory: z.boolean().default(false),
        releaseNotes: z.string().optional(),
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

      const [version] = await ctx.db
        .insert(appVersions)
        .values({
          ...input,
          id: `appver_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
          isMandatory: input.isMandatory ? 1 : 0,
          publishedBy: ctx.session.user.id,
          publishedAt: new Date(),
        })
        .returning();

      return version;
    }),

  /**
   * Update an app version
   */
  updateAppVersion: adminProcedure
    .input(
      z.object({
        id: z.string(),
        downloadUrl: z.string().optional(),
        storeUrl: z.string().optional(),
        isActive: z.boolean().optional(),
        isMandatory: z.boolean().optional(),
        releaseNotes: z.string().optional(),
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

      const { id, isActive, isMandatory, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };

      if (isActive !== undefined) {
        updateData.isActive = isActive ? 1 : 0;
      }
      if (isMandatory !== undefined) {
        updateData.isMandatory = isMandatory ? 1 : 0;
      }

      const [version] = await ctx.db
        .update(appVersions)
        .set(updateData)
        .where(and(eq(appVersions.id, id), eq(appVersions.tenantId, tenantId)))
        .returning();

      if (!version) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App version not found",
        });
      }

      return version;
    }),

  /**
   * Get mandatory update requirement
   */
  checkUpdateRequired: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["driver_app", "client_app"]),
        currentVersion: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) return { required: false };

      // Get latest mandatory version
      const [mandatoryVersion] = await ctx.db
        .select()
        .from(appVersions)
        .where(
          and(
            eq(appVersions.tenantId, tenantId),
            eq(appVersions.platform, input.platform),
            eq(appVersions.isActive, 1),
            eq(appVersions.isMandatory, 1),
          ),
        )
        .orderBy(desc(appVersions.versionNumber))
        .limit(1);

      if (!mandatoryVersion) {
        return { required: false };
      }

      // Compare versions (simple string comparison for now)
      const isUpdateRequired =
        input.currentVersion !== mandatoryVersion.versionCode;

      return {
        required: isUpdateRequired,
        latestVersion: mandatoryVersion,
      };
    }),

  // ============================================================================
  // USER LEGAL ACCEPTANCES
  // ============================================================================

  /**
   * Record user acceptance of legal terms
   */
  acceptTerms: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        versionId: z.string(),
        documentTitle: z.string(),
        documentVersion: z.string(),
        contentHash: z.string().optional(),
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

      const [acceptance] = await ctx.db
        .insert(userLegalAcceptances)
        .values({
          id: `acc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
          userId: ctx.session.user.id,
          documentId: input.documentId,
          versionId: input.versionId,
          acceptedAt: new Date(),
          documentTitle: input.documentTitle,
          documentVersion: input.documentVersion,
          contentHash: input.contentHash,
        })
        .returning();

      return acceptance;
    }),

  /**
   * Get user's acceptance history
   */
  getUserAcceptances: protectedProcedure
    .input(
      z
        .object({
          documentType: z
            .enum([
              "privacy_policy",
              "terms_of_service",
              "cookie_policy",
              "disclaimer",
            ])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) return [];

      // First get document IDs if documentType is specified
      let documentIds: string[] | undefined;

      if (input?.documentType) {
        const docs = await ctx.db
          .select({ id: legalDocuments.id })
          .from(legalDocuments)
          .where(
            and(
              eq(legalDocuments.tenantId, tenantId),
              eq(legalDocuments.documentType, input.documentType),
            ),
          );
        documentIds = docs.map((d) => d.id);
      }

      const conditions = [
        eq(userLegalAcceptances.tenantId, tenantId),
        eq(userLegalAcceptances.userId, ctx.session.user.id),
      ];

      if (documentIds && documentIds.length > 0) {
        // @ts-expect-error - drizzle-orm doesn't properly type inArray with text[]
        conditions.push(userLegalAcceptances.documentId.in(documentIds));
      }

      return ctx.db
        .select()
        .from(userLegalAcceptances)
        .where(and(...conditions))
        .orderBy(desc(userLegalAcceptances.acceptedAt));
    }),
});
