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
    <Card className={cn("relative overflow-hidden", className)}>
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div>
          <p className="text-muted-ems">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-canvas-foreground">
            {value}
          </p>
          {trend ? (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
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
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
