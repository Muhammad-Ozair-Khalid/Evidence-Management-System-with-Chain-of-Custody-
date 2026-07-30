import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentColor: string;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accentColor,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden p-5 hover:shadow-card-hover",
        className
      )}
    >
      {/* Accent spine + faint colour wash that warms on hover. */}
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.07] transition-opacity duration-300 ease-smooth group-hover:opacity-[0.14]"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3 pl-2.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
            {label}
          </p>
          <p className="tabular mt-1.5 text-[28px] font-semibold leading-none tracking-tight text-canvas-foreground">
            {value}
          </p>
          {trend ? (
            <p
              className={cn(
                "mt-2 text-xs font-medium",
                trend.positive === false
                  ? "text-accent-integrity"
                  : "text-accent-evidence"
              )}
            >
              {trend.value}
            </p>
          ) : null}
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform duration-300 ease-smooth group-hover:scale-105"
          style={{
            backgroundColor: `${accentColor}14`,
            color: accentColor,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ["--tw-ring-color" as any]: `${accentColor}2E`,
          }}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </div>
      </div>
    </Card>
  );
}
