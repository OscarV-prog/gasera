import { TRPCError } from "@trpc/server";

/**
 * Role definitions for Gasera application
 */
export type UserRole =
  | "superadmin"
  | "admin"
  | "supervisor"
  | "operator"
  | "chofer"
  | "cliente";

/**
 * Role hierarchy - higher roles have access to lower role permissions
 */
export const roleHierarchy: Record<UserRole, number> = {
  superadmin: 100,
  admin: 80,
  supervisor: 60,
  operator: 40,
  chofer: 50,
  cliente: 10,
};

/**
 * Permission definitions
 */
export const permissions = {
  // Organization management
  "org:read": [
    "superadmin",
    "admin",
    "supervisor",
    "operator",
    "chofer",
    "cliente",
  ],
  "org:write": ["superadmin", "admin"],
  "org:delete": ["superadmin"],

  // User management
  "users:read": ["superadmin", "admin", "supervisor"],
  "users:write": ["superadmin", "admin"],
  "users:invite": ["superadmin", "admin"],

  // Vehicle management
  "vehicles:read": ["superadmin", "admin", "supervisor", "operator", "chofer"],
  "vehicles:write": ["superadmin", "admin", "supervisor"],
  "vehicles:assign": ["superadmin", "admin", "supervisor"],

  // Order management
  "orders:read": [
    "superadmin",
    "admin",
    "supervisor",
    "operator",
    "chofer",
    "cliente",
  ],
  "orders:create": [
    "superadmin",
    "admin",
    "supervisor",
    "operator",
    "chofer",
    "cliente",
  ],
  "orders:write": ["superadmin", "admin", "supervisor", "operator", "chofer"],
  "orders:delete": ["superadmin", "admin", "supervisor"],

  // Inventory management
  "inventory:read": ["superadmin", "admin", "supervisor", "operator", "chofer"],
  "inventory:write": ["superadmin", "admin", "supervisor", "operator"],
  "inventory:reconcile": ["superadmin", "admin", "supervisor"],

  // Driver routes
  "routes:read": ["superadmin", "admin", "supervisor", "operator", "chofer"],
  "routes:assign": ["superadmin", "admin", "supervisor"],
  "routes:execute": ["chofer"],

  // Reports and analytics
  "reports:read": ["superadmin", "admin", "supervisor"],
  "reports:export": ["superadmin", "admin", "supervisor"],

  // Billing
  "billing:read": ["superadmin", "admin", "supervisor", "cliente"],
  "billing:request": ["superadmin", "admin", "supervisor"],

  // Settings
  "settings:read": ["superadmin", "admin"],
  "settings:write": ["superadmin"],
} satisfies Record<string, UserRole[]>;

export type Permission = keyof typeof permissions;

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowedRoles = permissions[permission] as UserRole[];
  return allowedRoles.includes(role);
}

/**
 * Check if roleA has higher or equal privileges than roleB
 */
export function hasHigherOrEqualRole(
  roleA: UserRole,
  roleB: UserRole,
): boolean {
  return roleHierarchy[roleA] >= roleHierarchy[roleB];
}

/**
 * Middleware factory for checking permissions in tRPC procedures
 */
export function requirePermission(permission: Permission) {
  return function ({ ctx }: { ctx: { role: UserRole } }) {
    if (!hasPermission(ctx.role, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You don't have permission to perform this action. Required: ${permission}`,
      });
    }
    return true;
  };
}

/**
 * Middleware factory for checking minimum role level
 */
export function requireRole(minimumRole: UserRole) {
  return function ({ ctx }: { ctx: { role: UserRole } }) {
    if (!hasHigherOrEqualRole(ctx.role, minimumRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This action requires at least ${minimumRole} role`,
      });
    }
    return true;
  };
}

/**
 * Superadmin only check
 */
export function requireSuperadmin({ ctx }: { ctx: { role: UserRole } }) {
  if (ctx.role !== "superadmin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This action is only available to superadmins",
    });
  }
  return true;
}
