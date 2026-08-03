import { type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/ui-ems/animated-number";
import { Sparkline } from "@/components/ui-ems/sparkline";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentColor: string;
  trend?: { value: string; positive?: boolean };
  delta?: { value: string; positive?: boolean };
  sparkline?: number[];
  className?: string;
  /** Stagger delay (ms) for entrance animation. */
  riseDelayMs?: number;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accentColor,
  trend,
  delta,
  sparkline,
  className,
  riseDelayMs,
}: StatCardProps) {
  const numeric = typeof value === "number";
  const trendInfo = delta ?? trend;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden p-5 hover-lift",
        riseDelayMs != null && "animate-rise",
        className
      )}
      style={
        {
          ...(riseDelayMs != null
            ? { animationDelay: `${riseDelayMs}ms` }
            : {}),
          ["--glow" as string]: `${accentColor}55`,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{
          background: `linear-gradient(180deg, ${accentColor}, ${accentColor}88)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.08] transition-opacity duration-300 ease-smooth group-hover:opacity-[0.18]"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3 pl-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
            {label}
          </p>
          <p className="text-stat-numeral mt-2 text-canvas-foreground">
            {numeric ? <AnimatedNumber value={value} /> : value}
          </p>
          {trendInfo ? (
            <p
              className={cn(
                "mt-2 text-xs font-medium",
                trendInfo.positive === false
                  ? "text-accent-integrity"
                  : "text-accent-evidence"
              )}
            >
              {trendInfo.value}
            </p>
          ) : null}
          {sparkline && sparkline.length > 1 ? (
            <div className="mt-3">
              <Sparkline data={sparkline} color={accentColor} />
            </div>
          ) : null}
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 ease-smooth group-hover:scale-105"
          style={{
            backgroundColor: `${accentColor}14`,
            color: accentColor,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ["--tw-ring-color" as any]: `${accentColor}2E`,
            boxShadow: `0 0 0 0 ${accentColor}00`,
          }}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </div>
      </div>
    </Card>
  );
}
