/**
 * APPEND-ONLY — query helpers only. Do not add update/delete for AuditLogEntry.
 */
import { Prisma } from "@prisma/client";

export type AuditFilterInput = {
  q?: string;
  action?: string;
  actorId?: string;
  entityType?: string;
  from?: string;
  to?: string;
};

export function buildAuditWhere(
  filters: AuditFilterInput
): Prisma.AuditLogEntryWhereInput {
  const where: Prisma.AuditLogEntryWhereInput = {};

  if (filters.action) {
    where.action = filters.action;
  }
  if (filters.actorId) {
    where.actorId = filters.actorId;
  }
  if (filters.entityType) {
    where.entityType = filters.entityType;
  }
  if (filters.from || filters.to) {
    where.timestamp = {};
    if (filters.from) where.timestamp.gte = new Date(filters.from);
    if (filters.to) {
      const end = new Date(filters.to);
      end.setHours(23, 59, 59, 999);
      where.timestamp.lte = end;
    }
  }
  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { entityId: { contains: q, mode: "insensitive" } },
      { actor: { name: { contains: q, mode: "insensitive" } } },
      { actor: { email: { contains: q, mode: "insensitive" } } },
      { action: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}
