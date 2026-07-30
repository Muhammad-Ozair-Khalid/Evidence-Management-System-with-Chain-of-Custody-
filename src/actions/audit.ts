/**
 * APPEND-ONLY — do not add update/delete here, this is the tamper-evident log.
 * Export is read-only; never mutate AuditLogEntry rows.
 */
"use server";

import { requirePermission } from "@/lib/permissions";
import { auditActionLabel } from "@/lib/audit-labels";
import {
  buildAuditWhere,
  type AuditFilterInput,
} from "@/lib/audit-query";
import { prisma } from "@/lib/prisma";
import { RbacError } from "@/lib/rbac";

export type ExportAuditResult =
  | { ok: true; csv: string; filename: string }
  | { ok: false; error: string };

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** APPEND-ONLY — CSV export only; no update/delete of AuditLogEntry. */
export async function exportAuditCsv(
  filters: AuditFilterInput
): Promise<ExportAuditResult> {
  try {
    await requirePermission("audit:view");

    const rows = await prisma.auditLogEntry.findMany({
      where: buildAuditWhere(filters),
      orderBy: { timestamp: "desc" },
      take: 5000,
      include: {
        actor: { select: { name: true, email: true, role: true } },
      },
    });

    const header = [
      "timestamp",
      "actor_name",
      "actor_email",
      "actor_role",
      "action",
      "action_label",
      "entity_type",
      "entity_id",
      "metadata_json",
      "ip_address",
    ];

    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.timestamp.toISOString(),
          r.actor.name,
          r.actor.email,
          r.actor.role,
          r.action,
          auditActionLabel(r.action),
          r.entityType,
          r.entityId,
          JSON.stringify(r.metadata),
          r.ipAddress ?? "",
        ]
          .map((c) => csvEscape(String(c)))
          .join(",")
      ),
    ];

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return {
      ok: true,
      csv: lines.join("\r\n"),
      filename: `ems-audit-${stamp}.csv`,
    };
  } catch (err) {
    if (err instanceof RbacError) {
      return { ok: false, error: err.message };
    }
    console.error("exportAuditCsv failed", err);
    return { ok: false, error: "Failed to export audit CSV." };
  }
}
