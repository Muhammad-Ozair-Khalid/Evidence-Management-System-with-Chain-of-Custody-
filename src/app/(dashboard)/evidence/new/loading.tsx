import { Shimmer } from "@/components/ui-ems/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded-md bg-secondary/80" />
      <Shimmer className="h-[520px] w-full max-w-3xl rounded-lg border border-border" />
    </div>
  );
}
