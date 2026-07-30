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
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
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
          "mb-4 flex items-center justify-center rounded-full bg-secondary text-muted-foreground",
          compact ? "h-10 w-10" : "h-12 w-12"
        )}
      >
        <Icon className={compact ? "h-5 w-5" : "h-6 w-6"} aria-hidden />
      </div>
      <h2 className="text-section-title text-canvas-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-muted-ems">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
