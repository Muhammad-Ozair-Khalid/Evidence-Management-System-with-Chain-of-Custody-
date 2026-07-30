import { format } from "date-fns";
import { CheckCircle2, XCircle, MinusCircle, ShieldCheck } from "lucide-react";
import { type CustodyEventType } from "@prisma/client";
import { CustodyEventTypeTag } from "@/components/custody/event-type-tag";
import { EmptyState } from "@/components/ui-ems/empty-state";

export type IntegrityHistoryRow = {
  id: string;
  timestamp: string;
  eventType: CustodyEventType;
  hashAtEvent: string;
  hashMatch: boolean | null;
  actorName: string;
};

function ResultBadge({ match }: { match: boolean | null }) {
  if (match === true) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-evidence">
        <CheckCircle2 className="h-3.5 w-3.5" /> Pass
      </span>
    );
  }
  if (match === false) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-integrity">
        <XCircle className="h-3.5 w-3.5" /> Fail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <MinusCircle className="h-3.5 w-3.5" /> Pending
    </span>
  );
}

export function IntegrityHistory({ rows }: { rows: IntegrityHistoryRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No hash checks yet"
        description="Every custody handoff re-hashes this exhibit. Results will list here most-recent first."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-secondary/60">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Timestamp
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Event
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Hash value
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Result
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Actor
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border last:border-0 hover:bg-secondary/40"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {format(new Date(row.timestamp), "dd MMM yyyy HH:mm")}
              </td>
              <td className="px-4 py-3">
                <CustodyEventTypeTag type={row.eventType} />
              </td>
              <td className="px-4 py-3">
                <code className="break-all font-mono text-xs">
                  {row.hashAtEvent}
                </code>
              </td>
              <td className="px-4 py-3">
                <ResultBadge match={row.hashMatch} />
              </td>
              <td className="px-4 py-3">{row.actorName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
