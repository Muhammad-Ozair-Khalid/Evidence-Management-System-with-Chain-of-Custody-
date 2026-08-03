import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small uppercase kicker above the title, e.g. the module name. */
  eyebrow?: string;
  /** Optional accent colour for the eyebrow (module hex). */
  eyebrowColor?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  eyebrowColor,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <span
              className="mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.09em]"
              style={
                eyebrowColor
                  ? {
                      color: eyebrowColor,
                      backgroundColor: `${eyebrowColor}18`,
                      boxShadow: `inset 0 0 0 1px ${eyebrowColor}33`,
                    }
                  : undefined
              }
            >
              {eyebrow}
            </span>
          ) : null}
          <h1 className="text-page-title text-canvas-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-1.5 max-w-3xl text-muted-ems">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      <div
        className="mt-4 h-px w-full"
        style={{
          backgroundImage: eyebrowColor
            ? `linear-gradient(to right, ${eyebrowColor}66, transparent 70%)`
            : undefined,
        }}
        aria-hidden
      >
        {!eyebrowColor ? <div className="rule-fade h-px w-full" /> : null}
      </div>
    </div>
  );
}
