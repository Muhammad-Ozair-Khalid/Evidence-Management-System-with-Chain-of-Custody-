/**
 * Soft-deactivate only in application code.
 * Hard-delete is forbidden when a user has custody, evidence, or audit history.
 */
import { prisma } from "@/lib/prisma";

export async function assertUserCanBeHardDeleted(userId: string): Promise<void> {
  const counts = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      _count: {
        select: {
          custodyEventsFrom: true,
          custodyEventsTo: true,
          evidenceSubmitted: true,
          evidenceCustodianOf: true,
          auditLogEntries: true,
        },
      },
    },
  });
  if (!counts) throw new Error("User not found.");
  const history =
    counts._count.custodyEventsFrom +
    counts._count.custodyEventsTo +
    counts._count.evidenceSubmitted +
    counts._count.evidenceCustodianOf +
    counts._count.auditLogEntries;
  if (history > 0) {
    throw new Error(
      "Cannot hard-delete a user who has custody, evidence, or audit history. Soft-deactivate instead."
    );
  }
}
