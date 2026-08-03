import { Shimmer, TableSkeleton } from "@/components/ui-ems/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-56 animate-pulse rounded-md bg-secondary/80" />
      <Shimmer className="h-40 w-full rounded-lg border border-border" />
      <div className="h-5 w-48 animate-pulse rounded-md bg-secondary/80" />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
