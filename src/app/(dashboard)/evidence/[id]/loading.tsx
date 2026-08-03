import { Shimmer, TableSkeleton } from "@/components/ui-ems/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-28 animate-pulse rounded-md bg-secondary/80" />
        <div className="h-8 w-72 animate-pulse rounded-md bg-secondary/80" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-secondary/80" />
      </div>
      <Shimmer className="h-20 w-full rounded-lg border border-border" />
      <div className="flex gap-2 border-b border-border pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-md bg-secondary/80"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Shimmer className="h-[320px] rounded-lg border border-border lg:col-span-2" />
        <Shimmer className="h-[280px] rounded-lg border border-border" />
      </div>
      <TableSkeleton rows={3} cols={4} />
    </div>
  );
}
