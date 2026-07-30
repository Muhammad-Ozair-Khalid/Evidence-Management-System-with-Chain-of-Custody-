import { cn } from "@/lib/utils";

export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-border bg-card",
        className
      )}
      aria-hidden
    />
  );
}

export function StatGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {Array.from({ length: cards }).map((_, i) => (
        <Shimmer key={i} className="h-[104px]" />
      ))}
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      <Shimmer className="h-[320px]" />
      <Shimmer className="h-[300px]" />
    </div>
  );
}

export function PanelSkeleton({ className }: { className?: string }) {
  return <Shimmer className={cn("h-[280px]", className)} />;
}
