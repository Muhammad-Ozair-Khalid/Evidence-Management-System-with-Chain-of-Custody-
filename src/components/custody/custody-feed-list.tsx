"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Scale } from "lucide-react";
import { type CustodyEventType } from "@prisma/client";
import { CustodyEventTypeTag } from "@/components/custody/event-type-tag";
import { ExpandableReason } from "@/components/custody/expandable-reason";
import { EmptyState } from "@/components/ui-ems/empty-state";

export type CustodyFeedRow = {
  id: string;
  timestamp: string;
  eventType: CustodyEventType;
  location: string;
  reason: string;
  returnDestination: string | null;
  evidence: { id: string; evidenceId: string; title: string };
  handlerFrom: { name: string } | null;
  handlerTo: { name: string } | null;
};

export function CustodyFeedList({ rows }: { rows: CustodyFeedRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Scale}
        title="No custody events match"
        description="Try clearing filters or widen the date range to see ledger activity."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <ul className="divide-y divide-border">
        {rows.map((row) => {
          const toLabel =
            row.eventType === "RETURN"
              ? row.returnDestination ?? "Destination"
              : row.handlerTo?.name ?? "—";
          return (
            <li key={row.id} className="px-4 py-4 hover:bg-secondary/40">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <time className="text-xs font-medium text-muted-foreground">
                      {format(new Date(row.timestamp), "dd MMM yyyy HH:mm")}
                    </time>
                    <CustodyEventTypeTag type={row.eventType} />
                    <Link
                      href={`/evidence/${row.evidence.id}?tab=custody`}
                      className="font-mono text-sm font-semibold text-accent-custody hover:underline"
                    >
                      {row.evidence.evidenceId}
                    </Link>
                  </div>
                  <p className="text-sm text-canvas-foreground">
                    <span className="text-muted-foreground">
                      {row.handlerFrom?.name ?? "—"}
                    </span>
                    <span className="mx-1.5 text-accent-custody">→</span>
                    <span className="font-medium">{toLabel}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="text-muted-ems">{row.location}</span>
                  </p>
                  <ExpandableReason reason={row.reason} />
                </div>
                <p className="shrink-0 text-muted-ems lg:max-w-[220px] lg:text-right">
                  {row.evidence.title}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
