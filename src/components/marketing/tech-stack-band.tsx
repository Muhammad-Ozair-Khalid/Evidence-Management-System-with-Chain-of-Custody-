import { Reveal } from "@/components/ui-ems/reveal";
import { cn } from "@/lib/utils";

const STACK = [
  { name: "Next.js", detail: "App Router · RSC" },
  { name: "Prisma", detail: "Type-safe ORM" },
  { name: "PostgreSQL", detail: "Relational store" },
  { name: "NextAuth", detail: "Session & RBAC" },
  { name: "Recharts", detail: "Dashboard charts" },
  { name: "react-pdf", detail: "Custody PDFs" },
] as const;

export function TechStackBand({ className }: { className?: string }) {
  return (
    <Reveal className={cn("w-full", className)}>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
        Built with
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STACK.map(({ name, detail }, i) => (
          <li key={name}>
            <Reveal
              as="article"
              delayMs={i * 60}
              className="group flex h-full flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <p className="font-display text-sm font-semibold text-white">
                {name}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-[#9aa0a6]">
                {detail}
              </p>
            </Reveal>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
