import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, gte, isNull, lte, or } from "@acme/db";
import { db } from "@acme/db/client";
import {
  certificationAlertSettings,
  driverCertifications,
} from "@acme/db/schema";

import { adminProcedure, protectedProcedure } from "../trpc";

export const certificationsRouter = {
  /**
   * List certifications for a driver
   */
  listByDriver: protectedProcedure
    .input(z.object({ driverId: z.string() }))
    .query(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const certifications = await db
        .select({
          id: driverCertifications.id,
          certificationType: driverCertifications.certificationType,
          certificationName: driverCertifications.certificationName,
          issuingAuthority: driverCertifications.issuingAuthority,
          documentUrl: driverCertifications.documentUrl,
          issueDate: driverCertifications.issueDate,
          expirationDate: driverCertifications.expirationDate,
          status: driverCertifications.status,
          notes: driverCertifications.notes,
          createdAt: driverCertifications.createdAt,
        })
        .from(driverCertifications)
        .where(
          and(
            eq(driverCertifications.driverId, input.driverId),
            eq(driverCertifications.tenantId, tenantId),
          ),
        )
        .orderBy(desc(driverCertifications.expirationDate));

      return certifications;
    }),

  /**
   * List all certifications for current organization
   */
  listAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        status: z
          .enum([
            "valid",
            "expired",
            "pending_renewal",
            "revoked",
            "suspended",
            "all",
          ])
          .optional(),
        type: z
          .enum([
            "drivers_license",
            "hazmat_certification",
            "safety_training",
            "first_aid",
            "vehicle_inspection",
            "weight_limit_authorization",
            "gas_handling",
            "all",
          ])
          .optional(),
        driverId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { limit, cursor, status, type, driverId } = input;

      const conditions = [eq(driverCertifications.tenantId, tenantId)];

      if (driverId) {
        conditions.push(eq(driverCertifications.driverId, driverId));
      }
      if (status && status !== "all") {
        conditions.push(eq(driverCertifications.status, status));
      }
      if (type && type !== "all") {
        conditions.push(eq(driverCertifications.certificationType, type));
      }

      const certifications = await db
        .select({
          id: driverCertifications.id,
          driverId: driverCertifications.driverId,
          certificationType: driverCertifications.certificationType,
          certificationName: driverCertifications.certificationName,
          issuingAuthority: driverCertifications.issuingAuthority,
          documentUrl: driverCertifications.documentUrl,
          issueDate: driverCertifications.issueDate,
          expirationDate: driverCertifications.expirationDate,
          status: driverCertifications.status,
          notes: driverCertifications.notes,
          createdAt: driverCertifications.createdAt,
        })
        .from(driverCertifications)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limit + 1)
        .orderBy(desc(driverCertifications.expirationDate));

      let nextCursor: typeof cursor = undefined;
      if (certifications.length > limit) {
        const nextItem = certifications.pop();
        nextCursor = nextItem!.id;
      }

      return { certifications, nextCursor };
    }),

  /**
   * Get single certification details
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const certification = await db.query.driverCertifications.findFirst({
        where: (c, { eq, and }) =>
          and(eq(c.id, input.id), eq(c.tenantId, tenantId)),
      });

      if (!certification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification not found",
        });
      }

      return certification;
    }),

  /**
   * Create new certification (admin only)
   */
  create: adminProcedure
    .input(
      z.object({
        driverId: z.string(),
        certificationType: z.enum([
          "drivers_license",
          "hazmat_certification",
          "safety_training",
          "first_aid",
          "vehicle_inspection",
          "weight_limit_authorization",
          "gas_handling",
        ]),
        certificationName: z.string().min(1).max(100),
        issuingAuthority: z.string().min(1).max(100),
        documentUrl: z.string().url().optional(),
        issueDate: z.date(),
        expirationDate: z.date(),
        notes: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must belong to an organization",
        });
      }

      const certificationId = crypto.randomUUID();

      // Determine initial status based on expiration date
      const now = new Date();
      let status: "valid" | "expired" | "pending_renewal" = "valid";
      if (input.expirationDate < now) {
        status = "expired";
      } else if (
        input.expirationDate <
        new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      ) {
        status = "pending_renewal";
      }

      await db.insert(driverCertifications).values({
        id: certificationId,
        tenantId,
        ...input,
        status,
      });

      return { success: true, id: certificationId, status };
    }),

  /**
   * Update certification (admin only)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        certificationType: z
          .enum([
            "drivers_license",
            "hazmat_certification",
            "safety_training",
            "first_aid",
            "vehicle_inspection",
            "weight_limit_authorization",
            "gas_handling",
          ])
          .optional(),
        certificationName: z.string().min(1).max(100).optional(),
        issuingAuthority: z.string().min(1).max(100).optional(),
        documentUrl: z.string().url().optional().nullable(),
        issueDate: z.date().optional(),
        expirationDate: z.date().optional(),
        status: z
          .enum(["valid", "expired", "pending_renewal", "revoked", "suspended"])
          .optional(),
        notes: z.string().max(500).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const { id, ...updateData } = input;

      // Auto-update status based on expiration date if it's being changed
      if (updateData.expirationDate) {
        const now = new Date();
        if (updateData.expirationDate < now) {
          updateData.status = "expired";
        } else {
          updateData.status = "valid";
        }
      }

      const result = await db
        .update(driverCertifications)
        .set({ ...updateData, updatedAt: new Date() })
        .where(
          and(
            eq(driverCertifications.id, id),
            eq(driverCertifications.tenantId, tenantId),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification not found",
        });
      }

      return { success: true };
    }),

  /**
   * Renew certification (admin only)
   */
  renew: adminProcedure
    .input(
      z.object({
        id: z.string(),
        newExpirationDate: z.date(),
        issuingAuthority: z.string().optional(),
        documentUrl: z.string().url().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const certification = await db.query.driverCertifications.findFirst({
        where: (c, { eq, and }) =>
          and(eq(c.id, input.id), eq(c.tenantId, tenantId)),
      });

      if (!certification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification not found",
        });
      }

      // Update the certification
      await db
        .update(driverCertifications)
        .set({
          issueDate: new Date(),
          expirationDate: input.newExpirationDate,
          issuingAuthority:
            input.issuingAuthority || certification.issuingAuthority,
          documentUrl: input.documentUrl || certification.documentUrl,
          notes: input.notes || certification.notes,
          status: "valid",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(driverCertifications.id, input.id),
            eq(driverCertifications.tenantId, tenantId),
          ),
        );

      return { success: true };
    }),

  /**
   * Revoke certification (admin only)
   */
  revoke: adminProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const result = await db
        .update(driverCertifications)
        .set({
          status: "revoked",
          notes: input.reason ? `REVOKED: ${input.reason}` : "REVOKED",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(driverCertifications.id, input.id),
            eq(driverCertifications.tenantId, tenantId),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification not found",
        });
      }

      return { success: true };
    }),

  /**
   * Get certifications expiring soon (for dashboard alerts)
   */
  getExpiringSoon: adminProcedure
    .input(z.object({ daysAhead: z.number().min(1).max(365).default(30) }))
    .query(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const now = new Date();
      const futureDate = new Date(
        now.getTime() + input.daysAhead * 24 * 60 * 60 * 1000,
      );

      const expiringSoon = await db
        .select({
          id: driverCertifications.id,
          driverId: driverCertifications.driverId,
          certificationType: driverCertifications.certificationType,
          certificationName: driverCertifications.certificationName,
          expirationDate: driverCertifications.expirationDate,
          status: driverCertifications.status,
        })
        .from(driverCertifications)
        .where(
          and(
            eq(driverCertifications.tenantId, tenantId),
            or(
              eq(driverCertifications.status, "pending_renewal"),
              and(
                gte(driverCertifications.expirationDate, now),
                lte(driverCertifications.expirationDate, futureDate),
              ),
            ),
          ),
        )
        .orderBy(driverCertifications.expirationDate);

      return expiringSoon;
    }),

  /**
   * Get expired certifications
   */
  getExpired: adminProcedure.query(async ({ ctx }) => {
    
    const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const now = new Date();

    const expired = await db
      .select({
        id: driverCertifications.id,
        driverId: driverCertifications.driverId,
        certificationType: driverCertifications.certificationType,
        certificationName: driverCertifications.certificationName,
        expirationDate: driverCertifications.expirationDate,
        status: driverCertifications.status,
      })
      .from(driverCertifications)
      .where(
        and(
          eq(driverCertifications.tenantId, tenantId),
          eq(driverCertifications.status, "expired"),
        ),
      )
      .orderBy(driverCertifications.expirationDate);

    return expired;
  }),

  /**
   * Get drivers with valid certifications count
   */
  getDriversWithValidCerts: adminProcedure.query(async ({ ctx }) => {
    
    const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const now = new Date();

    // Get all valid certifications grouped by driver
    const validCerts = await db
      .select({
        driverId: driverCertifications.driverId,
        certType: driverCertifications.certificationType,
        expirationDate: driverCertifications.expirationDate,
      })
      .from(driverCertifications)
      .where(
        and(
          eq(driverCertifications.tenantId, tenantId),
          eq(driverCertifications.status, "valid"),
          gte(driverCertifications.expirationDate, now),
        ),
      );

    // Group by driver and count certifications
    const driverCertMap = new Map<
      string,
      { count: number; expiringSoon: boolean }
    >();

    for (const cert of validCerts) {
      const existing = driverCertMap.get(cert.driverId) || {
        count: 0,
        expiringSoon: false,
      };
      existing.count += 1;

      // Check if any certification expires within 30 days
      const daysUntilExpiry =
        (cert.expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
      if (daysUntilExpiry <= 30) {
        existing.expiringSoon = true;
      }

      driverCertMap.set(cert.driverId, existing);
    }

    return Array.from(driverCertMap.entries()).map(([driverId, data]) => ({
      driverId,
      validCertificationsCount: data.count,
      hasExpiringSoon: data.expiringSoon,
    }));
  }),

  /**
   * Get certification statistics for dashboard
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    
    const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    const allCerts = await db
      .select({ status: driverCertifications.status })
      .from(driverCertifications)
      .where(eq(driverCertifications.tenantId, tenantId));

    const byStatus = {
      valid: allCerts.filter((c) => c.status === "valid").length,
      expired: allCerts.filter((c) => c.status === "expired").length,
      pending_renewal: allCerts.filter((c) => c.status === "pending_renewal")
        .length,
      revoked: allCerts.filter((c) => c.status === "revoked").length,
      suspended: allCerts.filter((c) => c.status === "suspended").length,
    };

    // Count expiring in next 30 days
    const expiringSoon = await db
      .select({ id: driverCertifications.id })
      .from(driverCertifications)
      .where(
        and(
          eq(driverCertifications.tenantId, tenantId),
          eq(driverCertifications.status, "valid"),
          lte(driverCertifications.expirationDate, thirtyDaysFromNow),
          gte(driverCertifications.expirationDate, now),
        ),
      );

    return {
      total: allCerts.length,
      byStatus,
      expiringInNext30Days: expiringSoon.length,
    };
  }),

  /**
   * Update alert settings for a certification type
   */
  updateAlertSettings: adminProcedure
    .input(
      z.object({
        certificationType: z.enum([
          "drivers_license",
          "hazmat_certification",
          "safety_training",
          "first_aid",
          "vehicle_inspection",
          "weight_limit_authorization",
          "gas_handling",
        ]),
        daysBeforeExpiration: z.number().min(1).max(365).default(30),
        isEnabled: z.boolean().default(true),
        notifyAdmins: z.boolean().default(true),
        notifyDriver: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must belong to an organization",
        });
      }

      const { certificationType, ...settings } = input;

      // Upsert the settings - convert booleans to numbers for database
      await db
        .insert(certificationAlertSettings)
        .values({
          id: crypto.randomUUID(),
          tenantId,
          certificationType,
          daysBeforeExpiration: settings.daysBeforeExpiration,
          isEnabled: settings.isEnabled ? 1 : 0,
          notifyAdmins: settings.notifyAdmins ? 1 : 0,
          notifyDriver: settings.notifyDriver ? 1 : 0,
        })
        .onConflictDoUpdate({
          target: [
            certificationAlertSettings.tenantId,
            certificationAlertSettings.certificationType,
          ],
          set: {
            daysBeforeExpiration: settings.daysBeforeExpiration,
            isEnabled: settings.isEnabled ? 1 : 0,
            notifyAdmins: settings.notifyAdmins ? 1 : 0,
            notifyDriver: settings.notifyDriver ? 1 : 0,
            updatedAt: new Date(),
          },
        });

      return { success: true };
    }),

  /**
   * Get alert settings
   */
  getAlertSettings: adminProcedure.query(async ({ ctx }) => {
    
    const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const settings = await db
      .select()
      .from(certificationAlertSettings)
      .where(eq(certificationAlertSettings.tenantId, tenantId));

    return settings;
  }),
} satisfies TRPCRouterRecord;

