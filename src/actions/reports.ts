/**
 * APPEND-ONLY audit trail — report generation creates AuditLogEntry rows only.
 * Do not add update/delete for AuditLogEntry here; this is the tamper-evident log.
 */
"use server";

import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { RbacError } from "@/lib/rbac";
import { type Prisma } from "@prisma/client";
import {
  buildCaseReportPayload,
  buildSingleReportPayload,
  loadCaseReportItems,
  loadEvidenceReportItem,
  renderCustodyReportPdf,
} from "@/lib/pdf/render";

export type GenerateReportResult =
  | {
      ok: true;
      filename: string;
      base64: string;
      mimeType: "application/pdf";
    }
  | { ok: false; error: string };

async function logReportGenerated(input: {
  actorId: string;
  entityId: string;
  metadata: Prisma.InputJsonValue;
}) {
  await prisma.auditLogEntry.create({
    data: {
      actorId: input.actorId,
      action: "REPORT_GENERATED",
      entityType: "EvidenceItem",
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}

export async function generateEvidenceCustodyReport(
  evidenceDbId: string
): Promise<GenerateReportResult> {
  try {
    const user = await requirePermission("reports:generate");
    const item = await loadEvidenceReportItem(evidenceDbId);
    if (!item) {
      return { ok: false, error: "Evidence item not found." };
    }

    const payload = buildSingleReportPayload({
      item,
      generatedByName: user.name,
      generatedByEmail: user.email,
    });
    const buffer = await renderCustodyReportPdf(payload);

    await logReportGenerated({
      actorId: user.id,
      entityId: evidenceDbId,
      metadata: {
        reportKind: "single",
        evidenceId: item.evidenceId,
        caseNumber: item.caseNumber,
        filename: `custody-report-${item.evidenceId}.pdf`,
        eventCount: item.events.length,
        generatedAt: payload.generatedAt,
      },
    });

    return {
      ok: true,
      filename: `custody-report-${item.evidenceId}.pdf`,
      base64: buffer.toString("base64"),
      mimeType: "application/pdf",
    };
  } catch (err) {
    if (err instanceof RbacError) {
      return { ok: false, error: err.message };
    }
    console.error("generateEvidenceCustodyReport failed", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to generate PDF.",
    };
  }
}

export async function generateCaseCustodyReport(
  caseNumber: string
): Promise<GenerateReportResult> {
  try {
    const user = await requirePermission("reports:generate");
    const trimmed = caseNumber.trim();
    if (!trimmed) {
      return { ok: false, error: "Case number is required." };
    }

    const items = await loadCaseReportItems(trimmed);
    if (items.length === 0) {
      return {
        ok: false,
        error: `No evidence items found for case "${trimmed}".`,
      };
    }

    const payload = buildCaseReportPayload({
      caseNumber: trimmed,
      items,
      generatedByName: user.name,
      generatedByEmail: user.email,
    });
    const buffer = await renderCustodyReportPdf(payload);

    // One audit entry per exhibit + one case-level summary on the first item
    for (const item of items) {
      const db = await prisma.evidenceItem.findUnique({
        where: { evidenceId: item.evidenceId },
        select: { id: true },
      });
      if (!db) continue;
      await logReportGenerated({
        actorId: user.id,
        entityId: db.id,
        metadata: {
          reportKind: "case",
          caseNumber: trimmed,
          evidenceId: item.evidenceId,
          exhibitCount: items.length,
          filename: `case-custody-report-${trimmed.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`,
          generatedAt: payload.generatedAt,
        },
      });
    }

    const safeCase = trimmed.replace(/[^a-zA-Z0-9_-]/g, "_");
    return {
      ok: true,
      filename: `case-custody-report-${safeCase}.pdf`,
      base64: buffer.toString("base64"),
      mimeType: "application/pdf",
    };
  } catch (err) {
    if (err instanceof RbacError) {
      return { ok: false, error: err.message };
    }
    console.error("generateCaseCustodyReport failed", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to generate case PDF.",
    };
  }
}
