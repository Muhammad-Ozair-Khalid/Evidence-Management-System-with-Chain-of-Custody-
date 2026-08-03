import { Reveal } from "@/components/ui-ems/reveal";
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
    <Reveal className={cn("w-full", className)}>
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
          FAQ
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Common questions
        </h2>

        <div className="mt-10 space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <Reveal key={q} as="article" delayMs={i * 50}>
              <details className="group rounded-xl border border-white/10 bg-white/[0.03] transition-colors open:bg-white/[0.05]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-base font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 text-[#9aa0a6] transition-transform duration-200 group-open:rotate-45 group-open:border-brand/40 group-open:text-brand-soft"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="border-t border-white/10 px-5 pb-4 pt-3">
                  <p className="text-sm leading-relaxed text-[#9aa0a6]">{a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
