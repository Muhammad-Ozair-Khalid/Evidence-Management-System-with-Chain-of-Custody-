"use server";

/**
 * APPEND-ONLY audit trail — custody mutations create AuditLogEntry rows only.
 * Do not add update/delete for AuditLogEntry here; this is the tamper-evident log.
 */

import { revalidatePath } from "next/cache";
import { CustodyEventType, Role } from "@prisma/client";
import {
  hashesEqual,
  isValidSha256Hex,
  normalizeSha256Hex,
  computeSha256,
} from "@/lib/hash";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { RbacError } from "@/lib/rbac";
import { readEvidenceFile } from "@/lib/storage";

export type LogCustodyResult =
  | { ok: true; eventId: string; hashMatch: true }
  | {
      ok: true;
      eventId: string;
      hashMatch: false;
      expectedHash: string;
      actualHash: string;
    }
  | { ok: false; error: string };

const LOGABLE = new Set<string>(["TRANSFER", "EXAMINATION", "RETURN"]);

function canOverrideCustody(role: Role): boolean {
  return role === "SUPERVISOR" || role === "ADMIN";
}

export async function logCustodyEvent(
  formData: FormData
): Promise<LogCustodyResult> {
  try {
    const user = await requirePermission("custody:create");

    const evidenceItemId = String(formData.get("evidenceItemId") ?? "").trim();
    const eventTypeRaw = String(formData.get("eventType") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const reason = String(formData.get("reason") ?? "").trim();
    const handlerToId = String(formData.get("handlerToId") ?? "").trim();
    const returnDestination = String(
      formData.get("returnDestination") ?? ""
    ).trim();
    const manualHash = String(formData.get("manualHash") ?? "").trim();
    const manualHashConfirm = String(
      formData.get("manualHashConfirm") ?? ""
    ).trim();

    if (!evidenceItemId) {
      return { ok: false, error: "Missing evidence item." };
    }
    if (!LOGABLE.has(eventTypeRaw)) {
      return {
        ok: false,
        error: "Event type must be TRANSFER, EXAMINATION, or RETURN.",
      };
    }
    const eventType = eventTypeRaw as CustodyEventType;

    if (!location) {
      return { ok: false, error: "Location is required." };
    }
    if (reason.length < 10) {
      return {
        ok: false,
        error:
          "Reason must be at least 10 characters — provide a real justification.",
      };
    }

    if (eventType === "RETURN") {
      if (!returnDestination) {
        return {
          ok: false,
          error:
            "Return destination is required (place or organisation — not assumed from submitter).",
        };
      }
    } else if (!handlerToId) {
      return {
        ok: false,
        error: "Handler-to (receiving user) is required for this event type.",
      };
    }

    const item = await prisma.evidenceItem.findUnique({
      where: { id: evidenceItemId },
      select: {
        id: true,
        evidenceId: true,
        status: true,
        currentHash: true,
        currentCustodianId: true,
        filePath: true,
        hashSource: true,
      },
    });

    if (!item) {
      return { ok: false, error: "Evidence item not found." };
    }

    if (item.status === "RETURNED" || item.status === "ARCHIVED") {
      return {
        ok: false,
        error: `Cannot log custody events for items with status ${item.status}.`,
      };
    }

    if (item.status === "INTEGRITY_FLAGGED") {
      return {
        ok: false,
        error:
          "This item is INTEGRITY_FLAGGED. A SUPERVISOR/ADMIN must resolve the flag before further custody handoffs.",
      };
    }

    const isCurrentCustodian = item.currentCustodianId === user.id;
    const override = !isCurrentCustodian && canOverrideCustody(user.role);

    if (!isCurrentCustodian && !override) {
      return {
        ok: false,
        error:
          "Only the current custodian may log a custody event from this item. Supervisors/Admins may override (logged in the audit trail).",
      };
    }

    if (eventType !== "RETURN" && handlerToId === item.currentCustodianId) {
      return {
        ok: false,
        error: "Handler-to must be different from the current custodian.",
      };
    }

    if (eventType !== "RETURN") {
      const recipient = await prisma.user.findFirst({
        where: { id: handlerToId, isActive: true },
        select: { id: true },
      });
      if (!recipient) {
        return {
          ok: false,
          error: "Selected receiving user is invalid or inactive.",
        };
      }
    }

    // --- Integrity re-hash (never trust client hash for stored digital files) ---
    const hasStoredFile = Boolean(item.filePath);
    let actualHash: string;

    if (hasStoredFile) {
      try {
        const buffer = await readEvidenceFile(item.filePath!);
        actualHash = computeSha256(buffer);
      } catch (err) {
        console.error("Failed to re-read evidence file for hash", err);
        return {
          ok: false,
          error:
            "Could not re-read the stored evidence file to recompute SHA-256. Custody event aborted.",
        };
      }
    } else {
      if (!manualHash || !manualHashConfirm) {
        return {
          ok: false,
          error:
            "Enter and confirm the freshly computed external SHA-256 hash (double-entry required).",
        };
      }
      if (!hashesEqual(manualHash, manualHashConfirm)) {
        return {
          ok: false,
          error:
            "New hash and Confirm new hash do not match. Correct the typo before submitting.",
        };
      }
      if (!isValidSha256Hex(manualHash)) {
        return {
          ok: false,
          error: "External hash must be a 64-character SHA-256 hex string.",
        };
      }
      actualHash = normalizeSha256Hex(manualHash);
    }

    const expectedHash = normalizeSha256Hex(item.currentHash);
    const hashMatch = hashesEqual(actualHash, expectedHash);

    const handlerFromId = item.currentCustodianId;
    const now = new Date();

    let nextStatus: "IN_CUSTODY" | "UNDER_EXAMINATION" | "RETURNED";
    let nextCustodianId: string | null;
    let returnedTo: string | null = null;
    let auditAction: string;

    if (eventType === "TRANSFER") {
      nextStatus = "IN_CUSTODY";
      nextCustodianId = handlerToId;
      auditAction = "CUSTODY_TRANSFERRED";
    } else if (eventType === "EXAMINATION") {
      nextStatus = "UNDER_EXAMINATION";
      nextCustodianId = handlerToId;
      auditAction = "EVIDENCE_EXAMINED";
    } else {
      nextStatus = "RETURNED";
      nextCustodianId = null;
      returnedTo = returnDestination;
      auditAction = "EVIDENCE_RETURNED";
    }

    const event = await prisma.$transaction(async (tx) => {
      const created = await tx.custodyEvent.create({
        data: {
          evidenceItemId: item.id,
          eventType,
          handlerFromId,
          handlerToId: eventType === "RETURN" ? null : handlerToId,
          returnDestination: eventType === "RETURN" ? returnDestination : null,
          timestamp: now,
          location,
          reason,
          hashAtEvent: actualHash,
          hashMatch,
          notes: [
            override
              ? `Logged under SUPERVISOR/ADMIN override by ${user.email}`
              : null,
            hashMatch
              ? null
              : "HASH MISMATCH — custody handoff blocked; item flagged for supervisor review.",
            hasStoredFile
              ? "Hash recomputed server-side from stored file."
              : "Hash entered from external forensic tool (double-entry validated).",
          ]
            .filter(Boolean)
            .join(" "),
        },
      });

      if (hashMatch) {
        await tx.evidenceItem.update({
          where: { id: item.id },
          data: {
            status: nextStatus,
            currentCustodianId: nextCustodianId,
            returnedTo,
            // currentHash unchanged on match
          },
        });

                await tx.auditLogEntry.create({
          data: {
            actorId: user.id,
            action: auditAction,
            entityType: "EvidenceItem",
            entityId: item.id,
            metadata: {
              evidenceId: item.evidenceId,
              custodyEventId: created.id,
              eventType,
              handlerFromId,
              handlerToId: eventType === "RETURN" ? null : handlerToId,
              returnDestination:
                eventType === "RETURN" ? returnDestination : null,
              location,
              override,
              ...(override
                ? {
                    actualCustodianId: item.currentCustodianId,
                    overrideByRole: user.role,
                  }
                : {}),
              hashMatch: true,
              hashAtEvent: actualHash,
              hashSource: hasStoredFile ? "RECOMPUTED_FILE" : "EXTERNAL_MANUAL",
            },
          },
        });
      } else {
        // Mismatch: log event + flag; do NOT complete the custody handoff.
        await tx.evidenceItem.update({
          where: { id: item.id },
          data: {
            status: "INTEGRITY_FLAGGED",
          },
        });

        await tx.auditLogEntry.create({
          data: {
            actorId: user.id,
            action: "HASH_MISMATCH_FLAGGED",
            entityType: "EvidenceItem",
            entityId: item.id,
            metadata: {
              evidenceId: item.evidenceId,
              custodyEventId: created.id,
              eventType,
              expectedHash,
              actualHash,
              actorEmail: user.email,
              timestamp: now.toISOString(),
              handoffBlocked: true,
              attemptedAction: auditAction,
              attemptedHandlerToId:
                eventType === "RETURN" ? null : handlerToId,
              attemptedReturnDestination:
                eventType === "RETURN" ? returnDestination : null,
              hashSource: hasStoredFile ? "RECOMPUTED_FILE" : "EXTERNAL_MANUAL",
              override,
              ...(override
                ? {
                    actualCustodianId: item.currentCustodianId,
                    overrideByRole: user.role,
                  }
                : {}),
            },
          },
        });
      }

      return created;
    });

    revalidatePath("/custody");
    revalidatePath("/evidence");
    revalidatePath("/integrity");
    revalidatePath(`/evidence/${item.id}`);

    if (hashMatch) {
      return { ok: true, eventId: event.id, hashMatch: true };
    }

    return {
      ok: true,
      eventId: event.id,
      hashMatch: false,
      expectedHash,
      actualHash,
    };
  } catch (err) {
    if (err instanceof RbacError) {
      return { ok: false, error: err.message };
    }
    console.error("logCustodyEvent failed", err);
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Failed to log custody event.",
    };
  }
}
