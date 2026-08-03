import Link from "next/link";
import {
  ClipboardList,
  FileSearch,
  Fingerprint,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HeroChain } from "@/components/marketing/hero-chain";
import { IntegrityDemo } from "@/components/marketing/integrity-demo";
import { LiveChainDemo } from "@/components/marketing/live-chain-demo";
import { PakistanFlagBadge } from "@/components/marketing/pakistan-flag";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { TechStackBand } from "@/components/marketing/tech-stack-band";
import { LogoWordmark } from "@/components/logo";
import { AnimatedNumber } from "@/components/ui-ems/animated-number";
import { Reveal } from "@/components/ui-ems/reveal";
import { Button } from "@/components/ui/button";
import { MODULES } from "@/lib/modules";

const CAPABILITIES = [
  {
    title: "Register with SHA-256",
    body: "Unique Evidence IDs, intake details, and server-side hashes computed on ingest — never trusted from the client.",
    accent: MODULES.evidence.hex,
    icon: Fingerprint,
  },
  {
    title: "Record every handoff",
    body: "Seizure, transfer, examination, and return — each with handler, timestamp, location, and a real justification.",
    accent: MODULES.custody.hex,
    icon: Scale,
  },
  {
    title: "Re-hash & flag mismatches",
    body: "Every custody move re-verifies integrity. Mismatches raise INTEGRITY_FLAGGED and block silent movement.",
    accent: MODULES.integrity.hex,
    icon: ShieldCheck,
  },
  {
    title: "RBAC & full audit trail",
    body: "Custodian, Examiner, Supervisor, and Admin — with an append-only log of every sensitive action.",
    accent: MODULES.audit.hex,
    icon: FileSearch,
  },
];

const MODULE_LIST = [
  {
    key: "evidence" as const,
    blurb: "Inventory of exhibits with status pills and intake hashes.",
  },
  {
    key: "custody" as const,
    blurb: "Global ledger and per-item timeline of every event.",
  },
  {
    key: "integrity" as const,
    blurb: "Mismatch review queue with supervisor resolution.",
  },
  {
    key: "reports" as const,
    blurb: "LaTeX-style printable custody PDFs per item or case.",
  },
  {
    key: "audit" as const,
    blurb: "System-wide, filterable, exportable activity log.",
  },
  {
    key: "admin" as const,
    blurb: "Users, roles, soft-deactivation — ADMIN only.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Intake",
    body: "Register the exhibit, capture location, and lock the original SHA-256.",
    color: MODULES.evidence.hex,
  },
  {
    n: "02",
    title: "Handoff",
    body: "Transfer or examine with a required reason; custodian updates automatically.",
    color: MODULES.custody.hex,
  },
  {
    n: "03",
    title: "Integrity",
    body: "Recompute the hash. Match continues the chain; mismatch escalates.",
    color: MODULES.integrity.hex,
  },
  {
    n: "04",
    title: "Report",
    body: "Generate a formal custody PDF reflecting the trail as of that moment.",
    color: MODULES.reports.hex,
  },
];

const ROLES = [
  {
    role: "CUSTODIAN" as const,
    title: "Custodian",
    color: MODULES.admin.hex,
    body: "Hold exhibits, log transfers and returns for items you currently hold.",
  },
  {
    role: "EXAMINER" as const,
    title: "Examiner",
    color: MODULES.reports.hex,
    body: "Register evidence, run examinations, request re-hash checks, generate reports.",
  },
  {
    role: "SUPERVISOR" as const,
    title: "Supervisor",
    color: MODULES.custody.hex,
    body: "Resolve integrity flags, view the full audit trail, oversee the ledger.",
  },
  {
    role: "ADMIN" as const,
    title: "Admin",
    color: MODULES.dashboard.hex,
    body: "Full access including user and role management.",
  },
];

const TRUST = [
  {
    title: "Append-only audit",
    body: "No update or delete APIs for the tamper-evident log — by design.",
    color: MODULES.audit.hex,
  },
  {
    title: "Server-side hashing only",
    body: "Node crypto SHA-256 over stored buffers. Manual hashes require double-entry.",
    color: MODULES.evidence.hex,
  },
  {
    title: "Court-ready PDFs",
    body: "Times-serif LaTeX/Overleaf layout with monospace hashes and signature lines.",
    color: MODULES.reports.hex,
  },
];

const HERO_WORDS = ["Digital", "evidence,", "provably", "intact."];

const METRICS = [
  {
    label: "Hash algorithm",
    value: 256,
    suffix: "-bit",
    prefix: "SHA-",
    color: MODULES.evidence.hex,
  },
  {
    label: "Roles enforced",
    value: 4,
    suffix: "",
    color: MODULES.custody.hex,
  },
  {
    label: "Core modules",
    value: 6,
    suffix: "",
    color: MODULES.audit.hex,
  },
  {
    label: "Audit mode",
    value: 1,
    suffix: "",
    display: "Append-only",
    color: MODULES.integrity.hex,
  },
];

function SectionEyebrow({
  children,
  color = MODULES.evidence.hex,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <p
      className="text-[11px] font-semibold uppercase tracking-[0.16em]"
      style={{ color }}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#F7F8FA] sm:text-[2.15rem] sm:leading-[1.15]">
      {children}
    </h2>
  );
}

function SectionLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#C5CCD6]">
      {children}
    </p>
  );
}

export function LandingPage() {
  return (
    <div className="marketing-ink min-h-screen">
      <SiteNav />

      {/* Hero — one composition */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 mesh-brand opacity-100" />
        <div className="pointer-events-none absolute inset-0 marketing-grid opacity-50" />
        <div
          className="pointer-events-none absolute -left-32 top-16 h-96 w-96 animate-float rounded-full bg-accent-custody/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 animate-float rounded-full bg-accent-audit/20 blur-3xl"
          style={{ animationDelay: "1.4s" }}
          aria-hidden
        />

        {/* Small Pakistan flag — side accent with soft float */}
        <PakistanFlagBadge className="right-4 top-6 sm:right-8 sm:top-10 lg:right-12 lg:top-14" />

        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pb-20 pt-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-28">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p
                className="animate-fade text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: MODULES.custody.hex, animationDelay: "40ms" }}
              >
                NCERT Forensic Evidence Unit
              </p>
              <span
                className="animate-fade hidden h-1 w-1 rounded-full bg-white/40 sm:inline-block"
                style={{ animationDelay: "80ms" }}
                aria-hidden
              />
              <p
                className="animate-fade text-[11px] font-medium tracking-wide text-[#D2D8E0]"
                style={{ animationDelay: "100ms" }}
              >
                Pakistan · Digital forensics
              </p>
            </div>

            {/* Brand lockup — sequenced mark → letters → tagline */}
            <h1 className="mt-5">
              <span className="sr-only">
                EMS — Digital evidence, provably intact.
              </span>
              <span aria-hidden="true" className="block">
                <LogoWordmark sequenced variant="hero" />
              </span>
            </h1>

            <p
              className="mt-7 max-w-[18ch] font-display text-2xl font-bold leading-[1.25] tracking-tight text-[#F7F8FA] sm:text-[1.95rem]"
              aria-hidden="true"
            >
              {HERO_WORDS.map((word, i) => (
                <span
                  key={word}
                  className="mr-[0.28em] inline-block animate-reveal"
                  style={{ animationDelay: `${480 + i * 90}ms` }}
                >
                  {word}
                </span>
              ))}
            </p>

            <p
              className="mt-6 max-w-md animate-fade text-base leading-relaxed text-[#D5DBE4] sm:text-lg"
              style={{ animationDelay: "820ms" }}
            >
              Digital evidence inventory meets a tamper-evident chain of custody
              — who held it, when, and whether a single byte changed.
            </p>
            <div
              className="mt-9 flex flex-wrap items-center gap-3 animate-fade"
              style={{ animationDelay: "900ms" }}
            >
              <Button
                asChild
                size="lg"
                className="bg-white px-7 text-[#121820] shadow-[0_10px_30px_-10px_rgba(255,255,255,0.35)] hover:bg-[#F0F2F5]"
              >
                <Link href="/login?callbackUrl=%2Fdashboard">Sign in to EMS</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/[0.04] text-white hover:border-white/40 hover:bg-white/[0.08]"
              >
                <a href="#modules">Explore modules</a>
              </Button>
            </div>
          </div>

          <div
            className="relative animate-chain-in"
            style={{ animationDelay: "380ms" }}
          >
            <div className="absolute -inset-4 rounded-3xl bg-white/[0.03] blur-xl" aria-hidden />
            <HeroChain />
          </div>
        </div>
      </section>

      {/* Trust metrics band — below first viewport */}
      <section className="relative border-y border-white/10 marketing-surface-alt">
        <div className="marketing-section-rule absolute inset-x-0 top-0 opacity-70" />
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4">
          {METRICS.map((m, i) => (
            <Reveal
              key={m.label}
              delayMs={i * 40}
              className="px-5 py-8 text-center sm:px-6"
            >
              <p
                className="font-display text-xl font-bold tracking-tight sm:text-2xl"
                style={{ color: m.color }}
              >
                {m.display ?? (
                  <>
                    {m.prefix}
                    <AnimatedNumber value={m.value} />
                    {m.suffix}
                  </>
                )}
              </p>
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.1em] text-[#A8B0BC]">
                {m.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Live demos */}
      <section className="marketing-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <SectionEyebrow color={MODULES.custody.hex}>Live demos</SectionEyebrow>
            <SectionTitle>See the chain and the check</SectionTitle>
            <SectionLead>
              Interactive previews of custody flow and hash integrity — the same
              ideas the lab uses end to end.
            </SectionLead>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delayMs={40}>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-1 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)]">
                <div className="rounded-[14px] border border-white/10 bg-[#1c2430]/95 p-4 sm:p-5">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-custody">
                    Custody chain
                  </p>
                  <LiveChainDemo className="rounded-lg border-white/10 bg-transparent p-4 shadow-none sm:p-5" />
                </div>
              </div>
            </Reveal>
            <Reveal delayMs={100}>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-1 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)]">
                <div className="rounded-[14px] border border-white/10 bg-[#1c2430]/95 p-4 sm:p-5">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-integrity">
                    Integrity check
                  </p>
                  <IntegrityDemo className="rounded-lg border-white/10 bg-transparent p-4 shadow-none sm:p-5" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Capabilities — editorial rails */}
      <section id="capabilities" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <SectionEyebrow color={MODULES.evidence.hex}>
              Capabilities
            </SectionEyebrow>
            <SectionTitle>
              Everything the brief requires — and nothing silent.
            </SectionTitle>
            <SectionLead>
              Register, track, verify, and report. Every state change leaves an
              audit trail that cannot be quietly rewritten.
            </SectionLead>
          </Reveal>

          <ul className="mt-14 grid gap-10 sm:grid-cols-2">
            {CAPABILITIES.map(({ title, body, accent, icon: Icon }, i) => (
              <Reveal key={title} as="li" delayMs={i * 50}>
                <div
                  className="editorial-rail flex gap-4"
                  style={{ ["--rail" as string]: accent }}
                >
                  <span
                    className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/15"
                    style={{
                      backgroundColor: `${accent}22`,
                      color: accent,
                    }}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight text-[#F7F8FA]">
                      {title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#C5CCD6]">
                      {body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Modules */}
      <section
        id="modules"
        className="border-t border-white/10 marketing-surface-alt"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <SectionEyebrow color={MODULES.dashboard.hex}>Modules</SectionEyebrow>
            <SectionTitle>Colour-coded command surface</SectionTitle>
            <SectionLead>
              Each module carries a distinct accent so operators always know
              where they are.
            </SectionLead>
          </Reveal>

          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODULE_LIST.map(({ key, blurb }, i) => {
              const mod = MODULES[key];
              return (
                <Reveal key={key} as="li" delayMs={i * 40}>
                  <div
                    className="group relative h-full overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]"
                    style={{ ["--glow" as string]: `${mod.hex}40` }}
                  >
                    <span
                      className="absolute left-0 top-0 h-full w-[3px] transition-shadow duration-300 group-hover:shadow-[0_0_18px_var(--glow)]"
                      style={{ backgroundColor: mod.hex }}
                      aria-hidden
                    />
                    <p
                      className="pl-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: mod.hex }}
                    >
                      {mod.label}
                    </p>
                    <p className="mt-2.5 pl-1 text-sm leading-relaxed text-[#D0D6DE]">
                      {blurb}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <SectionEyebrow color={MODULES.custody.hex}>
              How it works
            </SectionEyebrow>
            <SectionTitle>Intake to courtroom-ready report</SectionTitle>
          </Reveal>

          <ol className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div
              className="pointer-events-none absolute left-[12%] right-[12%] top-5 hidden h-px lg:block"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #C48A0066, #D1343866, #8764B866, transparent)",
              }}
              aria-hidden
            />
            {STEPS.map((step, i) => (
              <Reveal
                key={step.n}
                as="li"
                delayMs={i * 70}
                className="relative"
              >
                <p
                  className="font-display text-4xl font-bold tabular-nums tracking-tight"
                  style={{ color: `${step.color}66` }}
                >
                  {step.n}
                </p>
                <h3
                  className="mt-3 font-display text-lg font-semibold"
                  style={{ color: step.color }}
                >
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#C5CCD6]">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-t border-white/10 marketing-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <SectionEyebrow color={MODULES.admin.hex}>Roles</SectionEyebrow>
            <SectionTitle>Access matched to the lab floor</SectionTitle>
            <SectionLead>
              Permissions are enforced in middleware and again in every server
              action — hiding a button is never enough.
            </SectionLead>
          </Reveal>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map(({ role, title, body, color }, i) => (
              <Reveal key={role} as="li" delayMs={i * 50}>
                <div
                  className="editorial-rail h-full"
                  style={{ ["--rail" as string]: color }}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" style={{ color }} aria-hidden />
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{ color }}
                    >
                      {role}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-[#F7F8FA]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#C5CCD6]">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <SectionEyebrow color={MODULES.audit.hex}>Trust</SectionEyebrow>
            <SectionTitle>Built so discrepancies cannot hide</SectionTitle>
          </Reveal>
          <ul className="mt-14 grid gap-10 md:grid-cols-3">
            {TRUST.map((t, i) => (
              <Reveal key={t.title} as="li" delayMs={i * 60}>
                <div
                  className="editorial-rail"
                  style={{ ["--rail" as string]: t.color }}
                >
                  <h3
                    className="font-display text-lg font-semibold"
                    style={{ color: t.color }}
                  >
                    {t.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#C5CCD6]">
                    {t.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Stack */}
      <section className="border-t border-white/10 marketing-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal>
            <SectionEyebrow color={MODULES.dashboard.hex}>Stack</SectionEyebrow>
            <SectionTitle>Built on proven foundations</SectionTitle>
          </Reveal>
          <div className="mt-10">
            <TechStackBand />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <FaqAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/10 marketing-surface">
        <div className="pointer-events-none absolute inset-0 mesh-brand opacity-50" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:py-24">
          <Reveal>
            <ClipboardList
              className="mx-auto h-9 w-9"
              style={{ color: MODULES.custody.hex }}
              aria-hidden
            />
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-[#F7F8FA] sm:text-4xl">
              Ready to walk the chain
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[#C5CCD6]">
              Sign in with a demo account — examiner, custodian, supervisor, or
              admin — and run the full custody loop end to end.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white px-8 text-[#121820] hover:bg-[#F0F2F5]"
              >
                <Link href="/login?callbackUrl=%2Fdashboard">Sign in</Link>
              </Button>
            </div>
            <p className="mt-7 font-mono text-xs text-[#A8B0BC]">
              admin@ems.local · Password123!
            </p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
