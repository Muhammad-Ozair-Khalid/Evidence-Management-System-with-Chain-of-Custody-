import { redirect } from "next/navigation";
import { BulkCaseReportForm } from "@/components/reports/bulk-case-report-form";
import {
  ReportsHistoryTable,
  type ReportHistoryRow,
} from "@/components/reports/reports-history-table";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { SectionPanel } from "@/components/ui-ems/section-panel";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ClipboardList } from "lucide-react";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "reports:generate")) {
    redirect("/dashboard?error=forbidden");
  }

  const [generations, caseGroups] = await Promise.all([
    prisma.auditLogEntry.findMany({
      where: { action: "REPORT_GENERATED" },
      orderBy: { timestamp: "desc" },
      take: 100,
      include: {
        actor: { select: { name: true, role: true } },
      },
    }),
    prisma.evidenceItem.groupBy({
      by: ["caseNumber"],
      _count: { _all: true },
      orderBy: { caseNumber: "asc" },
    }),
  ]);

  const caseNumbers = caseGroups.map((g) => g.caseNumber);

  const historyRows: ReportHistoryRow[] = generations.map((g) => {
    const meta = g.metadata as Record<string, unknown>;
    return {
      id: g.id,
      timestamp: g.timestamp.toISOString(),
      kind: typeof meta.reportKind === "string" ? meta.reportKind : "—",
      evidenceId: typeof meta.evidenceId === "string" ? meta.evidenceId : null,
      entityId: g.entityId,
      caseNumber: typeof meta.caseNumber === "string" ? meta.caseNumber : null,
      filename: typeof meta.filename === "string" ? meta.filename : "—",
      actorName: g.actor.name,
      actorRole: g.actor.role,
    };
  });

  return (
    <div>
      <PageHeader
        eyebrow="Reports"
        eyebrowColor="#8764B8"
        title="Custody reporting"
        subtitle="Generate printable Chain of Custody PDFs per exhibit or by case, typeset in a formal LaTeX-style layout."
        actions={<ModuleBadge module="reports" />}
      />

      <SectionPanel
        accent="#8764B8"
        title="Generate"
        description="Bulk case PDFs — same LaTeX-style typesetting as single-exhibit reports."
        className="mb-6"
      >
        <BulkCaseReportForm caseNumbers={caseNumbers} />
      </SectionPanel>

      <SectionPanel
        accent="#8764B8"
        title="Previously generated reports"
        description="Recent custody PDFs from this workspace or an exhibit’s Reports tab."
      >
        {historyRows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No reports generated yet"
            description="Open an evidence item’s Reports tab or use bulk case generate above to create the first PDF."
          />
        ) : (
          <ReportsHistoryTable rows={historyRows} />
        )}
      </SectionPanel>
    </div>
  );
}
