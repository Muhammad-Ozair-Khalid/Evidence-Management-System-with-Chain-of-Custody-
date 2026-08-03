"use client";

import { useId, useState, type ReactNode } from "react";
import {
  BookOpen,
  ChevronDown,
  Fingerprint,
  KeyRound,
  Layers,
  Play,
  Server,
  Shield,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/ui-ems/reveal";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/modules";

type Chapter = {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  icon: typeof BookOpen;
  body: ReactNode;
};

const CHAPTERS: Chapter[] = [
  {
    id: "what",
    title: "What is EMS?",
    blurb: "Forensic inventory + tamper-evident custody ledger",
    accent: MODULES.dashboard.hex,
    icon: BookOpen,
    body: (
      <div className="space-y-4 text-[14px] leading-relaxed text-[#9bb0a3]">
        <p>
          <span className="font-semibold text-[#e8f0ea]">
            Evidence Management System (EMS)
          </span>{" "}
          is a web app for digital forensic labs. It registers exhibits, locks
          integrity hashes at intake, records every handoff, re-verifies hashes
          on movement, and produces court-ready custody PDFs — with role-based
          access and an append-only audit trail.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            "Unique Evidence IDs (EVD-YYYY-NNNN)",
            "SHA-256 on upload · MD5/SHA-256 external",
            "Custody events: seizure → transfer → examine → return",
            "INTEGRITY_FLAGGED on mismatch + supervisor resolve",
            "LaTeX-style printable custody reports",
            "RBAC: Custodian · Examiner · Supervisor · Admin",
          ].map((item) => (
            <li
              key={item}
              className="flex gap-2 rounded-lg border border-[#1a3d28] bg-[#06140c]/70 px-3 py-2.5"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3d9a5f]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-[#6f8578]">
          Built for the NCERT Digital Forensics internship (Group 2) — Project 1
          brief: register, chain of custody, re-hash, reports, RBAC, audit.
        </p>
      </div>
    ),
  },
  {
    id: "accounts",
    title: "Demo accounts",
    blurb: "Password for all: Password123!",
    accent: MODULES.custody.hex,
    icon: KeyRound,
    body: (
      <div className="space-y-3">
        <p className="text-[14px] text-[#9bb0a3]">
          Use these seeded accounts on the live demo or local seed. Password for
          every account:{" "}
          <code className="rounded bg-[#06140c] px-1.5 py-0.5 font-mono text-[#c48a00]">
            Password123!
          </code>
        </p>
        <div className="overflow-hidden rounded-xl border border-[#1a3d28]">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#06140c] text-[11px] uppercase tracking-[0.1em] text-[#6f8578]">
              <tr>
                <th className="px-3 py-2.5 font-medium">Role</th>
                <th className="px-3 py-2.5 font-medium">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3d28] text-[#e8f0ea]">
              {[
                ["ADMIN", "admin@ems.local", MODULES.dashboard.hex],
                ["SUPERVISOR", "supervisor@ems.local", MODULES.custody.hex],
                ["EXAMINER", "examiner1@ems.local", MODULES.evidence.hex],
                ["EXAMINER", "examiner2@ems.local", MODULES.evidence.hex],
                ["CUSTODIAN", "custodian1@ems.local", MODULES.admin.hex],
                ["CUSTODIAN", "custodian2@ems.local", MODULES.admin.hex],
              ].map(([role, email, color]) => (
                <tr
                  key={email}
                  className="bg-[#0a1a12]/80 transition-colors hover:bg-[#0c2216]"
                >
                  <td className="px-3 py-2.5">
                    <span
                      className="font-mono text-[11px] font-bold"
                      style={{ color }}
                    >
                      {role}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-[#9bb0a3]">
                    {email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: "walkthrough",
    title: "Operator walkthrough",
    blurb: "Register → transfer → integrity → PDF → audit",
    accent: MODULES.integrity.hex,
    icon: Play,
    body: (
      <ol className="space-y-3 text-[14px] text-[#9bb0a3]">
        {[
          {
            t: "Sign in",
            d: "examiner1@ems.local — open the public landing, then Sign in.",
          },
          {
            t: "Register evidence",
            d: "Either upload a file (server SHA-256) or enter an external MD5 (32 hex) / SHA-256 (64 hex). One of the two is required.",
          },
          {
            t: "Log custody",
            d: "Transfer / examine / return with handler, location, and reason. File-backed items re-hash automatically.",
          },
          {
            t: "Integrity mismatch",
            d: "If bytes change, status becomes INTEGRITY_FLAGGED. Further movement needs supervisor resolution.",
          },
          {
            t: "Reports & audit",
            d: "Generate a custody PDF. Supervisors/admins review the append-only audit trail.",
          },
          {
            t: "RBAC check",
            d: "As custodian1, /admin and /audit are denied. As admin, manage users and roles.",
          },
        ].map((step, i) => (
          <li
            key={step.t}
            className="playbook-pop flex gap-3 rounded-xl border border-[#1a3d28] bg-gradient-to-r from-[#06140c] to-[#0c2216] p-3.5"
            style={{ ["--pop-delay" as string]: `${i * 50}ms` }}
          >
            <span className="font-display text-lg font-bold tabular-nums text-[#d13438]/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-display font-semibold text-[#e8f0ea]">
                {step.t}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed">{step.d}</p>
            </div>
          </li>
        ))}
      </ol>
    ),
  },
  {
    id: "hash",
    title: "Integrity hash rules",
    blurb: "File upload XOR external MD5 / SHA-256",
    accent: MODULES.evidence.hex,
    icon: Fingerprint,
    body: (
      <div className="space-y-4 text-[14px] leading-relaxed text-[#9bb0a3]">
        <p>
          At registration you must provide{" "}
          <span className="font-semibold text-[#e8f0ea]">either</span> a digital
          file <span className="font-semibold text-[#e8f0ea]">or</span> an
          externally computed hash — not neither.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#107c10]/40 bg-[#107c10]/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#3d9a5f]">
              Option A — Upload
            </p>
            <p className="mt-2">
              Server computes SHA-256 over the stored buffer. Client hashes are
              never trusted for uploaded files.
            </p>
          </div>
          <div className="rounded-xl border border-[#c48a00]/40 bg-[#c48a00]/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#c48a00]">
              Option B — External hash
            </p>
            <p className="mt-2">
              Paste MD5 (32 hex chars) or SHA-256 (64 hex chars) from FTK / other
              tools — for physical exhibits with no file in EMS.
            </p>
          </div>
        </div>
        <p className="rounded-lg border border-[#1a3d28] bg-[#06140c] px-3 py-2 font-mono text-[12px] text-[#7cb894]">
          Invalid short strings are rejected with a clear error — never a crash.
        </p>
      </div>
    ),
  },
  {
    id: "rbac",
    title: "Roles & permissions",
    blurb: "Middleware + every server action re-checks can()",
    accent: MODULES.admin.hex,
    icon: Users,
    body: (
      <div className="space-y-3 overflow-x-auto text-[13px]">
        <table className="w-full min-w-[520px] text-left">
          <thead className="text-[11px] uppercase tracking-[0.08em] text-[#6f8578]">
            <tr className="border-b border-[#1a3d28]">
              <th className="py-2 pr-3 font-medium">Area</th>
              <th className="px-2 py-2 font-medium">Cust.</th>
              <th className="px-2 py-2 font-medium">Exam.</th>
              <th className="px-2 py-2 font-medium">Super.</th>
              <th className="px-2 py-2 font-medium">Admin</th>
            </tr>
          </thead>
          <tbody className="text-[#9bb0a3]">
            {[
              ["Dashboard / Evidence / Custody", true, true, true, true],
              ["Integrity re-hash", false, true, true, true],
              ["Integrity resolve", false, false, true, true],
              ["Reports", false, true, true, true],
              ["Audit trail", false, false, true, true],
              ["Admin users", false, false, false, true],
            ].map(([area, ...flags]) => (
              <tr key={String(area)} className="border-b border-[#1a3d28]/70">
                <td className="py-2.5 pr-3 text-[#e8f0ea]">{area}</td>
                {(flags as boolean[]).map((ok, i) => (
                  <td key={i} className="px-2 py-2.5 text-center font-mono">
                    <span className={ok ? "text-[#3d9a5f]" : "text-[#d13438]/80"}>
                      {ok ? "Yes" : "No"}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[13px] text-[#6f8578]">
          Hiding a nav link is never enough — every mutation calls{" "}
          <code className="text-[#7cb894]">requirePermission(...)</code>.
        </p>
      </div>
    ),
  },
  {
    id: "modules",
    title: "Modules map",
    blurb: "Six colour-coded command surfaces",
    accent: MODULES.reports.hex,
    icon: Layers,
    body: (
      <ul className="grid gap-2 sm:grid-cols-2">
        {(
          [
            ["evidence", "Inventory, register, status pills, intake hashes"],
            ["custody", "Global ledger + per-item timeline"],
            ["integrity", "Mismatch queue + supervisor resolution"],
            ["reports", "LaTeX-style custody PDFs"],
            ["audit", "Append-only, filterable, exportable log"],
            ["admin", "Users, roles, soft-deactivation"],
          ] as const
        ).map(([key, desc]) => {
          const mod = MODULES[key];
          return (
            <li
              key={key}
              className="group relative overflow-hidden rounded-xl border border-[#1a3d28] bg-[#06140c]/70 p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-[#2a5a3c]"
            >
              <span
                className="absolute inset-y-0 left-0 w-1"
                style={{ backgroundColor: mod.hex }}
              />
              <p
                className="pl-2 text-[11px] font-bold uppercase tracking-[0.12em]"
                style={{ color: mod.hex }}
              >
                {mod.label}
              </p>
              <p className="mt-1.5 pl-2 text-[13px] text-[#9bb0a3]">{desc}</p>
            </li>
          );
        })}
      </ul>
    ),
  },
  {
    id: "stack",
    title: "Stack & deploy",
    blurb: "Next.js · Prisma · Postgres · NextAuth · Railway",
    accent: MODULES.audit.hex,
    icon: Server,
    body: (
      <div className="space-y-4 text-[14px] leading-relaxed text-[#9bb0a3]">
        <div className="flex flex-wrap gap-2">
          {[
            "Next.js 14 App Router",
            "TypeScript",
            "PostgreSQL + Prisma",
            "NextAuth JWT",
            "Recharts",
            "react-pdf",
            "Node crypto",
            "Tailwind + shadcn",
          ].map((t) => (
            <span
              key={t}
              className="rounded-full border border-[#1a3d28] bg-[#0a1a12] px-3 py-1 text-[12px] text-[#7cb894]"
            >
              {t}
            </span>
          ))}
        </div>
        <p>
          Production runs on Railway (Web Service + Postgres).{" "}
          <code className="text-[#7cb894]">npm run start:prod</code> migrates,
          seeds, and starts Next. Set{" "}
          <code className="text-[#7cb894]">NEXTAUTH_URL</code> to the public
          HTTPS origin — never localhost in cloud.
        </p>
        <p className="text-[13px] text-[#6f8578]">
          Useful scripts:{" "}
          <code className="text-[#9bb0a3]">npm run smoke</code> ·{" "}
          <code className="text-[#9bb0a3]">npm run test:hash</code>
        </p>
      </div>
    ),
  },
  {
    id: "trust",
    title: "Trust guarantees",
    blurb: "Append-only audit · server hashes · court PDFs",
    accent: MODULES.audit.hex,
    icon: Shield,
    body: (
      <ul className="space-y-3 text-[14px] text-[#9bb0a3]">
        {[
          {
            t: "Append-only audit",
            d: "No update/delete APIs for the tamper-evident log.",
          },
          {
            t: "Server-side hashing",
            d: "Uploaded files hashed with Node crypto SHA-256 only.",
          },
          {
            t: "Double-entry external hashes",
            d: "Manual custody re-hash requires matching confirm field.",
          },
          {
            t: "Court-ready PDFs",
            d: "Times serif, monospace hashes, signature lines, chain chronology.",
          },
        ].map((row) => (
          <li
            key={row.t}
            className="rounded-xl border border-[#1a3d28] border-l-[3px] border-l-[#00b7c3] bg-[#06140c]/60 px-4 py-3"
          >
            <p className="font-display font-semibold text-[#e8f0ea]">{row.t}</p>
            <p className="mt-1 text-[13px]">{row.d}</p>
          </li>
        ))}
      </ul>
    ),
  },
];

function PlaybookChapter({
  chapter,
  open,
  onToggle,
}: {
  chapter: Chapter;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const Icon = chapter.icon;

  return (
    <article
      className={cn(
        "playbook-card group relative overflow-hidden rounded-2xl border transition-all duration-500",
        open
          ? "z-10 border-[#3d9a5f]/50 bg-[#0c2216] shadow-[0_24px_60px_-20px_rgba(16,124,16,0.45),0_0_0_1px_rgba(61,154,95,0.25)] scale-[1.015]"
          : "border-[#1a3d28] bg-[#0a1a12]/80 hover:-translate-y-1 hover:border-[#2a5a3c] hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.7)]"
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-55"
        style={{ backgroundColor: chapter.accent }}
        aria-hidden
      />

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="relative flex w-full items-start gap-4 p-5 text-left sm:p-6"
      >
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-500",
            open && "scale-110 animate-playbook-pop"
          )}
          style={{
            backgroundColor: `${chapter.accent}22`,
            color: chapter.accent,
            boxShadow: open ? `0 0 28px -6px ${chapter.accent}` : undefined,
          }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ color: chapter.accent }}
          >
            Playbook
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-[#e8f0ea] sm:text-xl">
            {chapter.title}
          </h3>
          <p className="mt-1 text-[13px] text-[#6f8578]">{chapter.blurb}</p>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-5 w-5 shrink-0 text-[#6f8578] transition-transform duration-400",
            open && "rotate-180 text-[#3d9a5f]"
          )}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "border-t border-[#1a3d28] px-5 pb-6 pt-2 sm:px-6",
              open && "animate-playbook-panel"
            )}
          >
            {chapter.body}
          </div>
        </div>
      </div>
    </article>
  );
}

export function PlaybookSection({ className }: { className?: string }) {
  const [openId, setOpenId] = useState<string | null>("what");

  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#107c10]/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[#c48a00]/15 blur-3xl"
        aria-hidden
      />

      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c48a00]">
          Operator playbook
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-[#e8f0ea] sm:text-[2.25rem] sm:leading-[1.15]">
          Everything you need — what it is, how to demo it, how it stays trusted
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#9bb0a3]">
          Expand any chapter. Each panel pops forward with the full NCERT green
          treatment — accounts, hash rules, RBAC, modules, and trust guarantees
          in one place.
        </p>
      </Reveal>

      <div className="relative mt-12 grid gap-4 lg:grid-cols-2 lg:gap-5">
        {CHAPTERS.map((chapter, i) => (
          <Reveal
            key={chapter.id}
            delayMs={i * 55}
            className={cn(
              chapter.id === "walkthrough" || chapter.id === "rbac"
                ? "lg:col-span-2"
                : undefined
            )}
          >
            <PlaybookChapter
              chapter={chapter}
              open={openId === chapter.id}
              onToggle={() =>
                setOpenId((cur) => (cur === chapter.id ? null : chapter.id))
              }
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
