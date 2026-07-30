import Link from "next/link";
import { format } from "date-fns";
import { Scale } from "lucide-react";
import { type CustodyEventType } from "@prisma/client";
import { CustodyEventTypeTag } from "@/components/custody/event-type-tag";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type RecentCustodyRow = {
  id: string;
  timestamp: string;
  eventType: CustodyEventType;
  fromName: string;
  toName: string;
  evidenceDbId: string;
  evidenceId: string;
};

export function RecentCustodyFeed({ rows }: { rows: RecentCustodyRow[] }) {
  return (
    <Card className="border-accent-custody/20">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-accent-custody">
          Recent custody activity
        </CardTitle>
        <Link
          href="/custody"
          className="text-xs font-medium text-accent-custody hover:underline"
        >
          View ledger
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            compact
            icon={Scale}
            title="No custody events yet"
            description="Transfers, examinations, and returns will appear here as they are logged."
            className="border-0 shadow-none"
          />
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <CustodyEventTypeTag type={row.eventType} />
                  <Link
                    href={`/evidence/${row.evidenceDbId}?tab=custody`}
                    className="font-mono text-xs font-semibold text-accent-custody hover:underline"
                  >
                    {row.evidenceId}
                  </Link>
                  <time className="ml-auto text-muted-ems">
                    {format(new Date(row.timestamp), "dd MMM HH:mm")}
                  </time>
                </div>
                <p className="mt-1 text-sm text-canvas-foreground">
                  <span className="text-muted-foreground">{row.fromName}</span>
                  <span className="mx-1.5 text-accent-custody">→</span>
                  <span>{row.toName}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
