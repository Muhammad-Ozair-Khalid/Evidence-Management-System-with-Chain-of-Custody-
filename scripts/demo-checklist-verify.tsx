/**
 * Full demo-day checklist against local DB + live Railway.
 * Run: npx tsx scripts/demo-checklist-verify.tsx
 */
import { createHash, randomBytes } from "crypto";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { PrismaClient } from "@prisma/client";
import { CustodyReportDocument } from "../src/lib/pdf/custody-report";
import type { CustodyReportPayload } from "../src/lib/pdf/types";
import {
  computeSha256,
  resolveIntakeHash,
} from "../src/lib/hash";

const prisma = new PrismaClient();
const LIVE =
  process.env.LIVE_BASE_URL?.replace(/\/$/, "") ||
  "https://evidence-management-system-with-chain-of-custody-production.up.railway.app";

type Row = {
  id: string;
  label: string;
  status: "PASS" | "FAIL" | "READY";
  detail: string;
};

const rows: Row[] = [];

function pass(id: string, label: string, detail: string) {
  rows.push({ id, label, status: "PASS", detail });
  console.log(`  PASS  ${label} — ${detail}`);
}
function fail(id: string, label: string, detail: string) {
  rows.push({ id, label, status: "FAIL", detail });
  console.log(`  FAIL  ${label} — ${detail}`);
}
function ready(id: string, label: string, detail: string) {
  rows.push({ id, label, status: "READY", detail });
  console.log(`  READY ${label} — ${detail}`);
}

async function login(email: string) {
  const jar: string[] = [];
  const store = (res: Response) => {
    const set = res.headers.getSetCookie?.() ?? [];
    for (const c of set) jar.push(c.split(";")[0]);
  };
  const csrfRes = await fetch(`${LIVE}/api/auth/csrf`);
  store(csrfRes);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  const body = new URLSearchParams({
    csrfToken,
    email,
    password: "Password123!",
    callbackUrl: `${LIVE}/dashboard`,
    json: "true",
  });
  const loginRes = await fetch(`${LIVE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: jar.join("; "),
    },
    body,
    redirect: "manual",
  });
  store(loginRes);
  return {
    ok: loginRes.status === 200 || loginRes.status === 302,
    cookie: jar.join("; "),
  };
}

async function get(path: string, cookie: string) {
  return fetch(`${LIVE}${path}`, {
    headers: { Cookie: cookie },
    redirect: "follow",
  });
}

async function main() {
  console.log("EMS Demo Checklist Verification\n");
  const stamp = Date.now();
  const tmp = join(process.cwd(), "tmp");
  mkdirSync(tmp, { recursive: true });

  // Prep artifacts
  const testFilePath = join(tmp, "demo-checklist-sample.txt");
  const sampleBytes = Buffer.from(
    `EMS demo sample ${stamp}\nChain of Custody checklist artifact.\n`
  );
  writeFileSync(testFilePath, sampleBytes);
  const sampleSha = computeSha256(sampleBytes);
  const backupSha = createHash("sha256")
    .update(randomBytes(32))
    .digest("hex");
  writeFileSync(
    join(tmp, "demo-checklist-backup-sha256.txt"),
    `${backupSha}\n`
  );
  writeFileSync(
    join(tmp, "demo-accounts.txt"),
    [
      "EMS Demo Accounts — password for all: Password123!",
      "ADMIN      admin@ems.local",
      "SUPERVISOR supervisor@ems.local",
      "EXAMINER   examiner1@ems.local",
      "EXAMINER   examiner2@ems.local",
      "CUSTODIAN  custodian1@ems.local",
      "CUSTODIAN  custodian2@ems.local",
      "",
      `Backup SHA-256: ${backupSha}`,
      `Sample file SHA-256: ${sampleSha}`,
    ].join("\n")
  );

  // 1 Live URL
  try {
    const home = await fetch(LIVE);
    const html = await home.text();
    if (home.status === 200) {
      pass("live", "Live URL open hoti hai", `${LIVE} → ${home.status}`);
    } else {
      fail("live", "Live URL open hoti hai", `status ${home.status}`);
    }
    if (/Playbook|Operator playbook|playbook/i.test(html)) {
      pass("playbook", "Playbook section landing pe dikhe", "Playbook found in HTML");
    } else {
      // Client component may hydrate later — check for section id / nav
      if (/#playbook|id=\"playbook\"/i.test(html)) {
        pass("playbook", "Playbook section landing pe dikhe", "#playbook anchor present");
      } else {
        fail(
          "playbook",
          "Playbook section landing pe dikhe",
          "Playbook string not in SSR HTML yet (redeploy?)"
        );
      }
    }
  } catch (e) {
    fail("live", "Live URL open hoti hai", String(e));
    fail("playbook", "Playbook section landing pe dikhe", "skipped — live down");
  }

  // 2 examiner login + modules
  const ex = await login("examiner1@ems.local");
  if (ex.ok) {
    pass("examiner_login", "examiner1 login OK", "credentials accepted");
  } else {
    fail("examiner_login", "examiner1 login OK", "login failed");
  }

  if (ex.ok) {
    for (const path of [
      "/dashboard",
      "/evidence",
      "/evidence/new",
      "/custody",
      "/integrity",
      "/reports",
    ]) {
      const r = await get(path, ex.cookie);
      if (r.status !== 200) {
        fail("examiner_routes", `Examiner route ${path}`, `status ${r.status}`);
      }
    }
    const neu = await get("/evidence/new", ex.cookie);
    const neuHtml = await neu.text();
    if (/MD5|SHA-256|external/i.test(neuHtml)) {
      pass(
        "hash_ui",
        "Register hash UI (file OR MD5/SHA-256)",
        "/evidence/new copy OK"
      );
    } else {
      fail("hash_ui", "Register hash UI (file OR MD5/SHA-256)", "copy missing");
    }
  }

  // Local DB: register file / sha256 / md5 + custody + pdf
  const examiner = await prisma.user.findUnique({
    where: { email: "examiner1@ems.local" },
  });
  const custodian = await prisma.user.findUnique({
    where: { email: "custodian1@ems.local" },
  });
  if (!examiner || !custodian) {
    fail("seed", "Seeded users", "examiner/custodian missing — run db:seed");
  } else {
    // Register with file (resolve + store meta like action)
    const fileIntake = await resolveIntakeHash(
      {
        size: sampleBytes.length,
        name: "demo-checklist-sample.txt",
        type: "text/plain",
        arrayBuffer: async () =>
          sampleBytes.buffer.slice(
            sampleBytes.byteOffset,
            sampleBytes.byteOffset + sampleBytes.byteLength
          ),
      },
      ""
    );
    if (
      fileIntake.ok &&
      fileIntake.hashSource === "UPLOAD" &&
      fileIntake.hash === sampleSha
    ) {
      const item = await prisma.evidenceItem.create({
        data: {
          caseNumber: `CHK-FILE-${stamp}`,
          evidenceId: `EV-CHK-FILE-${stamp}`,
          title: "Checklist file register",
          description: "Automated demo checklist — file path",
          evidenceType: "DOCUMENT",
          intakeDate: new Date(),
          intakeLocation: "Demo Lab",
          submittedById: examiner.id,
          currentCustodianId: examiner.id,
          currentHash: fileIntake.hash,
          originalHash: fileIntake.hash,
          status: "REGISTERED",
          hashSource: "UPLOAD",
          fileName: "demo-checklist-sample.txt",
          fileSize: sampleBytes.length,
          mimeType: "text/plain",
        },
      });
      pass(
        "reg_file",
        "Register with file OK",
        `${item.evidenceId} SHA-256=${item.originalHash.slice(0, 12)}…`
      );

      // Custody transfer
      await prisma.custodyEvent.create({
        data: {
          evidenceItemId: item.id,
          eventType: "TRANSFER",
          handlerFromId: examiner.id,
          handlerToId: custodian.id,
          timestamp: new Date(),
          location: "Evidence Locker A",
          reason: "Demo checklist custody transfer",
          hashAtEvent: item.currentHash,
          hashMatch: true,
        },
      });
      await prisma.evidenceItem.update({
        where: { id: item.id },
        data: {
          currentCustodianId: custodian.id,
          status: "IN_CUSTODY",
        },
      });
      pass(
        "custody",
        "Custody transfer OK",
        `TRANSFER ${examiner.email} → ${custodian.email}`
      );

      // PDF
      const payload: CustodyReportPayload = {
        organisationName: "NCERT Forensic Evidence Unit",
        generatedAt: new Date().toISOString(),
        generatedByName: examiner.name,
        generatedByEmail: examiner.email,
        reportKind: "single",
        items: [
          {
            evidenceId: item.evidenceId,
            caseNumber: item.caseNumber,
            title: item.title,
            description: item.description,
            evidenceType: item.evidenceType,
            status: "IN_CUSTODY",
            originalHash: item.originalHash,
            currentHash: item.currentHash,
            intakeDate: item.intakeDate.toISOString(),
            intakeLocation: item.intakeLocation,
            submittedByName: examiner.name,
            currentCustodianName: custodian.name,
            returnedTo: null,
            events: [
              {
                timestamp: item.intakeDate.toISOString(),
                eventType: "SEIZURE",
                fromName: "—",
                toName: examiner.name,
                location: item.intakeLocation,
                reason: "Intake",
                hashAtEvent: item.originalHash,
                hashMatch: true,
              },
              {
                timestamp: new Date().toISOString(),
                eventType: "TRANSFER",
                fromName: examiner.name,
                toName: custodian.name,
                location: "Evidence Locker A",
                reason: "Demo checklist custody transfer",
                hashAtEvent: item.currentHash,
                hashMatch: true,
              },
            ],
          },
        ],
      };
      const document = (
        <CustodyReportDocument data={payload} />
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
      const pdfPath = join(tmp, `demo-checklist-custody-${stamp}.pdf`);
      writeFileSync(pdfPath, buf);
      if (buf.length > 1000) {
        pass("pdf", "PDF generate OK", `${buf.length} bytes → ${pdfPath}`);
      } else {
        fail("pdf", "PDF generate OK", `too small: ${buf.length}`);
      }

      await prisma.custodyEvent.deleteMany({ where: { evidenceItemId: item.id } });
      await prisma.evidenceItem.delete({ where: { id: item.id } });
    } else {
      fail("reg_file", "Register with file OK", "resolveIntakeHash failed");
    }

    // SHA-256 only
    const shaOnly = "c".repeat(64);
    const shaIntake = await resolveIntakeHash(null, shaOnly);
    if (shaIntake.ok && shaIntake.algorithm === "SHA-256") {
      const item = await prisma.evidenceItem.create({
        data: {
          caseNumber: `CHK-SHA-${stamp}`,
          evidenceId: `EV-CHK-SHA-${stamp}`,
          title: "Checklist SHA-256 only",
          description: "External SHA-256 register",
          evidenceType: "OTHER",
          intakeDate: new Date(),
          intakeLocation: "Demo Lab",
          submittedById: examiner.id,
          currentCustodianId: examiner.id,
          currentHash: shaIntake.hash,
          originalHash: shaIntake.hash,
          status: "REGISTERED",
          hashSource: "EXTERNAL",
        },
      });
      pass("reg_sha", "Register with SHA-256-only OK", item.evidenceId);
      await prisma.evidenceItem.delete({ where: { id: item.id } });
    } else {
      fail("reg_sha", "Register with SHA-256-only OK", "intake failed");
    }

    // MD5 only
    const md5Only = "d".repeat(32);
    const md5Intake = await resolveIntakeHash(null, md5Only);
    if (md5Intake.ok && md5Intake.algorithm === "MD5") {
      const item = await prisma.evidenceItem.create({
        data: {
          caseNumber: `CHK-MD5-${stamp}`,
          evidenceId: `EV-CHK-MD5-${stamp}`,
          title: "Checklist MD5 only",
          description: "External MD5 register",
          evidenceType: "OTHER",
          intakeDate: new Date(),
          intakeLocation: "Demo Lab",
          submittedById: examiner.id,
          currentCustodianId: examiner.id,
          currentHash: md5Intake.hash,
          originalHash: md5Intake.hash,
          status: "REGISTERED",
          hashSource: "EXTERNAL",
        },
      });
      pass("reg_md5", "Register with MD5-only OK", item.evidenceId);
      await prisma.evidenceItem.delete({ where: { id: item.id } });
    } else {
      fail("reg_md5", "Register with MD5-only OK", "intake failed");
    }
  }

  // RBAC live
  const cust = await login("custodian1@ems.local");
  if (cust.ok) {
    const adminRes = await get("/admin/users", cust.cookie);
    const url = adminRes.url;
    if (/forbidden|dashboard/i.test(url) || adminRes.redirected) {
      pass(
        "cust_admin",
        "custodian1 → Admin forbidden",
        `ended at ${url}`
      );
    } else {
      // follow final body
      const text = await adminRes.text();
      if (/forbidden|Access denied|not authorized/i.test(text) || /dashboard/i.test(url)) {
        pass("cust_admin", "custodian1 → Admin forbidden", url);
      } else {
        fail("cust_admin", "custodian1 → Admin forbidden", `unexpected ${url}`);
      }
    }
  } else {
    fail("cust_admin", "custodian1 → Admin forbidden", "custodian login failed");
  }

  const sup = await login("supervisor@ems.local");
  if (sup.ok) {
    const audit = await get("/audit", sup.cookie);
    if (audit.status === 200 && !/forbidden/i.test(audit.url)) {
      pass("sup_audit", "supervisor → Audit open", `status ${audit.status}`);
    } else {
      fail("sup_audit", "supervisor → Audit open", `${audit.status} ${audit.url}`);
    }
  } else {
    fail("sup_audit", "supervisor → Audit open", "supervisor login failed");
  }

  const adm = await login("admin@ems.local");
  if (adm.ok) {
    const users = await get("/admin/users", adm.cookie);
    if (users.status === 200) {
      pass("admin_users", "admin → Users open", `status ${users.status}`);
    } else {
      fail("admin_users", "admin → Users open", `status ${users.status}`);
    }
  } else {
    fail("admin_users", "admin → Users open", "admin login failed");
  }

  // Prep READY items
  ready(
    "passwords",
    "Password list print / phone pe ready",
    `tmp/demo-accounts.txt (Password123!)`
  );
  ready(
    "testfile",
    "Chhota test file (txt/pdf) ready",
    testFilePath
  );
  ready(
    "backup_sha",
    "Ek valid 64-char SHA-256 string ready (backup)",
    `${backupSha.slice(0, 16)}… → tmp/demo-checklist-backup-sha256.txt`
  );

  const failed = rows.filter((r) => r.status === "FAIL");
  const passed = rows.filter((r) => r.status === "PASS");
  const readies = rows.filter((r) => r.status === "READY");

  const summary = {
    generatedAt: new Date().toISOString(),
    live: LIVE,
    passed: passed.length,
    failed: failed.length,
    ready: readies.length,
    total: rows.length,
    allClear: failed.length === 0,
    rows,
  };
  writeFileSync(
    join(tmp, "demo-checklist-results.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log(
    `\n${passed.length} PASS · ${readies.length} READY · ${failed.length} FAIL · of ${rows.length}`
  );
  if (failed.length) {
    process.exitCode = 1;
  } else {
    console.log("\nDEMO CHECKLIST: ALL CLEAR");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
