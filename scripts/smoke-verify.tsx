/**
 * Offline smoke checks: DB seed, PDF render, route presence, UI overhaul files,
 * loading.tsx coverage, and role-permission matrix.
 * Run: npm run smoke
 */
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { PrismaClient, type Role } from "@prisma/client";
import { CustodyReportDocument } from "../src/lib/pdf/custody-report";
import type { CustodyReportPayload } from "../src/lib/pdf/types";
import { can, ROUTE_PERMISSIONS, type Action } from "../src/lib/rbac";

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
    "src/app/page.tsx",
    "src/lib/pdf/custody-report.tsx",
  ];
  for (const r of routes) {
    if (!existsSync(join(process.cwd(), r))) errors.push(`Missing route/file: ${r}`);
    else console.log(`  ok ${r}`);
  }

  console.log("— loading.tsx coverage —");
  const loadingRoutes = [
    "src/app/(dashboard)/dashboard/loading.tsx",
    "src/app/(dashboard)/evidence/loading.tsx",
    "src/app/(dashboard)/evidence/new/loading.tsx",
    "src/app/(dashboard)/evidence/[id]/loading.tsx",
    "src/app/(dashboard)/custody/loading.tsx",
    "src/app/(dashboard)/integrity/loading.tsx",
    "src/app/(dashboard)/reports/loading.tsx",
    "src/app/(dashboard)/audit/loading.tsx",
    "src/app/(dashboard)/admin/users/loading.tsx",
    "src/app/(dashboard)/settings/loading.tsx",
  ];
  for (const r of loadingRoutes) {
    if (!existsSync(join(process.cwd(), r))) {
      errors.push(`Missing loading skeleton: ${r}`);
    } else console.log(`  ok ${r}`);
  }

  console.log("— Bold UI overhaul components —");
  const uiFiles = [
    "src/components/ui-ems/animated-number.tsx",
    "src/components/ui-ems/reveal.tsx",
    "src/components/ui-ems/sparkline.tsx",
    "src/components/dashboard/custody-velocity-chart.tsx",
    "src/components/dashboard/integrity-ring.tsx",
    "src/components/marketing/live-chain-demo.tsx",
    "src/components/marketing/integrity-demo.tsx",
    "src/components/marketing/tech-stack-band.tsx",
    "src/components/marketing/faq-accordion.tsx",
    "src/components/marketing/landing-page.tsx",
    "src/components/integrity/flagged-table.tsx",
    "src/components/reports/reports-history-table.tsx",
  ];
  for (const r of uiFiles) {
    if (!existsSync(join(process.cwd(), r))) {
      errors.push(`Missing UI component: ${r}`);
    } else console.log(`  ok ${r}`);
  }

  console.log("— Role × route permission matrix —");
  const allRoles: Role[] = ["CUSTODIAN", "EXAMINER", "SUPERVISOR", "ADMIN"];
  const expectations: Record<string, Action> = {};
  for (const r of ROUTE_PERMISSIONS) {
    expectations[r.prefix] = r.action;
  }

  for (const role of allRoles) {
    for (const [prefix, action] of Object.entries(expectations)) {
      const allowed = can(role, action);
      // Sanity: ADMIN can everything in the matrix; CUSTODIAN cannot audit/admin/reports/integrity
      if (role === "ADMIN" && !allowed) {
        errors.push(`ADMIN should can(${action}) for ${prefix}`);
      }
      if (
        role === "CUSTODIAN" &&
        (prefix === "/audit" ||
          prefix === "/admin" ||
          prefix === "/reports" ||
          prefix === "/integrity") &&
        allowed
      ) {
        errors.push(`CUSTODIAN should NOT can(${action}) for ${prefix}`);
      }
      if (
        role === "EXAMINER" &&
        (prefix === "/audit" || prefix === "/admin") &&
        allowed
      ) {
        errors.push(`EXAMINER should NOT can(${action}) for ${prefix}`);
      }
      console.log(
        `  ${role.padEnd(11)} ${prefix.padEnd(12)} ${action.padEnd(20)} → ${allowed ? "allow" : "deny"}`
      );
    }
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
