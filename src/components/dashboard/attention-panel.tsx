import Link from "next/link";
import { format } from "date-fns";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export type FlaggedSummary = {
  id: string;
  evidenceId: string;
  title: string;
  caseNumber: string;
  flaggedAt: string;
};

export function AttentionPanel({ items }: { items: FlaggedSummary[] }) {
  if (items.length === 0) {
    return (
      <Card className="border-accent-evidence/30 bg-accent-evidence/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-evidence/15 text-accent-evidence">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-section-title text-accent-evidence">
              All evidence integrity checks passing
            </p>
            <p className="mt-0.5 text-muted-ems">
              No exhibits are currently flagged for hash mismatch.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-accent-integrity" />
        <h2 className="text-section-title text-accent-integrity">
          Attention needed — {items.length} item
          {items.length === 1 ? "" : "s"} integrity flagged
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item.id}
            className="border-accent-integrity/40 bg-accent-integrity/5 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-accent-integrity">
                  {item.evidenceId}
                </p>
                <p className="truncate text-sm font-medium text-canvas-foreground">
                  {item.title}
                </p>
                <p className="text-muted-ems">
                  Case {item.caseNumber} ·{" "}
                  {format(new Date(item.flaggedAt), "dd MMM yyyy HH:mm")}
                </p>
              </div>
              <AlertTriangle
                className="h-4 w-4 shrink-0 text-accent-integrity"
                aria-hidden
              />
            </div>
            <Link
              href="/integrity"
              className="mt-3 inline-flex text-xs font-semibold text-accent-integrity hover:underline"
            >
              Review &amp; resolve →
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
