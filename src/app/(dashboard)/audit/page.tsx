import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuditExportButton } from "@/components/audit/audit-export-button";
import { AuditFilters } from "@/components/audit/audit-filters";
import { AuditTable, type AuditRow } from "@/components/audit/audit-table";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { buildAuditWhere } from "@/lib/audit-query";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { SYSTEM_AUDIT_EMAIL } from "@/lib/audit";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    action?: string;
    actor?: string;
    entityType?: string;
    from?: string;
    to?: string;
  };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "audit:view")) {
    redirect("/dashboard?error=forbidden");
  }

  const filters = {
    q: searchParams.q,
    action: searchParams.action,
    actorId: searchParams.actor,
    entityType: searchParams.entityType,
    from: searchParams.from,
    to: searchParams.to,
  };

  const [entries, actors] = await Promise.all([
    prisma.auditLogEntry.findMany({
      where: buildAuditWhere(filters),
      orderBy: { timestamp: "desc" },
      take: 500,
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        OR: [{ isActive: true }, { email: SYSTEM_AUDIT_EMAIL }],
      },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const rows: AuditRow[] = entries.map((e) => {
    const meta = e.metadata as Record<string, unknown> | null;
    const evidenceId =
      typeof meta?.evidenceId === "string" ? meta.evidenceId : null;
    return {
      id: e.id,
      timestamp: e.timestamp.toISOString(),
      action: e.action,
      entityType: e.entityType,
      entityId: e.entityId,
      metadata: e.metadata,
      actor: e.actor,
      evidenceId,
    };
  });

  return (
    <div>
      <PageHeader
        eyebrow="Audit Trail"
        title="System activity log"
        subtitle="Append-only, system-wide log of sensitive actions. SUPERVISOR/ADMIN only."
        actions={
          <div className="flex items-center gap-2">
            <ModuleBadge module="audit" />
            <Suspense fallback={null}>
              <AuditExportButton />
            </Suspense>
          </div>
        }
      />

      <Suspense
        fallback={
          <div className="mb-4 h-28 animate-pulse rounded-lg border border-border bg-card" />
        }
      >
        <AuditFilters actors={actors} />
      </Suspense>

      <AuditTable rows={rows} />
    </div>
  );
}
