import { cn } from "@/lib/utils";

export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-secondary/80",
        className
      )}
      aria-hidden
    />
  );
}

export function TableSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-card shadow-card"
      role="status"
      aria-label="Loading table"
    >
      <div className="border-b border-border bg-secondary/60 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Shimmer key={i} className="h-3 w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Shimmer
                key={c}
                className={cn("h-4", c === 0 ? "w-28" : "w-20 flex-1")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimelineSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading timeline">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex w-20 flex-col items-end gap-1">
            <Shimmer className="h-3 w-14" />
            <Shimmer className="h-3 w-10" />
          </div>
          <div className="relative flex flex-col items-center">
            <Shimmer className="h-3 w-3 rounded-full" />
            {i < items - 1 ? (
              <div className="mt-1 w-px flex-1 bg-border" />
            ) : null}
          </div>
          <div className="mb-2 flex-1 rounded-lg border border-border bg-card p-4">
            <Shimmer className="mb-2 h-4 w-32" />
            <Shimmer className="mb-1.5 h-3 w-full" />
            <Shimmer className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-7 w-16" />
        </div>
        <Shimmer className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}
