import { type CustodyEventType } from "@prisma/client";
import {
  CUSTODY_EVENT_COLORS,
  CUSTODY_EVENT_LABELS,
} from "@/lib/custody-labels";
import { cn } from "@/lib/utils";

export function CustodyEventTypeTag({
  type,
  className,
}: {
  type: CustodyEventType;
  className?: string;
}) {
  const c = CUSTODY_EVENT_COLORS[type];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: c.bg,
        color: c.hex,
        borderColor: c.border,
      }}
    >
      {CUSTODY_EVENT_LABELS[type]}
    </span>
  );
}
