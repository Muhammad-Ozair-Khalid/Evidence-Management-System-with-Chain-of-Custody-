"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, FileSearch } from "lucide-react";
import { type Role } from "@prisma/client";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { auditActionLabel } from "@/lib/audit-labels";
import { ROLE_COLORS, type RoleKey } from "@/lib/modules";
import { cn } from "@/lib/utils";

export type AuditRow = {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  actor: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  evidenceId?: string | null;
};

function RoleBadge({ role }: { role: Role }) {
  const color = ROLE_COLORS[role as RoleKey] ?? ROLE_COLORS.ADMIN;
  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {role}
    </span>
  );
}

function entityHref(row: AuditRow): string | null {
  if (row.entityType === "EvidenceItem") {
    return `/evidence/${row.entityId}`;
  }
  if (row.entityType === "User") {
    return `/admin/users`;
  }
  if (row.entityType === "Auth") {
    return null;
  }
  if (row.evidenceId) {
    // metadata may have evidenceId for custody-related entries on EvidenceItem already
  }
  return null;
}

function entityLabel(row: AuditRow): string {
  if (row.entityType === "EvidenceItem" && row.evidenceId) {
    return row.evidenceId;
  }
  if (row.entityType === "Auth") {
    return String(row.entityId);
  }
  return `${row.entityType}:${row.entityId.slice(0, 8)}…`;
}

function MetadataPanel({ metadata }: { metadata: unknown }) {
  const [open, setOpen] = useState(false);
  const pretty = JSON.stringify(metadata ?? {}, null, 2);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-xs font-medium text-accent-audit hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        {open ? "Hide metadata" : "Show metadata"}
      </button>
      {open ? (
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-secondary p-3 font-mono text-[11px] text-canvas-foreground">
          {pretty}
        </pre>
      ) : null}
    </div>
  );
}

export function AuditTable({ rows }: { rows: AuditRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No audit entries match"
        description="Adjust filters or clear the search to see the append-only trail."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border bg-secondary/60">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Timestamp
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actor
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Action
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Entity
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Metadata
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const href = entityHref(row);
              return (
                <tr
                  key={row.id}
                  className="border-b border-border align-top last:border-0 hover:bg-secondary/40"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-muted-ems">
                    {format(new Date(row.timestamp), "dd MMM yyyy HH:mm:ss")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-canvas-foreground">
                        {row.actor.name}
                      </span>
                      <RoleBadge role={row.actor.role} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                        "border-accent-audit/30 bg-accent-audit/10 text-accent-audit"
                      )}
                    >
                      {auditActionLabel(row.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {href ? (
                      <Link
                        href={href}
                        className="font-mono text-xs font-medium text-accent-audit hover:underline"
                      >
                        {entityLabel(row)}
                      </Link>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">
                        {entityLabel(row)}
                      </span>
                    )}
                    <p className="text-muted-ems">{row.entityType}</p>
                  </td>
                  <td className="px-4 py-3">
                    <MetadataPanel metadata={row.metadata} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
