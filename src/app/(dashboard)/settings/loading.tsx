import { Shimmer } from "@/components/ui-ems/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-56 animate-pulse rounded-md bg-secondary/80" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Shimmer className="h-[360px] rounded-lg border border-border lg:col-span-1" />
        <div className="space-y-6 lg:col-span-2">
          <Shimmer className="h-[240px] rounded-lg border border-border" />
          <Shimmer className="h-[280px] rounded-lg border border-border" />
        </div>
      </div>
    </div>
  );
}
