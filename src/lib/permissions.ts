import { getSession } from "@/lib/auth";
import { assertCan, RbacError, type Action } from "@/lib/rbac";
import { type Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  role: Role;
  name: string;
  email: string;
};

/**
 * Resolve the current session and assert the caller may perform `action`.
 * Throws RbacError (403) or Error (401) — catch in server actions / route handlers.
 */
export async function requirePermission(action: Action): Promise<SessionUser> {
  const session = await getSession();
  if (!session?.user?.id || !session.user.role) {
    throw new Error("Unauthorized: sign in required.");
  }

  try {
    assertCan(session.user.role, action);
  } catch (err) {
    if (err instanceof RbacError) throw err;
    throw err;
  }

  return {
    id: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
  };
}

export function rbacErrorResponse(err: unknown): Response {
  if (err instanceof RbacError) {
    return Response.json({ error: err.message }, { status: 403 });
  }
  if (err instanceof Error && err.message.startsWith("Unauthorized")) {
    return Response.json({ error: err.message }, { status: 401 });
  }
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
