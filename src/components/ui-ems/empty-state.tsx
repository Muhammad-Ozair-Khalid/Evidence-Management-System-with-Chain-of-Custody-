import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  /** Compact inline empty for widgets / cards. */
  compact?: boolean;
  accentColor?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
  accentColor,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-8" : "px-6 py-16",
        className
      )}
    >
      <div
        className={cn(
          "relative mb-4 flex items-center justify-center rounded-full",
          compact ? "h-12 w-12" : "h-14 w-14"
        )}
        style={
          accentColor
            ? {
                backgroundColor: `${accentColor}18`,
                color: accentColor,
                ["--glow" as string]: `${accentColor}55`,
              }
            : undefined
        }
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            accentColor ? "animate-pulse-ring" : "bg-secondary"
          )}
          aria-hidden
        />
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full",
            compact ? "h-10 w-10" : "h-12 w-12",
            !accentColor && "bg-secondary text-muted-foreground"
          )}
          style={
            accentColor
              ? { backgroundColor: `${accentColor}18`, color: accentColor }
              : undefined
          }
        >
          <Icon className={compact ? "h-5 w-5" : "h-6 w-6"} aria-hidden />
        </div>
      </div>
      <h2 className="text-section-title text-canvas-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-muted-ems">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
