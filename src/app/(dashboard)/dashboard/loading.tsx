import {
  ChartsSkeleton,
  StatGridSkeleton,
} from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-md bg-secondary/80" />
      <StatGridSkeleton />
      <ChartsSkeleton />
    </div>
  );
}
