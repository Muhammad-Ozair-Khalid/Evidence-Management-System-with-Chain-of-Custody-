"use server";

import { compare, hash } from "bcryptjs";
import { writeAuditLog } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type PasswordChangeResult =
  | { ok: true }
  | { ok: false; error: string };

/** Any authenticated user may change their own password (current password required). */
export async function changeOwnPassword(
  formData: FormData
): Promise<PasswordChangeResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { ok: false, error: "Sign in required." };
    }

    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { ok: false, error: "All password fields are required." };
    }
    if (newPassword.length < 10) {
      return {
        ok: false,
        error: "New password must be at least 10 characters.",
      };
    }
    if (newPassword !== confirmPassword) {
      return { ok: false, error: "New password and confirmation do not match." };
    }
    if (newPassword === currentPassword) {
      return {
        ok: false,
        error: "New password must be different from the current password.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user || !user.isActive) {
      return { ok: false, error: "Account not found or inactive." };
    }

    const valid = await compare(currentPassword, user.passwordHash);
    if (!valid) {
      return { ok: false, error: "Current password is incorrect." };
    }

    const passwordHash = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await writeAuditLog({
      actorId: user.id,
      action: "PASSWORD_CHANGED",
      entityType: "User",
      entityId: user.id,
      metadata: { email: user.email, selfService: true },
    });

    return { ok: true };
  } catch (err) {
    console.error("changeOwnPassword failed", err);
    return { ok: false, error: "Failed to change password." };
  }
}
