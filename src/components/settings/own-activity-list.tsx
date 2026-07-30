import Link from "next/link";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { auditActionLabel } from "@/lib/audit-labels";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type OwnActivityEntry = {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
};

export function OwnActivityList({ entries }: { entries: OwnActivityEntry[] }) {
  return (
    <Card className="border-accent-audit/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-accent-audit">Your recent activity</CardTitle>
        <p className="text-muted-ems">
          Last 15 audit entries attributed to your account.
        </p>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState
            compact
            icon={Activity}
            title="No activity yet"
            description="Actions you take in EMS will appear in this list."
            className="border-0 shadow-none"
          />
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-canvas-foreground">
                    {auditActionLabel(e.action)}
                  </span>
                  <time className="text-muted-ems">
                    {format(new Date(e.timestamp), "dd MMM yyyy HH:mm")}
                  </time>
                </div>
                <p className="text-xs text-muted-foreground">
                  {e.entityType === "EvidenceItem" ? (
                    <Link
                      href={`/evidence/${e.entityId}`}
                      className="font-mono text-accent-evidence hover:underline"
                    >
                      {e.summary}
                    </Link>
                  ) : (
                    <span className="font-mono">{e.summary}</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
