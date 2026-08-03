import { Suspense } from "react";
import { redirect } from "next/navigation";
import { startOfDay } from "date-fns";
import { Activity, FileSearch, ShieldAlert, Users } from "lucide-react";
import { AuditExportButton } from "@/components/audit/audit-export-button";
import { AuditFilters } from "@/components/audit/audit-filters";
import { AuditTable, type AuditRow } from "@/components/audit/audit-table";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { StatCard } from "@/components/ui-ems/stat-card";
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

  const todayStart = startOfDay(new Date());

  const [entries, actors, todayCount, flagCount, actorDistinct] =
    await Promise.all([
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
      prisma.auditLogEntry.count({
        where: { timestamp: { gte: todayStart } },
      }),
      prisma.auditLogEntry.count({
        where: {
          action: "HASH_MISMATCH_FLAGGED",
          timestamp: { gte: todayStart },
        },
      }),
      prisma.auditLogEntry.findMany({
        where: { timestamp: { gte: todayStart } },
        distinct: ["actorId"],
        select: { actorId: true },
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
        eyebrowColor="#00B7C3"
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

      <div className="mb-6 grid gap-4 stagger-children sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Actions today" value={todayCount} icon={Activity} accentColor="#00B7C3" />
        <StatCard label="Matching rows" value={entries.length} icon={FileSearch} accentColor="#5C6B7A" />
        <StatCard label="Flags today" value={flagCount} icon={ShieldAlert} accentColor={flagCount > 0 ? "#D13438" : "#5C6B7A"} />
        <StatCard label="Active actors today" value={actorDistinct.length} icon={Users} accentColor="#8764B8" />
      </div>

      <Suspense
        fallback={
          <div className="mb-4 h-28 animate-shimmer rounded-lg border border-border" />
        }
      >
        <AuditFilters actors={actors} />
      </Suspense>

      <AuditTable rows={rows} />
    </div>
  );
}
