/**
 * APPEND-ONLY — do not add update/delete here, this is the tamper-evident log.
 * All AuditLogEntry writes must go through create-only APIs (writeAuditLog / prisma.create).
 */
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@prisma/client";

/** Append-only audit writer — never update or delete AuditLogEntry rows. */
export async function writeAuditLog(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}) {
  return prisma.auditLogEntry.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ?? {},
      ipAddress: input.ipAddress ?? null,
    },
  });
}

export const SYSTEM_AUDIT_EMAIL = "system@ems.local";

/** Resolve or create the inactive system actor used for anonymous auth events. */
export async function getSystemAuditActorId(): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { email: SYSTEM_AUDIT_EMAIL },
    select: { id: true },
  });
  if (existing) return existing.id;

  const { hash } = await import("bcryptjs");
  const passwordHash = await hash(`system-no-login-${randomUUID()}`, 12);
  const created = await prisma.user.create({
    data: {
      name: "System",
      email: SYSTEM_AUDIT_EMAIL,
      passwordHash,
      role: "ADMIN",
      badgeNumber: "SYS-000",
      isActive: false,
    },
    select: { id: true },
  });
  return created.id;
}
