import { assetsRouter } from "./router/assets";
import { authRouter } from "./router/auth";
import { certificationsRouter } from "./router/certifications";
import { customersRouter } from "./router/customers";
import { driverRouter } from "./router/driver";
import { driversRouter } from "./router/drivers";
import { faqRouter } from "./router/faq";
import { invitationsRouter } from "./router/invitations";
import { legalRouter } from "./router/legal";
import { operationsRouter } from "./router/operations";
import { ordersRouter } from "./router/orders";
import { postRouter } from "./router/post";
import { productsRouter } from "./router/products";
import { reportsRouter } from "./router/reports";
import { routeLoadsRouter } from "./router/routeLoads";
import { superadminRouter } from "./router/superadmin";
import { trackingRouter } from "./router/tracking";
import { userRouter } from "./router/user";
import { vehiclesRouter } from "./router/vehicles";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  superadmin: superadminRouter,
  invitations: invitationsRouter,
  vehicles: vehiclesRouter,
  products: productsRouter,
  assets: assetsRouter,
  certifications: certificationsRouter,
  routeLoads: routeLoadsRouter,
  customers: customersRouter,
  faq: faqRouter,
  legal: legalRouter,
  orders: ordersRouter,
  tracking: trackingRouter,
  operations: operationsRouter,
  driver: driverRouter,
  fleetDrivers: driversRouter,
  reports: reportsRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
