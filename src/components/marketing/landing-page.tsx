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
  { key: "evidence" as const, blurb: "Inventory of exhibits with status pills and intake hashes." },
  { key: "custody" as const, blurb: "Global ledger and per-item timeline of every event." },
  { key: "integrity" as const, blurb: "Mismatch review queue with supervisor resolution." },
  { key: "reports" as const, blurb: "LaTeX-style printable custody PDFs per item or case." },
  { key: "audit" as const, blurb: "System-wide, filterable, exportable activity log." },
  { key: "admin" as const, blurb: "Users, roles, soft-deactivation — ADMIN only." },
];

const STEPS = [
  { n: "01", title: "Intake", body: "Register the exhibit, capture location, and lock the original SHA-256." },
  { n: "02", title: "Handoff", body: "Transfer or examine with a required reason; custodian updates automatically." },
  { n: "03", title: "Integrity", body: "Recompute the hash. Match continues the chain; mismatch escalates." },
  { n: "04", title: "Report", body: "Generate a formal custody PDF reflecting the trail as of that moment." },
];

const ROLES = [
  {
    role: "CUSTODIAN" as const,
    title: "Custodian",
    color: "#94A3B8",
    body: "Hold exhibits, log transfers and returns for items you currently hold.",
  },
  {
    role: "EXAMINER" as const,
    title: "Examiner",
    color: "#A78BDB",
    body: "Register evidence, run examinations, request re-hash checks, generate reports.",
  },
  {
    role: "SUPERVISOR" as const,
    title: "Supervisor",
    color: "#E0A800",
    body: "Resolve integrity flags, view the full audit trail, oversee the ledger.",
  },
  {
    role: "ADMIN" as const,
    title: "Admin",
    color: "#A8B4C4",
    body: "Full access including user and role management.",
  },
];

const TRUST = [
  {
    title: "Append-only audit",
    body: "No update or delete APIs for the tamper-evident log — by design.",
  },
  {
    title: "Server-side hashing only",
    body: "Node crypto SHA-256 over stored buffers. Manual hashes require double-entry.",
  },
  {
    title: "Court-ready PDFs",
    body: "Times-serif LaTeX/Overleaf layout with monospace hashes and signature lines.",
  },
];

const HERO_WORDS = ["Digital", "evidence,", "provably", "intact."];

const METRICS = [
  { label: "Hash algorithm", value: 256, suffix: "-bit", prefix: "SHA-" },
  { label: "Roles enforced", value: 4, suffix: "" },
  { label: "Core modules", value: 6, suffix: "" },
  { label: "Audit mode", value: 1, suffix: "", display: "Append-only" },
];

export function LandingPage() {
  return (
    <div className="marketing-ink min-h-screen">
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 mesh-brand opacity-90" />
        <div className="pointer-events-none absolute inset-0 marketing-grid opacity-50" />
        <div
          className="pointer-events-none absolute -left-32 top-20 h-80 w-80 animate-float rounded-full bg-brand/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 animate-float rounded-full bg-accent-custody/20 blur-3xl"
          style={{ animationDelay: "1.5s" }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:pb-24 lg:pt-24">
          <div>
            <p className="animate-fade text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-soft">
              NCERT Forensic Evidence Unit
            </p>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              <span className="block text-brand-soft">EMS</span>
              <span className="mt-2 block text-[0.55em] font-bold sm:text-[0.5em]">
                {HERO_WORDS.map((word, i) => (
                  <span
                    key={word}
                    className="mr-[0.28em] inline-block animate-reveal"
                    style={{ animationDelay: `${120 + i * 80}ms` }}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </h1>
            <p className="mt-4 max-w-md animate-fade text-lg leading-relaxed text-[#C7CBD1]" style={{ animationDelay: "400ms" }}>
              Digital evidence inventory meets a tamper-evident chain of
              custody — who held it, when, and whether a single byte changed.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand px-6 text-white shadow-glow-brand hover:bg-brand-soft"
              >
                <Link href="/login">Sign in to EMS</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/5"
              >
                <a href="#modules">Explore modules</a>
              </Button>
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {METRICS.map((m, i) => (
                <li
                  key={m.label}
                  className="animate-reveal rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3"
                  style={{ animationDelay: `${500 + i * 60}ms` }}
                >
                  <p className="font-display text-lg font-bold text-white">
                    {m.display ?? (
                      <>
                        {m.prefix}
                        <AnimatedNumber value={m.value} />
                        {m.suffix}
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#9aa0a6]">{m.label}</p>
                </li>
              ))}
            </ul>
          </div>

          <HeroChain />
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d1118]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
              Live demos
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
              See the chain and the check
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal delayMs={40}>
              <LiveChainDemo />
            </Reveal>
            <Reveal delayMs={100}>
              <IntegrityDemo />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="capabilities" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
              Capabilities
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
              Everything the brief requires — and nothing silent.
            </h2>
            <p className="mt-3 max-w-2xl text-[#9aa0a6]">
              Register, track, verify, and report. Every state change leaves an
              audit trail that cannot be quietly rewritten.
            </p>
          </Reveal>

          <ul className="mt-12 grid gap-8 sm:grid-cols-2">
            {CAPABILITIES.map(({ title, body, accent, icon: Icon }, i) => (
              <Reveal key={title} as="li" delayMs={i * 50} className="flex gap-4">
                <span
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/10"
                  style={{
                    backgroundColor: `${accent}22`,
                    color: accent,
                    ["--glow" as string]: `${accent}55`,
                  }}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[#9aa0a6]">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="modules" className="border-t border-white/10 bg-[#0d1118]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
              Modules
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
              Colour-coded command surface
            </h2>
            <p className="mt-3 max-w-2xl text-[#9aa0a6]">
              Each module carries a distinct accent so operators always know where
              they are.
            </p>
          </Reveal>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULE_LIST.map(({ key, blurb }, i) => {
              const mod = MODULES[key];
              return (
                <Reveal key={key} as="li" delayMs={i * 40}>
                  <div
                    className="group relative h-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-1 hover:bg-white/[0.06]"
                    style={{ ["--glow" as string]: `${mod.hex}55` }}
                  >
                    <span
                      className="absolute left-0 top-0 h-full w-1 transition-shadow group-hover:shadow-[0_0_12px_var(--glow)]"
                      style={{ backgroundColor: mod.hex }}
                      aria-hidden
                    />
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: mod.hex }}
                    >
                      {mod.label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#C7CBD1]">
                      {blurb}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
              How it works
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
              Intake to courtroom-ready report
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} as="li" delayMs={i * 60} className="relative">
                <p className="font-display text-3xl font-bold text-brand/50">
                  {step.n}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#9aa0a6]">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="roles" className="border-t border-white/10 bg-[#0d1118]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
              Roles
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
              Access matched to the lab floor
            </h2>
            <p className="mt-3 max-w-2xl text-[#9aa0a6]">
              Permissions are enforced in middleware and again in every server
              action — hiding a button is never enough.
            </p>
          </Reveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {ROLES.map(({ role, title, body, color }, i) => (
              <Reveal key={role} as="li" delayMs={i * 50}>
                <div
                  className="h-full rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-1 hover:bg-white/[0.06]"
                  style={{ ["--glow" as string]: `${color}44` }}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4" style={{ color }} aria-hidden />
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ color, backgroundColor: `${color}22` }}
                    >
                      {role}
                    </span>
                    <h3 className="font-display text-base font-semibold text-white">
                      {title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#9aa0a6]">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="trust" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
              Trust
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
              Built so discrepancies cannot hide
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {TRUST.map((t, i) => (
              <Reveal key={t.title} as="li" delayMs={i * 60}>
                <h3 className="font-display text-lg font-semibold text-white">
                  {t.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9aa0a6]">
                  {t.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d1118]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
              Stack
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
              Built on proven foundations
            </h2>
          </Reveal>
          <div className="mt-10">
            <TechStackBand />
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
              FAQ
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
              Common questions
            </h2>
          </Reveal>
          <div className="mt-10">
            <FaqAccordion />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d1118]">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <Reveal>
            <ClipboardList
              className="mx-auto h-8 w-8 text-brand-soft"
              aria-hidden
            />
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white">
              Ready to walk the chain
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[#9aa0a6]">
              Sign in with a demo account — examiner, custodian, supervisor, or
              admin — and run the full custody loop end to end.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand px-6 text-white shadow-glow-brand hover:bg-brand-soft"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <p className="mt-6 font-mono text-xs text-[#6b7280]">
              admin@ems.local · Password123!
            </p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
