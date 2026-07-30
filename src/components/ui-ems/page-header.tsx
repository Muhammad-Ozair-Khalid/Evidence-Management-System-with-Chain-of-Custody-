import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Small uppercase kicker above the title, e.g. the module name. */
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              {eyebrow}
            </p>
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
      <div className="rule-fade mt-4 h-px w-full" aria-hidden />
    </div>
  );
}
