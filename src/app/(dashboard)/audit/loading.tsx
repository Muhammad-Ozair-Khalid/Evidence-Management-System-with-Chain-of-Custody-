import { TableSkeleton } from "@/components/ui-ems/skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-56 animate-pulse rounded-md bg-secondary/80" />
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
