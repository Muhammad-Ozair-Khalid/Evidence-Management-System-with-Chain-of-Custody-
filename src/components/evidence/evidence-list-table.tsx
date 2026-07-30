"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";
import { type EvidenceStatus, type EvidenceType } from "@prisma/client";
import { StatusPill } from "@/components/evidence/status-pill";
import { DataTable, type DataTableColumn } from "@/components/ui-ems/data-table";
import { Button } from "@/components/ui/button";
import { EVIDENCE_TYPE_LABELS } from "@/lib/evidence-labels";

export type EvidenceListRow = {
  id: string;
  evidenceId: string;
  title: string;
  caseNumber: string;
  evidenceType: EvidenceType;
  status: EvidenceStatus;
  intakeDate: string;
  custodianName: string;
  custodianId: string;
};

export function EvidenceListTable({ rows }: { rows: EvidenceListRow[] }) {
  const columns = useMemo<DataTableColumn<EvidenceListRow>[]>(
    () => [
      {
        key: "evidenceId",
        header: "Evidence ID",
        sortable: true,
        sortValue: (r) => r.evidenceId,
        cell: (r) => (
          <Link
            href={`/evidence/${r.id}`}
            className="font-mono text-sm font-medium text-accent-evidence hover:underline"
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
        cell: (r) => (
          <div className="min-w-[160px]">
            <p className="font-medium text-canvas-foreground">{r.title}</p>
            <p className="text-muted-ems">{r.caseNumber}</p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        sortable: true,
        sortValue: (r) => r.evidenceType,
        cell: (r) => EVIDENCE_TYPE_LABELS[r.evidenceType],
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        sortValue: (r) => r.status,
        cell: (r) => <StatusPill status={r.status} />,
      },
      {
        key: "custodian",
        header: "Current custodian",
        sortable: true,
        sortValue: (r) => r.custodianName.toLowerCase(),
        cell: (r) => r.custodianName,
      },
      {
        key: "intake",
        header: "Intake date",
        sortable: true,
        sortValue: (r) => new Date(r.intakeDate).getTime(),
        cell: (r) => format(new Date(r.intakeDate), "dd MMM yyyy HH:mm"),
      },
      {
        key: "actions",
        header: "",
        className: "w-[90px]",
        cell: (r) => (
          <Button asChild variant="outline" size="sm">
            <Link href={`/evidence/${r.id}`}>View</Link>
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(r) => r.id}
      emptyMessage="No evidence items match your filters."
    />
  );
}
