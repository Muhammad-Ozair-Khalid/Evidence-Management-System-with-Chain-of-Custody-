"use server";

/**
 * APPEND-ONLY audit trail — integrity resolutions create AuditLogEntry rows only.
 * Do not add update/delete for AuditLogEntry here; this is the tamper-evident log.
 */

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { RbacError } from "@/lib/rbac";

export type ResolveIntegrityResult =
  | { ok: true; decision: "resolve" | "keep_flagged"; evidenceId: string }
  | { ok: false; error: string };

export async function resolveIntegrityFlag(
  formData: FormData
): Promise<ResolveIntegrityResult> {
  try {
    const user = await requirePermission("integrity:resolve");

    const evidenceItemId = String(formData.get("evidenceItemId") ?? "").trim();
    const resolutionNote = String(formData.get("resolutionNote") ?? "").trim();
    const decision = String(formData.get("decision") ?? "").trim();

    if (!evidenceItemId) {
      return { ok: false, error: "Missing evidence item." };
    }
    if (resolutionNote.length < 15) {
      return {
        ok: false,
        error:
          "Resolution note must be at least 15 characters — document the finding clearly.",
      };
    }
    if (decision !== "keep_flagged" && decision !== "resolve") {
      return {
        ok: false,
        error: "Choose a decision: keep flagged or mark resolved.",
      };
    }

    const item = await prisma.evidenceItem.findUnique({
      where: { id: evidenceItemId },
      select: {
        id: true,
        evidenceId: true,
        status: true,
        currentCustodianId: true,
      },
    });

    if (!item) {
      return { ok: false, error: "Evidence item not found." };
    }
    if (item.status !== "INTEGRITY_FLAGGED") {
      return {
        ok: false,
        error: "Item is not currently INTEGRITY_FLAGGED.",
      };
    }

    const mismatchEvent = await prisma.custodyEvent.findFirst({
      where: { evidenceItemId: item.id, hashMatch: false },
      orderBy: { timestamp: "desc" },
      include: {
        handlerFrom: { select: { name: true, email: true } },
        handlerTo: { select: { name: true, email: true } },
      },
    });

    await prisma.$transaction(async (tx) => {
      if (decision === "resolve") {
        await tx.evidenceItem.update({
          where: { id: item.id },
          data: { status: "IN_CUSTODY" },
        });

        await tx.auditLogEntry.create({
          data: {
            actorId: user.id,
            action: "INTEGRITY_RESOLVED",
            entityType: "EvidenceItem",
            entityId: item.id,
            metadata: {
              evidenceId: item.evidenceId,
              decision: "resolve",
              restoredStatus: "IN_CUSTODY",
              resolutionNote,
              mismatchCustodyEventId: mismatchEvent?.id ?? null,
              hashAtEvent: mismatchEvent?.hashAtEvent ?? null,
              reviewedBy: user.email,
            },
          },
        });
      } else {
        await tx.auditLogEntry.create({
          data: {
            actorId: user.id,
            action: "INTEGRITY_KEEP_FLAGGED",
            entityType: "EvidenceItem",
            entityId: item.id,
            metadata: {
              evidenceId: item.evidenceId,
              decision: "keep_flagged",
              resolutionNote,
              mismatchCustodyEventId: mismatchEvent?.id ?? null,
              hashAtEvent: mismatchEvent?.hashAtEvent ?? null,
              reviewedBy: user.email,
              note: "Supervisor confirmed tampering/error remains under investigation.",
            },
          },
        });
      }
    });

    revalidatePath("/integrity");
    revalidatePath("/evidence");
    revalidatePath(`/evidence/${item.id}`);
    revalidatePath("/custody");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return {
      ok: true,
      decision: decision as "resolve" | "keep_flagged",
      evidenceId: item.evidenceId,
    };
  } catch (err) {
    if (err instanceof RbacError) {
      return { ok: false, error: err.message };
    }
    console.error("resolveIntegrityFlag failed", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to resolve integrity flag.",
    };
  }
}
