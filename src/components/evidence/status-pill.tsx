import { AlertTriangle } from "lucide-react";
import { type EvidenceStatus } from "@prisma/client";
import {
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUS_STYLES,
} from "@/lib/evidence-labels";
import { cn } from "@/lib/utils";

export function StatusPill({
  status,
  className,
}: {
  status: EvidenceStatus;
  className?: string;
}) {
  const style = EVIDENCE_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      {status === "INTEGRITY_FLAGGED" ? (
        <AlertTriangle className="h-3 w-3" aria-hidden />
      ) : null}
      {EVIDENCE_STATUS_LABELS[status]}
    </span>
  );
}
