import { TimelineSkeleton } from "@/components/ui-ems/skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-md bg-secondary/80" />
      <TimelineSkeleton items={5} />
    </div>
  );
}
