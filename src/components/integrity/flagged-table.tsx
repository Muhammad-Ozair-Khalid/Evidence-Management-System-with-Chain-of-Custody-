"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { StatusPill } from "@/components/evidence/status-pill";
import {
  ResolveIntegrityDialog,
  type FlaggedItemContext,
} from "@/components/integrity/resolve-dialog";
import { DataTable, type DataTableColumn } from "@/components/ui-ems/data-table";

export type FlaggedTableRow = FlaggedItemContext & {
  custodianName: string;
};

export function FlaggedIntegrityTable({
  rows,
  canResolve,
}: {
  rows: FlaggedTableRow[];
  canResolve: boolean;
}) {
  const columns = useMemo<DataTableColumn<FlaggedTableRow>[]>(
    () => [
      {
        key: "evidenceId",
        header: "Evidence ID",
        sortable: true,
        sortValue: (r) => r.evidenceId,
        cell: (r) => (
          <Link
            href={`/evidence/${r.id}?tab=integrity`}
            className="font-mono text-sm font-medium text-accent-integrity hover:underline"
          >
            {r.evidenceId}
          </Link>
        ),
      },
      {
        key: "title",
        header: "Title",
        sortable: true,
        sortValue: (r) => r.title.toLowerCase(),
        cell: (r) => <span className="font-medium">{r.title}</span>,
      },
      {
        key: "status",
        header: "Status",
        cell: () => <StatusPill status="INTEGRITY_FLAGGED" />,
        hideOnMobile: true,
      },
      {
        key: "flaggedAt",
        header: "Last mismatch",
        sortable: true,
        sortValue: (r) =>
          r.flaggedAt ? new Date(r.flaggedAt).getTime() : 0,
        cell: (r) =>
          r.flaggedAt
            ? format(new Date(r.flaggedAt), "dd MMM yyyy HH:mm")
            : "—",
      },
      {
        key: "custodian",
        header: "Custodian",
        sortable: true,
        sortValue: (r) => r.custodianName.toLowerCase(),
        cell: (r) => r.custodianName,
      },
      {
        key: "action",
        header: "Action",
        cell: (r) =>
          canResolve ? (
            <ResolveIntegrityDialog item={r} />
          ) : (
            <span className="text-muted-ems">Supervisor only</span>
          ),
      },
    ],
    [canResolve]
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(r) => r.id}
      emptyTitle="All clear"
      emptyMessage="No items are INTEGRITY_FLAGGED right now."
      filterPlaceholder="Filter flagged items…"
      filterFn={(row, q) =>
        row.evidenceId.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.custodianName.toLowerCase().includes(q)
      }
    />
  );
}
