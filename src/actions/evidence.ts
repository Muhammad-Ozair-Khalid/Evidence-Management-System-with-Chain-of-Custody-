"use server";

/**
 * APPEND-ONLY audit trail — evidence mutations create AuditLogEntry rows only.
 * Do not add update/delete for AuditLogEntry here; this is the tamper-evident log.
 */

import { revalidatePath } from "next/cache";
import { EvidenceType } from "@prisma/client";
import { generateEvidenceId } from "@/lib/evidence-id";
import {
  isValidSha256Hex,
  normalizeSha256Hex,
  computeSha256,
} from "@/lib/hash";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { RbacError } from "@/lib/rbac";
import { storeEvidenceFile } from "@/lib/storage";

export type RegisterEvidenceResult =
  | { ok: true; evidenceId: string; id: string }
  | { ok: false; error: string };

const EVIDENCE_TYPES = new Set<string>(Object.values(EvidenceType));

export async function registerEvidence(
  formData: FormData
): Promise<RegisterEvidenceResult> {
  try {
    const user = await requirePermission("evidence:register");

    const caseNumber = String(formData.get("caseNumber") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const evidenceTypeRaw = String(formData.get("evidenceType") ?? "").trim();
    const intakeLocation = String(formData.get("intakeLocation") ?? "").trim();
    const externalHashRaw = String(formData.get("externalHash") ?? "").trim();
    const file = formData.get("file");

    if (!caseNumber || !title || !description || !intakeLocation) {
      return {
        ok: false,
        error:
          "Case number, title, description, and intake location are required.",
      };
    }

    if (!EVIDENCE_TYPES.has(evidenceTypeRaw)) {
      return { ok: false, error: "Select a valid evidence type." };
    }
    const evidenceType = evidenceTypeRaw as EvidenceType;

    let hash: string;
    let hashSource: "UPLOAD" | "EXTERNAL";
    let fileMeta: {
      fileName: string | null;
      filePath: string | null;
      fileSize: number | null;
      mimeType: string | null;
    } = {
      fileName: null,
      filePath: null,
      fileSize: null,
      mimeType: null,
    };

    if (file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      hash = computeSha256(buffer);
      hashSource = "UPLOAD";
      const stored = await storeEvidenceFile(
        buffer,
        file.name || "upload.bin",
        file.type || "application/octet-stream"
      );
      fileMeta = {
        fileName: stored.fileName,
        filePath: stored.filePath,
        fileSize: stored.fileSize,
        mimeType: stored.mimeType,
      };
    } else if (externalHashRaw) {
      if (!isValidSha256Hex(externalHashRaw)) {
        return {
          ok: false,
          error: "External hash must be a 64-character SHA-256 hex string.",
        };
      }
      hash = normalizeSha256Hex(externalHashRaw);
      hashSource = "EXTERNAL";
    } else {
      return {
        ok: false,
        error:
          "Provide a digital file upload or an externally computed SHA-256 hash.",
      };
    }

    const intakeDate = new Date();

    const created = await prisma.$transaction(async (tx) => {
      const evidenceId = await generateEvidenceId(tx);

      const item = await tx.evidenceItem.create({
        data: {
          caseNumber,
          evidenceId,
          title,
          description,
          evidenceType,
          intakeDate,
          intakeLocation,
          submittedById: user.id,
          currentCustodianId: user.id,
          currentHash: hash,
          originalHash: hash,
          status: "REGISTERED",
          fileName: fileMeta.fileName,
          filePath: fileMeta.filePath,
          fileSize: fileMeta.fileSize,
          mimeType: fileMeta.mimeType,
          hashSource,
        },
      });

      await tx.custodyEvent.create({
        data: {
          evidenceItemId: item.id,
          eventType: "SEIZURE",
          handlerFromId: null,
          handlerToId: user.id,
          timestamp: intakeDate,
          location: intakeLocation,
          reason: "Initial seizure / intake registration",
          hashAtEvent: hash,
          hashMatch: true,
          notes:
            hashSource === "EXTERNAL"
              ? "Hash provided from external forensic tool at intake."
              : "Hash computed server-side from uploaded file at intake.",
        },
      });

      await tx.auditLogEntry.create({
        data: {
          actorId: user.id,
          action: "EVIDENCE_CREATED",
          entityType: "EvidenceItem",
          entityId: item.id,
          metadata: {
            evidenceId: item.evidenceId,
            caseNumber: item.caseNumber,
            evidenceType: item.evidenceType,
            hashSource,
            originalHash: hash,
          },
        },
      });

      return item;
    });

    revalidatePath("/evidence");
    revalidatePath(`/evidence/${created.id}`);

    return { ok: true, evidenceId: created.evidenceId, id: created.id };
  } catch (err) {
    if (err instanceof RbacError) {
      return { ok: false, error: err.message };
    }
    console.error("registerEvidence failed", err);
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Failed to register evidence.",
    };
  }
}
