import {
  StatCardSkeleton,
  TableSkeleton,
} from "@/components/ui-ems/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-56 animate-pulse rounded-md bg-secondary/80" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton rows={5} cols={6} />
    </div>
  );
}
