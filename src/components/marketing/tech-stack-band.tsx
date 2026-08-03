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
    <ul
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] sm:grid-cols-3 lg:grid-cols-6",
        className
      )}
    >
      {STACK.map(({ name, detail }, i) => (
        <Reveal key={name} as="li" delayMs={i * 50}>
          <article className="flex h-full flex-col items-center bg-[#0B0E14] px-4 py-6 text-center transition-colors hover:bg-[#10151c]">
            <p className="font-display text-sm font-semibold text-white">
              {name}
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-[#8B9199]">
              {detail}
            </p>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}
