import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, asc, count, desc, eq, gte, inArray, lte } from "@acme/db";
import { db } from "@acme/db/client";
import {
  billingRequests,
  customers,
  discrepancies,
  generatedReports,
  reportTypeEnum,
  returnItemTypeEnum,
  returnLoadItems,
  returnLoads,
} from "@acme/db/schema";

import {
  adminProcedure,
  protectedProcedure,
  supervisorProcedure,
} from "../trpc";

export const operationsRouter = {
  // ============================================================================
  // Story 6.1: End-of-Day Inventory Reconciliation
  // ============================================================================

  /**
   * List all return loads for current organization
   */
  listReturnLoads: supervisorProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        status: z
          .enum(["pending", "in_progress", "completed", "cancelled", "all"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { limit, cursor, dateFrom, dateTo, status } = input;

      const conditions = [eq(returnLoads.tenantId, tenantId!)];

      if (status && status !== "all") {
        conditions.push(eq(returnLoads.status, status));
      }
      if (dateFrom) {
        conditions.push(gte(returnLoads.returnDate, dateFrom));
      }
      if (dateTo) {
        conditions.push(lte(returnLoads.returnDate, dateTo));
      }

      const loads = await db
        .select({
          id: returnLoads.id,
          routeLoadId: returnLoads.routeLoadId,
          vehicleId: returnLoads.vehicleId,
          driverId: returnLoads.driverId,
          returnDate: returnLoads.returnDate,
          status: returnLoads.status,
          totalFullReturned: returnLoads.totalFullReturned,
          totalEmptyReturned: returnLoads.totalEmptyReturned,
          totalExchanged: returnLoads.totalExchanged,
          totalMissing: returnLoads.totalMissing,
          totalDamaged: returnLoads.totalDamaged,
          totalWeightFullReturned: returnLoads.totalWeightFullReturned,
          totalWeightEmptyReturned: returnLoads.totalWeightEmptyReturned,
          notes: returnLoads.notes,
          discrepancyNotes: returnLoads.discrepancyNotes,
          reconciledBy: returnLoads.reconciledBy,
          reconciledAt: returnLoads.reconciledAt,
          createdAt: returnLoads.createdAt,
        })
        .from(returnLoads)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limit + 1)
        .orderBy(desc(returnLoads.returnDate));

      let nextCursor: typeof cursor = undefined;
      if (loads.length > limit) {
        const nextItem = loads.pop();
        nextCursor = nextItem!.id;
      }

      return { loads, nextCursor };
    }),

  /**
   * Get a single return load with items
   */
  getReturnLoad: supervisorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [load] = await db
        .select({
          id: returnLoads.id,
          routeLoadId: returnLoads.routeLoadId,
          vehicleId: returnLoads.vehicleId,
          driverId: returnLoads.driverId,
          returnDate: returnLoads.returnDate,
          status: returnLoads.status,
          totalFullReturned: returnLoads.totalFullReturned,
          totalEmptyReturned: returnLoads.totalEmptyReturned,
          totalExchanged: returnLoads.totalExchanged,
          totalMissing: returnLoads.totalMissing,
          totalDamaged: returnLoads.totalDamaged,
          totalWeightFullReturned: returnLoads.totalWeightFullReturned,
          totalWeightEmptyReturned: returnLoads.totalWeightEmptyReturned,
          notes: returnLoads.notes,
          discrepancyNotes: returnLoads.discrepancyNotes,
          reconciledBy: returnLoads.reconciledBy,
          reconciledAt: returnLoads.reconciledAt,
          createdAt: returnLoads.createdAt,
        })
        .from(returnLoads)
        .where(
          and(
            eq(returnLoads.id, input.id),
            eq(returnLoads.tenantId, tenantId!),
          ),
        )
        .limit(1);

      if (!load) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Return load not found",
        });
      }

      const items = await db
        .select({
          id: returnLoadItems.id,
          orderId: returnLoadItems.orderId,
          itemType: returnLoadItems.itemType,
          assetType: returnLoadItems.assetType,
          subtype: returnLoadItems.subtype,
          serialNumber: returnLoadItems.serialNumber,
          quantity: returnLoadItems.quantity,
          weightPerUnit: returnLoadItems.weightPerUnit,
          totalWeight: returnLoadItems.totalWeight,
          notes: returnLoadItems.notes,
          createdAt: returnLoadItems.createdAt,
        })
        .from(returnLoadItems)
        .where(eq(returnLoadItems.returnLoadId, input.id))
        .orderBy(asc(returnLoadItems.createdAt));

      return { load, items };
    }),

  /**
   * Create a new return load
   */
  createReturnLoad: supervisorProcedure
    .input(
      z.object({
        routeLoadId: z.string(),
        vehicleId: z.string(),
        driverId: z.string().optional(),
        returnDate: z.date(),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            orderId: z.string().optional(),
            itemType: z.enum([
              "full",
              "empty",
              "exchange",
              "missing",
              "damaged",
            ]),
            assetType: z.string().optional(),
            subtype: z.string().optional(),
            serialNumber: z.string().optional(),
            quantity: z.number().positive(),
            weightPerUnit: z.number().optional(),
            totalWeight: z.number(),
            notes: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const returnLoadId = `rl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      // Calculate totals
      const totalFullReturned = input.items
        .filter((i) => i.itemType === "full")
        .reduce((acc, i) => acc + i.quantity, 0);
      const totalEmptyReturned = input.items
        .filter((i) => i.itemType === "empty")
        .reduce((acc, i) => acc + i.quantity, 0);
      const totalExchanged = input.items
        .filter((i) => i.itemType === "exchange")
        .reduce((acc, i) => acc + i.quantity, 0);
      const totalMissing = input.items
        .filter((i) => i.itemType === "missing")
        .reduce((acc, i) => acc + i.quantity, 0);
      const totalDamaged = input.items
        .filter((i) => i.itemType === "damaged")
        .reduce((acc, i) => acc + i.quantity, 0);

      const totalWeightFullReturned = input.items
        .filter((i) => i.itemType === "full")
        .reduce((acc, i) => acc + i.totalWeight, 0);
      const totalWeightEmptyReturned = input.items
        .filter((i) => i.itemType === "empty")
        .reduce((acc, i) => acc + i.totalWeight, 0);

      // Insert return load
      await db.insert(returnLoads).values({
        id: returnLoadId,
        tenantId: tenantId!,
        routeLoadId: input.routeLoadId,
        vehicleId: input.vehicleId,
        driverId: input.driverId,
        returnDate: input.returnDate,
        status: "pending",
        totalFullReturned,
        totalEmptyReturned,
        totalExchanged,
        totalMissing,
        totalDamaged,
        totalWeightFullReturned,
        totalWeightEmptyReturned,
        notes: input.notes,
      });

      // Insert items
      for (const item of input.items) {
        const itemId = `rli_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        await db.insert(returnLoadItems).values({
          id: itemId,
          tenantId: tenantId!,
          returnLoadId,
          orderId: item.orderId,
          itemType: item.itemType,
          assetType: item.assetType,
          subtype: item.subtype,
          serialNumber: item.serialNumber,
          quantity: item.quantity,
          weightPerUnit: item.weightPerUnit,
          totalWeight: item.totalWeight,
          notes: item.notes,
        });
      }

      return { id: returnLoadId };
    }),

  /**
   * Complete a return load
   */
  completeReturnLoad: supervisorProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["completed", "cancelled"]),
        discrepancyNotes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = ctx.session?.user?.id;

      const [existing] = await db
        .select()
        .from(returnLoads)
        .where(
          and(
            eq(returnLoads.id, input.id),
            eq(returnLoads.tenantId, tenantId!),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Return load not found",
        });
      }

      await db
        .update(returnLoads)
        .set({
          status: input.status,
          discrepancyNotes: input.discrepancyNotes,
          reconciledBy: userId,
          reconciledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(returnLoads.id, input.id));

      return { success: true };
    }),

  // ============================================================================
  // Discrepancy Management
  // ============================================================================

  /**
   * List all discrepancies
   */
  listDiscrepancies: supervisorProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        status: z
          .enum(["pending", "investigating", "resolved", "written_off", "all"])
          .optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { limit, cursor, status, dateFrom, dateTo } = input;

      const conditions = [eq(discrepancies.tenantId, tenantId!)];

      if (status && status !== "all") {
        conditions.push(eq(discrepancies.status, status));
      }
      if (dateFrom) {
        conditions.push(gte(discrepancies.createdAt, dateFrom));
      }
      if (dateTo) {
        conditions.push(lte(discrepancies.createdAt, dateTo));
      }

      const results = await db
        .select({
          id: discrepancies.id,
          returnLoadId: discrepancies.returnLoadId,
          orderId: discrepancies.orderId,
          type: discrepancies.type,
          assetType: discrepancies.assetType,
          serialNumber: discrepancies.serialNumber,
          expectedQuantity: discrepancies.expectedQuantity,
          actualQuantity: discrepancies.actualQuantity,
          discrepancyQuantity: discrepancies.discrepancyQuantity,
          status: discrepancies.status,
          resolutionNotes: discrepancies.resolutionNotes,
          resolvedBy: discrepancies.resolvedBy,
          resolvedAt: discrepancies.resolvedAt,
          estimatedValue: discrepancies.estimatedValue,
          createdAt: discrepancies.createdAt,
        })
        .from(discrepancies)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limit + 1)
        .orderBy(desc(discrepancies.createdAt));

      let nextCursor: typeof cursor = undefined;
      if (results.length > limit) {
        const nextItem = results.pop();
        nextCursor = nextItem!.id;
      }

      return { discrepancies: results, nextCursor };
    }),

  /**
   * Create a new discrepancy
   */
  createDiscrepancy: supervisorProcedure
    .input(
      z.object({
        returnLoadId: z.string().optional(),
        orderId: z.string().optional(),
        type: z.enum([
          "missing_asset",
          "weight_mismatch",
          "damaged_asset",
          "over_inventory",
          "other",
        ]),
        assetType: z.string().optional(),
        serialNumber: z.string().optional(),
        expectedQuantity: z.number().optional(),
        actualQuantity: z.number().optional(),
        discrepancyQuantity: z.number(),
        estimatedValue: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const discrepancyId = `disc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      await db.insert(discrepancies).values({
        id: discrepancyId,
        tenantId: tenantId!,
        returnLoadId: input.returnLoadId,
        orderId: input.orderId,
        type: input.type,
        assetType: input.assetType,
        serialNumber: input.serialNumber,
        expectedQuantity: input.expectedQuantity,
        actualQuantity: input.actualQuantity,
        discrepancyQuantity: input.discrepancyQuantity,
        status: "pending",
        estimatedValue: input.estimatedValue,
      });

      return { id: discrepancyId };
    }),

  /**
   * Resolve a discrepancy
   */
  resolveDiscrepancy: supervisorProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["resolved", "written_off"]),
        resolutionNotes: z.string().optional(),
        estimatedValue: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = ctx.session?.user?.id;

      const [existing] = await db
        .select()
        .from(discrepancies)
        .where(
          and(
            eq(discrepancies.id, input.id),
            eq(discrepancies.tenantId, tenantId!),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Discrepancy not found",
        });
      }

      await db
        .update(discrepancies)
        .set({
          status: input.status,
          resolutionNotes: input.resolutionNotes,
          resolvedBy: userId,
          resolvedAt: new Date(),
          estimatedValue: input.estimatedValue ?? existing.estimatedValue,
        })
        .where(eq(discrepancies.id, input.id));

      return { success: true };
    }),

  // ============================================================================
  // Story 6.2: Billing & CFDI Request Management
  // ============================================================================

  /**
   * List all billing requests
   */
  listBillingRequests: supervisorProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        status: z
          .enum([
            "requested",
            "pending",
            "approved",
            "issued",
            "delivered",
            "cancelled",
            "rejected",
            "all",
          ])
          .optional(),
        customerId: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { limit, cursor, status, customerId, dateFrom, dateTo } = input;

      // Return empty if no tenant (user not fully set up)
      if (!tenantId) {
        return { data: [], total: 0, hasMore: false };
      }

      const conditions = [eq(billingRequests.tenantId, tenantId)];

      if (status && status !== "all") {
        conditions.push(eq(billingRequests.status, status));
      }
      if (customerId) {
        conditions.push(eq(billingRequests.customerId, customerId));
      }
      if (dateFrom) {
        conditions.push(gte(billingRequests.requestDate, dateFrom));
      }
      if (dateTo) {
        conditions.push(lte(billingRequests.requestDate, dateTo));
      }

      const results = await db
        .select({
          id: billingRequests.id,
          customerId: billingRequests.customerId,
          orderId: billingRequests.orderId,
          requestDate: billingRequests.requestDate,
          taxId: billingRequests.taxId,
          businessName: billingRequests.businessName,
          cfdiUse: billingRequests.cfdiUse,
          email: billingRequests.email,
          subtotal: billingRequests.subtotal,
          taxAmount: billingRequests.taxAmount,
          totalAmount: billingRequests.totalAmount,
          status: billingRequests.status,
          invoiceNumber: billingRequests.invoiceNumber,
          invoiceDate: billingRequests.invoiceDate,
          pdfUrl: billingRequests.pdfUrl,
          xmlUrl: billingRequests.xmlUrl,
          processedBy: billingRequests.processedBy,
          processedAt: billingRequests.processedAt,
          notes: billingRequests.notes,
          createdAt: billingRequests.createdAt,
        })
        .from(billingRequests)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limit + 1)
        .orderBy(desc(billingRequests.requestDate));

      let nextCursor: typeof cursor = undefined;
      if (results.length > limit) {
        const nextItem = results.pop();
        nextCursor = nextItem!.id;
      }

      // Fetch customer names
      const customerIds = [...new Set(results.map((r) => r.customerId))];
      const customerData = await db
        .select({
          id: customers.id,
          businessName: customers.businessName,
          tradeName: customers.tradeName,
        })
        .from(customers)
        .where(inArray(customers.id, customerIds));

      const customerMap = new Map(
        customerData.map((c) => [
          c.id,
          c.tradeName || c.businessName || "Unknown",
        ]),
      );

      const requestsWithCustomer = results.map((r) => ({
        ...r,
        customerName: customerMap.get(r.customerId) || "Unknown",
      }));

      return { requests: requestsWithCustomer, nextCursor };
    }),

  /**
   * Create a billing request
   */
  createBillingRequest: supervisorProcedure
    .input(
      z.object({
        customerId: z.string(),
        orderId: z.string().optional(),
        taxId: z.string(), // RFC
        businessName: z.string(), // Razón social
        taxRegime: z.string().optional(),
        cfdiUse: z.enum([
          "G01",
          "G02",
          "G03",
          "I01",
          "I02",
          "I03",
          "I04",
          "I05",
          "I06",
          "I07",
          "I08",
        ]),
        email: z.string().email(),
        subtotal: z.number().nonnegative(),
        taxAmount: z.number().nonnegative().optional(),
        totalAmount: z.number().nonnegative(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const requestId = `br_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      await db.insert(billingRequests).values({
        id: requestId,
        tenantId: tenantId!,
        customerId: input.customerId,
        orderId: input.orderId,
        taxId: input.taxId,
        businessName: input.businessName,
        taxRegime: input.taxRegime,
        cfdiUse: input.cfdiUse,
        email: input.email,
        subtotal: input.subtotal,
        taxAmount: input.taxAmount ?? Math.round(input.subtotal * 0.16),
        totalAmount: input.totalAmount,
        status: "requested",
        notes: input.notes,
      });

      return { id: requestId };
    }),

  /**
   * Approve a billing request for invoicing
   */
  approveBillingRequest: adminProcedure
    .input(z.object({ id: z.string(), invoiceNumber: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = ctx.session?.user?.id;

      const [existing] = await db
        .select()
        .from(billingRequests)
        .where(
          and(
            eq(billingRequests.id, input.id),
            eq(billingRequests.tenantId, tenantId!),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Billing request not found",
        });
      }

      if (existing.status !== "requested" && existing.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Billing request cannot be approved in current status",
        });
      }

      await db
        .update(billingRequests)
        .set({
          status: "approved",
          invoiceNumber: input.invoiceNumber,
          processedBy: userId,
          processedAt: new Date(),
        })
        .where(eq(billingRequests.id, input.id));

      return { success: true };
    }),

  /**
   * Mark billing request as issued (invoice generated)
   */
  issueBillingRequest: adminProcedure
    .input(
      z.object({
        id: z.string(),
        invoiceNumber: z.string(),
        invoiceDate: z.date().optional(),
        pdfUrl: z.string().optional(),
        xmlUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [existing] = await db
        .select()
        .from(billingRequests)
        .where(
          and(
            eq(billingRequests.id, input.id),
            eq(billingRequests.tenantId, tenantId!),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Billing request not found",
        });
      }

      await db
        .update(billingRequests)
        .set({
          status: "issued",
          invoiceNumber: input.invoiceNumber,
          invoiceDate: input.invoiceDate,
          pdfUrl: input.pdfUrl,
          xmlUrl: input.xmlUrl,
        })
        .where(eq(billingRequests.id, input.id));

      return { success: true };
    }),

  /**
   * Mark billing request as delivered to customer
   */
  deliverBillingRequest: supervisorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .update(billingRequests)
        .set({ status: "delivered" })
        .where(
          and(
            eq(billingRequests.id, input.id),
            eq(billingRequests.tenantId, tenantId!),
          ),
        );

      return { success: true };
    }),

  /**
   * Reject a billing request
   */
  rejectBillingRequest: adminProcedure
    .input(z.object({ id: z.string(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .update(billingRequests)
        .set({
          status: "rejected",
          notes: input.notes,
        })
        .where(
          and(
            eq(billingRequests.id, input.id),
            eq(billingRequests.tenantId, tenantId!),
          ),
        );

      return { success: true };
    }),

  // ============================================================================
  // Story 6.3: Administrative BI & Exportable Reports
  // ============================================================================

  /**
   * List all report types available
   */
  getReportTypes: protectedProcedure.query(async () => {
    return [
      {
        id: "sales_by_product",
        name: "Ventas por Producto",
        description: "Resumen de ventas por tipo de producto",
      },
      {
        id: "sales_by_driver",
        name: "Ventas por Conductor",
        description: "Ventas realizadas por cada conductor",
      },
      {
        id: "sales_by_period",
        name: "Ventas por Período",
        description: "Resumen de ventas por período",
      },
      {
        id: "driver_performance",
        name: "Rendimiento de Conductores",
        description: "Estadísticas de desempeño por conductor",
      },
      {
        id: "inventory_turn",
        name: "Rotación de Inventario",
        description: "Análisis de rotación de inventario",
      },
      {
        id: "delivery_summary",
        name: "Resumen de Entregas",
        description: "Resumen de entregas realizadas",
      },
      {
        id: "reconciliation",
        name: "Conciliación",
        description: "Conciliación de inventario",
      },
      {
        id: "financial_summary",
        name: "Resumen Financiero",
        description: "Resumen financiero general",
      },
    ];
  }),

  /**
   * Request a new report generation
   */
  generateReport: supervisorProcedure
    .input(
      z.object({
        reportType: z.enum([
          "sales_by_product",
          "sales_by_driver",
          "sales_by_period",
          "driver_performance",
          "inventory_turn",
          "delivery_summary",
          "reconciliation",
          "financial_summary",
        ]),
        reportName: z.string().min(3).max(100),
        dateFrom: z.date(),
        dateTo: z.date(),
        format: z.enum(["pdf", "csv", "xlsx"]).default("pdf"),
        filters: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = ctx.session?.user?.id;

      const reportId = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      await db.insert(generatedReports).values({
        id: reportId,
        tenantId: tenantId!,
        reportType: input.reportType,
        reportName: input.reportName,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        format: input.format,
        filters: input.filters,
        status: "generating",
        generatedBy: userId,
      });

      // In a real implementation, this would trigger an async job
      // For now, we just return the report ID
      return { id: reportId };
    }),

  /**
   * List generated reports
   */
  listGeneratedReports: supervisorProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        status: z.enum(["generating", "completed", "failed", "all"]).optional(),
        reportType: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { limit, cursor, status, reportType } = input;

      const conditions = [eq(generatedReports.tenantId, tenantId!)];

      if (status && status !== "all") {
        conditions.push(eq(generatedReports.status, status));
      }
      if (reportType) {
        // @ts-ignore - Filtering by report type
        conditions.push(eq(generatedReports.reportType, reportType));
      }

      const results = await db
        .select({
          id: generatedReports.id,
          reportType: generatedReports.reportType,
          reportName: generatedReports.reportName,
          dateFrom: generatedReports.dateFrom,
          dateTo: generatedReports.dateTo,
          format: generatedReports.format,
          status: generatedReports.status,
          fileUrl: generatedReports.fileUrl,
          fileSize: generatedReports.fileSize,
          totalRecords: generatedReports.totalRecords,
          totalAmount: generatedReports.totalAmount,
          generatedBy: generatedReports.generatedBy,
          generatedAt: generatedReports.generatedAt,
          expiresAt: generatedReports.expiresAt,
        })
        .from(generatedReports)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limit + 1)
        .orderBy(desc(generatedReports.generatedAt));

      let nextCursor: typeof cursor = undefined;
      if (results.length > limit) {
        const nextItem = results.pop();
        nextCursor = nextItem!.id;
      }

      return { reports: results, nextCursor };
    }),

  /**
   * Get report generation status
   */
  getReportStatus: supervisorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      
      const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [report] = await db
        .select({
          id: generatedReports.id,
          status: generatedReports.status,
          fileUrl: generatedReports.fileUrl,
          fileSize: generatedReports.fileSize,
          generatedAt: generatedReports.generatedAt,
          expiresAt: generatedReports.expiresAt,
        })
        .from(generatedReports)
        .where(
          and(
            eq(generatedReports.id, input.id),
            eq(generatedReports.tenantId, tenantId!),
          ),
        )
        .limit(1);

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      return report;
    }),

  /**
   * Get dashboard summary
   */
  getDashboardSummary: supervisorProcedure.query(async ({ ctx }) => {
    
    const tenantId = ctx.session.user.tenantId; if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's return loads count
    const [todayReturnLoads] = await db
      .select({ count: count() })
      .from(returnLoads)
      .where(
        and(
          eq(returnLoads.tenantId, tenantId!),
          gte(returnLoads.createdAt, today),
        ),
      );

    // Get pending discrepancies count
    const [pendingDiscrepancies] = await db
      .select({ count: count() })
      .from(discrepancies)
      .where(
        and(
          eq(discrepancies.tenantId, tenantId!),
          eq(discrepancies.status, "pending"),
        ),
      );

    // Get pending billing requests count
    const [pendingBillingRequests] = await db
      .select({ count: count() })
      .from(billingRequests)
      .where(
        and(
          eq(billingRequests.tenantId, tenantId!),
          eq(billingRequests.status, "requested"),
        ),
      );

    // Get recent reports count
    const [recentReports] = await db
      .select({ count: count() })
      .from(generatedReports)
      .where(
        and(
          eq(generatedReports.tenantId, tenantId!),
          gte(generatedReports.generatedAt, today),
        ),
      );

    return {
      todayReturnLoads: Number(todayReturnLoads?.count ?? 0),
      pendingDiscrepancies: Number(pendingDiscrepancies?.count ?? 0),
      pendingBillingRequests: Number(pendingBillingRequests?.count ?? 0),
      recentReports: Number(recentReports?.count ?? 0),
    };
  }),
};

