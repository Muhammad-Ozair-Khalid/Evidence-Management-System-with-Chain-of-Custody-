import {
  ChartsSkeleton,
  StatGridSkeleton,
  WelcomeBandSkeleton,
} from "@/components/dashboard/skeletons";
import { PanelSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-shimmer rounded-md" />
      <WelcomeBandSkeleton />
      <StatGridSkeleton />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartsSkeleton />
        </div>
        <PanelSkeleton className="h-[560px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <PanelSkeleton />
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
    </div>
  );
}
