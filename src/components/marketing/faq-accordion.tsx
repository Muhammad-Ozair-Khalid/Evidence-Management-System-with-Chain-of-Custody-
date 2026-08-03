import { Reveal } from "@/components/ui-ems/reveal";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How does SHA-256 hashing work in EMS?",
    a: "Hashes are computed server-side over stored file buffers at intake and again on every custody move. The client never supplies a trusted hash — Node crypto produces a 64-character hex digest that is stored and compared on each re-verification.",
  },
  {
    q: "What roles exist and what can each do?",
    a: "Custodians hold exhibits and log transfers. Examiners register evidence, run examinations, and request re-hash checks. Supervisors resolve integrity flags and oversee the ledger. Admins manage users and roles. Permissions are enforced in middleware and every server action.",
  },
  {
    q: "Is the audit log really append-only?",
    a: "Yes — by design there are no update or delete APIs for the tamper-evident audit trail. Every sensitive action (login, custody event, hash check, report generation) is recorded with actor, timestamp, and context.",
  },
  {
    q: "What do the custody PDFs include?",
    a: "Reports use a LaTeX-style layout with serif body text, monospace hashes, handler signatures, and a chronological chain reflecting the exhibit state as of generation. Export per item or per case via react-pdf.",
  },
  {
    q: "How do I try the demo?",
    a: "Sign in at /login with any demo account — examiner, custodian, supervisor, or admin@ems.local — using Password123!. Run the full loop: register an exhibit, transfer it, trigger a re-hash, and generate a custody PDF.",
  },
] as const;

export function FaqAccordion({ className }: { className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <Reveal>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: MODULES.reports.hex }}
        >
          FAQ
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-[2.15rem]">
          Common questions
        </h2>
      </Reveal>

      <div className="mx-auto mt-12 max-w-3xl space-y-2">
        {FAQS.map(({ q, a }, i) => (
          <Reveal key={q} as="article" delayMs={i * 45}>
            <details className="group border-b border-white/[0.08] transition-colors open:border-[#8764B8]/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-[15px] font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="text-left">{q}</span>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 text-sm text-[#9aa0a6] transition-all duration-200 group-open:rotate-45 group-open:border-[#8764B8]/50 group-open:text-[#8764B8]"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <div className="pb-5 pr-10">
                <p className="text-sm leading-relaxed text-[#C5CCD6]">{a}</p>
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
