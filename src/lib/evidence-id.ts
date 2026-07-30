import "server-only";
import { type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Generate the next EVD-{year}-{NNNN} ID inside a transaction with a row lock.
 * Never call from the client.
 */
export async function generateEvidenceId(tx: Tx = prisma): Promise<string> {
  const year = new Date().getFullYear();

  const rows = await tx.$queryRaw<{ lastN: number }[]>`
    INSERT INTO "EvidenceIdSequence" (year, "lastN")
    VALUES (${year}, 1)
    ON CONFLICT (year)
    DO UPDATE SET "lastN" = "EvidenceIdSequence"."lastN" + 1
    RETURNING "lastN"
  `;

  const n = rows[0]?.lastN;
  if (!n || n < 1) {
    throw new Error("Failed to allocate evidence ID sequence");
  }

  return `EVD-${year}-${String(n).padStart(4, "0")}`;
}
