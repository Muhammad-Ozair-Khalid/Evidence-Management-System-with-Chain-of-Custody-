"use server";

import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { Role, type Prisma } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { SYSTEM_AUDIT_EMAIL } from "@/lib/audit";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { RbacError } from "@/lib/rbac";

export type ActionResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

const ROLES = new Set<string>(Object.values(Role));

function generateTempPassword(): string {
  // 16 chars, URL-safe-ish; shown once to the admin.
  return randomBytes(12).toString("base64url").slice(0, 16);
}

function parseRole(raw: FormDataEntryValue | null): Role | null {
  if (typeof raw !== "string" || !ROLES.has(raw)) return null;
  return raw as Role;
}

/** Create a user. Returns the one-time temp password (never stored in plaintext). */
export async function createUser(
  formData: FormData
): Promise<ActionResult<{ userId: string; tempPassword: string; email: string }>> {
  try {
    const actor = await requirePermission("users:manage");

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .toLowerCase()
      .trim();
    const badgeNumber =
      String(formData.get("badgeNumber") ?? "").trim() || null;
    const role = parseRole(formData.get("role"));

    if (!name || name.length < 2) {
      return { ok: false, error: "Name must be at least 2 characters." };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Enter a valid email address." };
    }
    if (!role) {
      return { ok: false, error: "Select a valid role." };
    }
    if (email === SYSTEM_AUDIT_EMAIL) {
      return { ok: false, error: "That email is reserved for the system actor." };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "A user with that email already exists." };
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await hash(tempPassword, 12);

    const created = await prisma.user.create({
      data: {
        name,
        email,
        badgeNumber,
        role,
        passwordHash,
        isActive: true,
      },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: "USER_CREATED",
      entityType: "User",
      entityId: created.id,
      metadata: {
        name: created.name,
        email: created.email,
        role: created.role,
        badgeNumber: created.badgeNumber,
        createdBy: actor.email,
      } satisfies Prisma.InputJsonValue,
    });

    return {
      ok: true,
      userId: created.id,
      tempPassword,
      email: created.email,
    };
  } catch (err) {
    if (err instanceof RbacError) {
      return { ok: false, error: err.message };
    }
    console.error("createUser failed", err);
    return { ok: false, error: "Failed to create user." };
  }
}

/** Update name / badge / role for an existing user. */
export async function updateUser(
  formData: FormData
): Promise<ActionResult> {
  try {
    const actor = await requirePermission("users:manage");

    const userId = String(formData.get("userId") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const badgeNumber =
      String(formData.get("badgeNumber") ?? "").trim() || null;
    const role = parseRole(formData.get("role"));

    if (!userId) return { ok: false, error: "Missing user id." };
    if (!name || name.length < 2) {
      return { ok: false, error: "Name must be at least 2 characters." };
    }
    if (!role) return { ok: false, error: "Select a valid role." };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { ok: false, error: "User not found." };
    if (target.email === SYSTEM_AUDIT_EMAIL) {
      return { ok: false, error: "The system actor cannot be edited." };
    }

    // Prevent locking yourself out of the last ADMIN seat.
    if (
      target.id === actor.id &&
      target.role === "ADMIN" &&
      role !== "ADMIN"
    ) {
      return {
        ok: false,
        error: "You cannot demote your own ADMIN role.",
      };
    }

    const roleChanged = target.role !== role;
    const profileChanged =
      target.name !== name || (target.badgeNumber ?? null) !== badgeNumber;

    if (!roleChanged && !profileChanged) {
      return { ok: true };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name, badgeNumber, role },
    });

    if (roleChanged) {
      await writeAuditLog({
        actorId: actor.id,
        action: "USER_ROLE_CHANGED",
        entityType: "User",
        entityId: userId,
        metadata: {
          email: target.email,
          previousRole: target.role,
          newRole: role,
          changedBy: actor.email,
        },
      });
    }

    if (profileChanged) {
      await writeAuditLog({
        actorId: actor.id,
        action: "USER_UPDATED",
        entityType: "User",
        entityId: userId,
        metadata: {
          email: target.email,
          previousName: target.name,
          newName: name,
          previousBadge: target.badgeNumber,
          newBadge: badgeNumber,
          changedBy: actor.email,
        },
      });
    }

    return { ok: true };
  } catch (err) {
    if (err instanceof RbacError) {
      return { ok: false, error: err.message };
    }
    console.error("updateUser failed", err);
    return { ok: false, error: "Failed to update user." };
  }
}

/**
 * Soft-deactivate (isActive=false). Never hard-deletes.
 * Blocks deactivating a user who currently holds evidence or has custody history
 * only when a hard-delete would be attempted — for soft deactivate we still allow
 * it (they must not hold current evidence) so inactive accounts stay in the ledger.
 */
export async function setUserActive(
  userId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const actor = await requirePermission("users:manage");

    if (!userId) return { ok: false, error: "Missing user id." };

    const target = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            custodyEventsFrom: true,
            custodyEventsTo: true,
            evidenceCustodianOf: true,
          },
        },
      },
    });

    if (!target) return { ok: false, error: "User not found." };
    if (target.email === SYSTEM_AUDIT_EMAIL) {
      return { ok: false, error: "The system actor cannot be changed." };
    }
    if (target.id === actor.id && !isActive) {
      return { ok: false, error: "You cannot deactivate your own account." };
    }

    // Soft-deactivate only — hard-delete is never exposed. If they currently hold
    // evidence, force a transfer first so custody isn't left orphaned.
    if (!isActive && target._count.evidenceCustodianOf > 0) {
      return {
        ok: false,
        error: `This user currently holds ${target._count.evidenceCustodianOf} evidence item(s). Transfer custody before deactivating.`,
      };
    }

    if (target.isActive === isActive) return { ok: true };

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: isActive ? "USER_REACTIVATED" : "USER_DEACTIVATED",
      entityType: "User",
      entityId: userId,
      metadata: {
        email: target.email,
        role: target.role,
        changedBy: actor.email,
        hasCustodyHistory:
          target._count.custodyEventsFrom + target._count.custodyEventsTo > 0,
      },
    });

    return { ok: true };
  } catch (err) {
    if (err instanceof RbacError) {
      return { ok: false, error: err.message };
    }
    console.error("setUserActive failed", err);
    return { ok: false, error: "Failed to update user status." };
  }
}
