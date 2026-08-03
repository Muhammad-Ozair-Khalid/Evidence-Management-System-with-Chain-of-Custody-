import Link from "next/link";
import {
  ClipboardList,
  FileSearch,
  Fingerprint,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { LogoWordmark } from "@/components/logo";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HeroChain } from "@/components/marketing/hero-chain";
import { IntegrityDemo } from "@/components/marketing/integrity-demo";
import { LiveChainDemo } from "@/components/marketing/live-chain-demo";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { TechStackBand } from "@/components/marketing/tech-stack-band";
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
    <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-[2.15rem] sm:leading-[1.15]">
      {children}
    </h2>
  );
}

function SectionLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#9AA3AD]">
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
        <div className="pointer-events-none absolute inset-0 mesh-brand opacity-95" />
        <div className="pointer-events-none absolute inset-0 marketing-grid opacity-40" />
        <div
          className="pointer-events-none absolute -left-32 top-16 h-96 w-96 animate-float rounded-full bg-accent-custody/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 animate-float rounded-full bg-accent-audit/15 blur-3xl"
          style={{ animationDelay: "1.4s" }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pb-20 pt-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-28">
          <div>
            <p
              className="animate-fade text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: MODULES.custody.hex, animationDelay: "40ms" }}
            >
              NCERT Forensic Evidence Unit
            </p>

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
              className="mt-7 max-w-[16ch] font-display text-2xl font-bold leading-[1.2] tracking-tight text-[#E8EAED] sm:text-[1.85rem]"
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
              className="mt-6 max-w-md animate-fade text-base leading-relaxed text-[#B8BEC6] sm:text-lg"
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
                className="bg-white px-7 text-[#0B0E14] hover:bg-[#E8EAED]"
              >
                <Link href="/login?callbackUrl=%2Fdashboard">Sign in to EMS</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:border-white/25 hover:bg-white/[0.04]"
              >
                <a href="#modules">Explore modules</a>
              </Button>
            </div>
          </div>

          <div className="animate-chain-in" style={{ animationDelay: "380ms" }}>
            <HeroChain />
          </div>
        </div>
      </section>

      {/* Trust metrics band — below first viewport */}
      <section className="relative border-y border-white/[0.06] bg-[#0a0d12]">
        <div className="marketing-section-rule absolute inset-x-0 top-0 opacity-40" />
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4">
          {METRICS.map((m, i) => (
            <Reveal
              key={m.label}
              delayMs={i * 40}
              className="px-5 py-7 text-center sm:px-6"
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
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.1em] text-[#7A828C]">
                {m.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Live demos */}
      <section className="bg-[#0B0E14]">
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
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-1 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]">
                <div className="rounded-[14px] border border-white/[0.06] bg-[#0d1118]/90 p-4 sm:p-5">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-custody">
                    Custody chain
                  </p>
                  <LiveChainDemo className="rounded-lg border-white/[0.06] bg-transparent p-4 shadow-none sm:p-5" />
                </div>
              </div>
            </Reveal>
            <Reveal delayMs={100}>
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-1 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]">
                <div className="rounded-[14px] border border-white/[0.06] bg-[#0d1118]/90 p-4 sm:p-5">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-integrity">
                    Integrity check
                  </p>
                  <IntegrityDemo className="rounded-lg border-white/[0.06] bg-transparent p-4 shadow-none sm:p-5" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Capabilities — editorial rails */}
      <section id="capabilities" className="border-t border-white/[0.06]">
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
                    className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/10"
                    style={{
                      backgroundColor: `${accent}18`,
                      color: accent,
                    }}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#9AA3AD]">
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
        className="border-t border-white/[0.06] bg-[#0a0d12]"
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
                    <p className="mt-2.5 pl-1 text-sm leading-relaxed text-[#C2C8D0]">
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
      <section id="how-it-works" className="border-t border-white/[0.06]">
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
                <p className="mt-2 text-sm leading-relaxed text-[#9AA3AD]">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-t border-white/[0.06] bg-[#0a0d12]">
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
                  <h3 className="mt-3 font-display text-base font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#9AA3AD]">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="border-t border-white/[0.06]">
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
                  <p className="mt-2.5 text-sm leading-relaxed text-[#9AA3AD]">
                    {t.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Stack */}
      <section className="border-t border-white/[0.06] bg-[#0a0d12]">
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
      <section id="faq" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <FaqAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0a0d12]">
        <div className="pointer-events-none absolute inset-0 mesh-brand opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:py-24">
          <Reveal>
            <ClipboardList
              className="mx-auto h-9 w-9"
              style={{ color: MODULES.custody.hex }}
              aria-hidden
            />
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to walk the chain
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[#9AA3AD]">
              Sign in with a demo account — examiner, custodian, supervisor, or
              admin — and run the full custody loop end to end.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white px-8 text-[#0B0E14] hover:bg-[#E8EAED]"
              >
                <Link href="/login?callbackUrl=%2Fdashboard">Sign in</Link>
              </Button>
            </div>
            <p className="mt-7 font-mono text-xs text-[#6B7280]">
              admin@ems.local · Password123!
            </p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
