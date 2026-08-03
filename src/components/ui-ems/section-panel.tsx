import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionPanelProps = {
  children: ReactNode;
  /** Module accent hex — drives wash + grid tint. */
  accent: string;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** denser pattern for alert/queue panels */
  intensity?: "soft" | "strong";
};

/**
 * Patterned content panel used across Evidence / Custody / Integrity / Reports.
 * Decorative only — no interaction chrome beyond optional header.
 */
export function SectionPanel({
  children,
  accent,
  title,
  description,
  actions,
  className,
  bodyClassName,
  intensity = "soft",
}: SectionPanelProps) {
  const opacity = intensity === "strong" ? 0.55 : 0.35;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-surface/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        className
      )}
      style={{
        boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.04), 0 0 0 1px color-mix(in srgb, ${accent} 12%, transparent)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          opacity,
          backgroundImage: `
            radial-gradient(ellipse 70% 55% at 0% 0%, ${accent}33, transparent 58%),
            radial-gradient(ellipse 50% 40% at 100% 100%, ${accent}18, transparent 55%),
            linear-gradient(${accent}14 1px, transparent 1px),
            linear-gradient(90deg, ${accent}14 1px, transparent 1px)
          `,
          backgroundSize: "auto, auto, 28px 28px, 28px 28px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.25) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full blur-3xl"
        aria-hidden
        style={{ background: `${accent}22` }}
      />

      {(title || description || actions) && (
        <header className="relative z-[1] flex flex-col gap-2 border-b border-border/50 px-4 py-3.5 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-section-title text-canvas-foreground">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 max-w-2xl text-sm text-muted-ems">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </header>
      )}

      <div className={cn("relative z-[1] p-4 sm:p-5", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
