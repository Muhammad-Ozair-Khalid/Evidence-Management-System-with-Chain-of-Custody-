/**
 * Offline smoke checks: DB seed, PDF render (LaTeX-style), route file presence.
 * Run: npx tsx scripts/smoke-verify.ts
 */
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { PrismaClient } from "@prisma/client";
import { CustodyReportDocument } from "../src/lib/pdf/custody-report";
import type { CustodyReportPayload } from "../src/lib/pdf/types";

const prisma = new PrismaClient();

async function main() {
  const errors: string[] = [];

  console.log("— DB connectivity & seed —");
  const users = await prisma.user.findMany({
    where: { email: { not: "system@ems.local" } },
    select: { email: true, role: true, isActive: true },
  });
  const roles = new Set(users.map((u) => u.role));
  for (const r of ["ADMIN", "SUPERVISOR", "EXAMINER", "CUSTODIAN"] as const) {
    if (!roles.has(r)) errors.push(`Missing seeded role: ${r}`);
  }
  console.log(`  users: ${users.length}, roles: ${Array.from(roles).join(", ")}`);

  console.log("— Module route files —");
  const routes = [
    "src/app/(dashboard)/dashboard/page.tsx",
    "src/app/(dashboard)/evidence/page.tsx",
    "src/app/(dashboard)/custody/page.tsx",
    "src/app/(dashboard)/integrity/page.tsx",
    "src/app/(dashboard)/reports/page.tsx",
    "src/app/(dashboard)/audit/page.tsx",
    "src/app/(dashboard)/admin/users/page.tsx",
    "src/app/(dashboard)/settings/page.tsx",
    "src/app/login/page.tsx",
    "src/lib/pdf/custody-report.tsx",
  ];
  for (const r of routes) {
    if (!existsSync(join(process.cwd(), r))) errors.push(`Missing route/file: ${r}`);
    else console.log(`  ok ${r}`);
  }

  console.log("— LaTeX-style PDF render —");
  const sample: CustodyReportPayload = {
    organisationName: "NCERT Forensic Evidence Unit",
    generatedAt: new Date().toISOString(),
    generatedByName: "Smoke Test",
    generatedByEmail: "admin@ems.local",
    reportKind: "single",
    items: [
      {
        evidenceId: "EVD-2026-0001",
        caseNumber: "CASE-SMOKE-1",
        title: "Sample digital media",
        description: "Smoke test exhibit",
        evidenceType: "DIGITAL_MEDIA",
        status: "IN_CUSTODY",
        originalHash: "a".repeat(64),
        currentHash: "a".repeat(64),
        intakeDate: "2026-07-30 10:00",
        intakeLocation: "Lab A",
        submittedByName: "Sara Malik",
        currentCustodianName: "Nadia Hussain",
        returnedTo: null,
        events: [
          {
            timestamp: "2026-07-30 10:00",
            eventType: "SEIZURE",
            fromName: "—",
            toName: "Sara Malik",
            location: "Lab A",
            reason: "Initial intake",
            hashAtEvent: "a".repeat(64),
            hashMatch: true,
          },
          {
            timestamp: "2026-07-30 11:00",
            eventType: "TRANSFER",
            fromName: "Sara Malik",
            toName: "Nadia Hussain",
            location: "Evidence Locker",
            reason: "Transfer for storage after preliminary examination.",
            hashAtEvent: "a".repeat(64),
            hashMatch: true,
          },
        ],
      },
    ],
  };

  const document = (
    <CustodyReportDocument data={sample} />
  ) as React.ReactElement;
  const result = await pdf(document).toBuffer();
  let buf: Buffer;
  if (Buffer.isBuffer(result)) {
    buf = result;
  } else {
    const chunks: Buffer[] = [];
    for await (const chunk of result as NodeJS.ReadableStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    buf = Buffer.concat(chunks);
  }

  if (!buf || buf.length < 500) {
    errors.push("PDF buffer too small / empty");
  } else {
    const outDir = join(process.cwd(), "tmp");
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, "smoke-custody-report.pdf");
    writeFileSync(outPath, buf);
    console.log(`  PDF ok (${buf.length} bytes) → ${outPath}`);
  }

  console.log("— Action modules present —");
  for (const a of [
    "evidence",
    "custody",
    "integrity",
    "reports",
    "audit",
    "users",
    "account",
    "search",
  ]) {
    const p = `src/actions/${a}.ts`;
    if (!existsSync(join(process.cwd(), p))) errors.push(`Missing action: ${p}`);
    else console.log(`  ok ${p}`);
  }

  if (errors.length) {
    console.error("\nSMOKE FAILED:");
    errors.forEach((e) => console.error(" -", e));
    process.exit(1);
  }
  console.log("\nSMOKE PASSED");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
