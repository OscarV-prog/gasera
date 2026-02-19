/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { Auth } from "@acme/auth";
import { eq, organizations, user } from "@acme/db";
import { db } from "@acme/db/client";

/**
 * 1. CONTEXT
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: Auth;
}) => {
  const authApi = opts.auth.api;
  const session = await authApi.getSession({ headers: opts.headers });

  if (session?.user) {
    // Fallback: If tenantId is missing in session, fetch it from DB
    if (!session.user.tenantId) {
      const [dbUser] = await db
        .select({ tenantId: user.tenantId, role: user.role })
        .from(user)
        .where(eq(user.id, session.user.id));

      if (dbUser) {
        if (dbUser.tenantId) {
          session.user.tenantId = dbUser.tenantId;
        } else {
          // Extra fallback: If user still has no tenant, assign them to the first available organization
          let [firstOrg] = await db
            .select({ id: organizations.id })
            .from(organizations)
            .limit(1);

          if (!firstOrg) {
            const orgId = `org_${Date.now()}`;
            await db.insert(organizations).values({
              id: orgId,
              name: "Organización por Defecto",
              contactEmail: "admin@gasera.com",
            });
            firstOrg = { id: orgId };
            console.log("[TRPC Context] Created default organization:", orgId);
          }

          if (firstOrg) {
            console.log(
              "[TRPC Context] Auto-assigning user to organization:",
              firstOrg.id,
            );
            session.user.tenantId = firstOrg.id;
            // Persist the assignment in DB
            await db
              .update(user)
              .set({ tenantId: firstOrg.id })
              .where(eq(user.id, session.user.id));
          }
        }
        if (dbUser.role) {
          session.user.role = dbUser.role as string;
        } else {
          // Default role for development if none found
          session.user.role = "admin";
          console.log("[TRPC Context] Assigning default 'admin' role to user");
        }
      }
    }

    console.log("[TRPC Context] User:", {
      id: session.user.id,
      email: session.user.email,
      tenantId: session.user.tenantId,
      role: session.user.role,
    });
  }
  return { authApi, session, db };
};

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? (error.cause as ZodError<Record<string, unknown>>).flatten()
          : null,
    },
  }),
});

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({
      ctx: { session: { ...ctx.session, user: ctx.session.user } },
    });
  });

export const superadminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session?.user?.role !== "superadmin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Superadmin only" });
  }
  return next({ ctx });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const role = ctx.session?.user?.role;
  if (!["superadmin", "admin"].includes(role ?? "")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
  return next({ ctx });
});

export const supervisorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const role = ctx.session?.user?.role;
  if (!["superadmin", "admin", "supervisor"].includes(role ?? "")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Supervisor or higher required",
    });
  }
  return next({ ctx });
});

export const operatorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const role = ctx.session?.user?.role;
  if (
    !["superadmin", "admin", "supervisor", "operator", "chofer"].includes(
      role ?? "",
    )
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Operator or higher required",
    });
  }
  return next({ ctx });
});
