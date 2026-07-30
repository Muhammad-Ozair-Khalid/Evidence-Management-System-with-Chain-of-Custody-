import { Role } from "@prisma/client";

export type Action =
  | "evidence:view"
  | "evidence:register"
  | "custody:create"
  | "custody:view"
  | "integrity:rehash"
  | "integrity:resolve"
  | "audit:view"
  | "reports:generate"
  | "users:view"
  | "users:manage"
  | "dashboard:view";

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Action>> = {
  CUSTODIAN: new Set<Action>([
    "dashboard:view",
    "evidence:view",
    "custody:view",
    "custody:create",
  ]),
  EXAMINER: new Set<Action>([
    "dashboard:view",
    "evidence:view",
    "evidence:register",
    "custody:view",
    "custody:create",
    "integrity:rehash",
    "reports:generate",
  ]),
  SUPERVISOR: new Set<Action>([
    "dashboard:view",
    "evidence:view",
    "evidence:register",
    "custody:view",
    "custody:create",
    "integrity:rehash",
    "integrity:resolve",
    "audit:view",
    "reports:generate",
  ]),
  // User management is ADMIN-only (users:view + users:manage).
  ADMIN: new Set<Action>([
    "dashboard:view",
    "evidence:view",
    "evidence:register",
    "custody:view",
    "custody:create",
    "integrity:rehash",
    "integrity:resolve",
    "audit:view",
    "reports:generate",
    "users:view",
    "users:manage",
  ]),
};

export function can(role: Role, action: Action): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

export function assertCan(role: Role, action: Action): void {
  if (!can(role, action)) {
    throw new RbacError(
      `Forbidden: role ${role} cannot perform "${action}".`
    );
  }
}

export class RbacError extends Error {
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = "RbacError";
  }
}

/** Route prefix → minimum permission required to enter the page. */
export const ROUTE_PERMISSIONS: { prefix: string; action: Action }[] = [
  { prefix: "/admin", action: "users:view" },
  { prefix: "/audit", action: "audit:view" },
  { prefix: "/reports", action: "reports:generate" },
  { prefix: "/integrity", action: "integrity:rehash" },
  { prefix: "/evidence", action: "evidence:view" },
  { prefix: "/custody", action: "custody:view" },
  { prefix: "/settings", action: "dashboard:view" },
  { prefix: "/dashboard", action: "dashboard:view" },
];

export function requiredActionForPath(pathname: string): Action | null {
  const match = ROUTE_PERMISSIONS.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`)
  );
  return match?.action ?? "dashboard:view";
}
