import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, ilike, or, sql } from "@acme/db";
import { db } from "@acme/db/client";
import {
  customerAddresses,
  customerContacts,
  customers,
  orders,
} from "@acme/db/schema";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  supervisorProcedure,
} from "../trpc";

/**
 * Customer Router - Story 3.1: Customer CRM & Delivery Addresses
 * Manages customers, their addresses, and contact persons
 */
export const customersRouter = createTRPCRouter({
  /**
   * List customers with pagination and search
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, search } = input;

      const tenantId = ctx.session.user.tenantId;

      // If user doesn't have a tenant yet, return empty list
      if (!tenantId) {
        return {
          data: [],
          total: 0,
          totalPages: 0,
        };
      }

      const filters: any[] = [eq(customers.tenantId, tenantId)];

      if (search) {
        filters.push(
          or(
            ilike(customers.businessName, `%${search}%`),
            ilike(customers.email, `%${search}%`),
            ilike(customers.customerCode, `%${search}%`),
            ilike(customers.phone, `%${search}%`),
          ),
        );
      }

      const [total] = await db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(and(...filters));

      const items = await db
        .select({
          id: customers.id,
          customerCode: customers.customerCode,
          businessName: customers.businessName,
          tradeName: customers.tradeName,
          email: customers.email,
          phone: customers.phone,
          customerType: customers.customerType,
          status: customers.status,
          createdAt: customers.createdAt,
          totalOrders:
            sql<number>`(SELECT count(*) FROM ${orders} WHERE ${orders.customerId} = ${customers.id})`.mapWith(
              Number,
            ),
          totalAddresses:
            sql<number>`(SELECT count(*) FROM ${customerAddresses} WHERE ${customerAddresses.customerId} = ${customers.id})`.mapWith(
              Number,
            ),
        })
        .from(customers)
        .where(and(...filters))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(customers.createdAt));

      return {
        data: items,
        total: Number(total?.count ?? 0),
        totalPages: Math.ceil(Number(total?.count ?? 0) / limit),
      };
    }),

  /**
   * Get customer by ID with addresses and contacts
   */
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const customer = await db.query.customers.findFirst({
        where: and(
          eq(customers.id, input.id),
          eq(customers.tenantId, tenantId),
        ),
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cliente no encontrado",
        });
      }

      // Manual selection of relations if standard with is not fully ready
      const addresses = await db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, input.id));

      const contacts = await db
        .select()
        .from(customerContacts)
        .where(eq(customerContacts.customerId, input.id));

      return {
        ...customer,
        addresses,
        contacts,
      };
    }),

  /**
   * List addresses for a specific customer
   */
  listAddresses: protectedProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, input.customerId))
        .orderBy(
          desc(customerAddresses.isDefaultDelivery),
          desc(customerAddresses.createdAt),
        );
    }),

  /**
   * Create new customer
   */
  create: protectedProcedure
    .input(
      z.object({
        customerCode: z.string().optional(),
        customerType: z.enum(["residential", "corporate", "government"]),
        businessName: z.string().optional(),
        tradeName: z.string().optional(),
        email: z.string().email(),
        phone: z.string(),
        alternatePhone: z.string().optional(),
        taxId: z.string().optional(),
        notes: z.string().optional(),
        addresses: z
          .array(
            z.object({
              street: z.string(),
              externalNumber: z.string(),
              internalNumber: z.string().optional(),
              neighborhood: z.string(),
              municipality: z.string(),
              postalCode: z.string(),
              city: z.string(),
              state: z.string(),
              country: z.string().default("México"),
              isDefaultDelivery: z.boolean().default(false),
              isDefaultBilling: z.boolean().default(false),
              nickname: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();

      const tenantId = ctx.session.user.tenantId;

      console.log("[Customers Router] Creating customer:", {
        userId: ctx.session.user.id,
        tenantId,
        inputEmail: input.email,
      });

      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "No se pudo identificar el Tenant ID (Organización). Por favor, asegúrate de estar dentro de una organización activa.",
        });
      }

      // Auto-generate code if not provided
      const customerCode =
        input.customerCode ||
        `CUST-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      const result = await db.transaction(async (tx) => {
        const [newCustomer] = await tx
          .insert(customers)
          .values({
            id,
            tenantId,
            customerCode,
            customerType: input.customerType,
            businessName: input.businessName,
            tradeName: input.tradeName,
            email: input.email,
            phone: input.phone,
            alternatePhone: input.alternatePhone,
            taxId: input.taxId,
            notes: input.notes,
            createdBy: ctx.session.user.id,
          })
          .returning();

        if (input.addresses && input.addresses.length > 0) {
          await tx.insert(customerAddresses).values(
            input.addresses.map((addr) => ({
              id: crypto.randomUUID(),
              tenantId,
              customerId: id,
              street: addr.street,
              externalNumber: addr.externalNumber,
              internalNumber: addr.internalNumber,
              neighborhood: addr.neighborhood,
              municipality: addr.municipality,
              postalCode: addr.postalCode,
              city: addr.city,
              state: addr.state,
              country: addr.country,
              isDefaultDelivery: addr.isDefaultDelivery ? 1 : 0,
              isDefaultBilling: addr.isDefaultBilling ? 1 : 0,
              nickname: addr.nickname,
            })),
          );
        }

        return newCustomer;
      });

      return result;
    }),

  /**
   * Add address to customer
   */
  addAddress: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        street: z.string(),
        externalNumber: z.string(),
        internalNumber: z.string().optional(),
        neighborhood: z.string(),
        municipality: z.string(),
        postalCode: z.string(),
        city: z.string(),
        state: z.string(),
        country: z.string().default("México"),
        isDefaultDelivery: z.boolean().default(false),
        isDefaultBilling: z.boolean().default(false),
        nickname: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();

      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // If this address is default, unset others (simplified for now)
      if (input.isDefaultDelivery) {
        await db
          .update(customerAddresses)
          .set({ isDefaultDelivery: 0 })
          .where(eq(customerAddresses.customerId, input.customerId));
      }

      const [newAddress] = await db
        .insert(customerAddresses)
        .values({
          id,
          tenantId,
          customerId: input.customerId,
          street: input.street,
          externalNumber: input.externalNumber,
          internalNumber: input.internalNumber,
          neighborhood: input.neighborhood,
          municipality: input.municipality,
          postalCode: input.postalCode,
          city: input.city,
          state: input.state,
          country: input.country,
          isDefaultDelivery: input.isDefaultDelivery ? 1 : 0,
          isDefaultBilling: input.isDefaultBilling ? 1 : 0,
          nickname: input.nickname,
          latitude: input.latitude,
          longitude: input.longitude,
        })
        .returning();

      return newAddress;
    }),

  /**
   * Update customer
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        businessName: z.string().optional().or(z.literal("")),
        tradeName: z.string().optional().or(z.literal("")),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional().or(z.literal("")),
        status: z
          .enum(["active", "inactive", "suspended", "prospect"])
          .optional(),
        customerType: z
          .enum(["residential", "corporate", "government"])
          .optional(),
        alternatePhone: z.string().optional().or(z.literal("")),
        taxId: z.string().optional().or(z.literal("")),
        notes: z.string().optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;

      const [updated] = await db
        .update(customers)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
        .returning();

      return updated;
    }),

  /**
   * Delete customer
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const existing = await db.query.customers.findFirst({
        where: and(
          eq(customers.id, input.id),
          eq(customers.tenantId, tenantId),
        ),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cliente no encontrado",
        });
      }

      await db
        .delete(customers)
        .where(
          and(eq(customers.id, input.id), eq(customers.tenantId, tenantId)),
        );

      return { success: true };
    }),
});
