import Link from "next/link";
import { format } from "date-fns";
import { FileSearch } from "lucide-react";
import { type Role } from "@prisma/client";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auditActionLabel } from "@/lib/audit-labels";
import { can } from "@/lib/rbac";

export type ActivityEntry = {
  id: string;
  timestamp: string;
  action: string;
  actorName: string;
  summary: string;
};

export function SystemActivityWidget({
  entries,
  role,
}: {
  entries: ActivityEntry[];
  role: Role;
}) {
  const canViewAudit = can(role, "audit:view");

  return (
    <Card className="border-accent-audit/20">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-accent-audit">System activity</CardTitle>
        {canViewAudit ? (
          <Link
            href="/audit"
            className="text-xs font-medium text-accent-audit hover:underline"
          >
            View full audit trail
          </Link>
        ) : null}
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState
            compact
            icon={FileSearch}
            title="No recent activity"
            description="Audit entries will show up here as actions are performed."
            className="border-0 shadow-none"
          />
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
              <li
                key={e.id}
                className="border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-canvas-foreground">
                    {auditActionLabel(e.action)}
                  </p>
                  <time className="shrink-0 text-muted-ems">
                    {format(new Date(e.timestamp), "dd MMM HH:mm")}
                  </time>
                </div>
                <p className="text-muted-ems">
                  {e.actorName}
                  {e.summary ? ` · ${e.summary}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
