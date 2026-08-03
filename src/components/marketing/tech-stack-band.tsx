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
        "grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#dde5e0] bg-[#dde5e0] sm:grid-cols-3 lg:grid-cols-6",
        className
      )}
    >
      {STACK.map(({ name, detail }, i) => (
        <Reveal key={name} as="li" delayMs={i * 50}>
          <article className="flex h-full flex-col items-center bg-white px-4 py-6 text-center transition-colors hover:bg-[#fafbfa]">
            <p className="font-display text-sm font-semibold text-[#14201a]">
              {name}
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-[#5f6d66]">
              {detail}
            </p>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}
