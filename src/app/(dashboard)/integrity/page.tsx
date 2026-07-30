import Link from "next/link";
import { redirect } from "next/navigation";
import { format, differenceInMinutes, startOfMonth } from "date-fns";
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import {
  ResolveIntegrityDialog,
  type FlaggedItemContext,
} from "@/components/integrity/resolve-dialog";
import { StatusPill } from "@/components/evidence/status-pill";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { PageHeader } from "@/components/ui-ems/page-header";
import { StatCard } from "@/components/ui-ems/stat-card";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export default async function IntegrityPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "integrity:rehash")) {
    redirect("/dashboard?error=forbidden");
  }

  const canResolve = can(session.user.role, "integrity:resolve");
  const monthStart = startOfMonth(new Date());

  const [
    flaggedItems,
    checksPassedMonth,
    checksFailedMonth,
    mismatchFlags,
    resolutions,
  ] = await Promise.all([
    prisma.evidenceItem.findMany({
      where: { status: "INTEGRITY_FLAGGED" },
      orderBy: { updatedAt: "desc" },
      include: {
        currentCustodian: { select: { name: true } },
        custodyEvents: {
          where: { hashMatch: false },
          orderBy: { timestamp: "desc" },
          take: 1,
          include: {
            handlerFrom: { select: { name: true } },
          },
        },
      },
    }),
    prisma.custodyEvent.count({
      where: {
        hashMatch: true,
        timestamp: { gte: monthStart },
      },
    }),
    prisma.custodyEvent.count({
      where: {
        hashMatch: false,
        timestamp: { gte: monthStart },
      },
    }),
    prisma.auditLogEntry.findMany({
      where: { action: "HASH_MISMATCH_FLAGGED" },
      orderBy: { timestamp: "asc" },
      select: { entityId: true, timestamp: true },
    }),
    prisma.auditLogEntry.findMany({
      where: { action: "INTEGRITY_RESOLVED" },
      orderBy: { timestamp: "asc" },
      select: { entityId: true, timestamp: true },
    }),
  ]);

  // Avg time to resolution: pair first flag with first subsequent resolve per entity
  const flagByEntity = new Map<string, Date>();
  for (const f of mismatchFlags) {
    if (!flagByEntity.has(f.entityId)) {
      flagByEntity.set(f.entityId, f.timestamp);
    }
  }
  const resolveTimes: number[] = [];
  const resolvedEntities = new Set<string>();
  for (const r of resolutions) {
    if (resolvedEntities.has(r.entityId)) continue;
    const flaggedAt = flagByEntity.get(r.entityId);
    if (flaggedAt && r.timestamp >= flaggedAt) {
      resolveTimes.push(differenceInMinutes(r.timestamp, flaggedAt));
      resolvedEntities.add(r.entityId);
    }
  }
  const avgMinutes =
    resolveTimes.length > 0
      ? Math.round(
          resolveTimes.reduce((a, b) => a + b, 0) / resolveTimes.length
        )
      : null;
  const avgLabel =
    avgMinutes == null
      ? "—"
      : avgMinutes < 60
        ? `${avgMinutes}m`
        : `${(avgMinutes / 60).toFixed(1)}h`;

  const flaggedContexts: FlaggedItemContext[] = flaggedItems.map((item) => {
    const mismatch = item.custodyEvents[0] ?? null;
    return {
      id: item.id,
      evidenceId: item.evidenceId,
      title: item.title,
      expectedHash: item.currentHash,
      flaggedAt: mismatch?.timestamp.toISOString() ?? item.updatedAt.toISOString(),
      mismatchEvent: mismatch
        ? {
            id: mismatch.id,
            eventType: mismatch.eventType,
            timestamp: mismatch.timestamp.toISOString(),
            hashAtEvent: mismatch.hashAtEvent,
            location: mismatch.location,
            reason: mismatch.reason,
            actorName: mismatch.handlerFrom?.name ?? null,
          }
        : null,
    };
  });

  return (
    <div>
      <PageHeader
        title="Integrity Checks"
        subtitle="Re-hash on handoff, flag mismatches, and require supervisor resolution."
        actions={<ModuleBadge module="integrity" />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Items flagged"
          value={flaggedItems.length}
          icon={ShieldAlert}
          accentColor="#D13438"
        />
        <StatCard
          label="Checks passed this month"
          value={checksPassedMonth}
          icon={ShieldCheck}
          accentColor="#5C6B7A"
        />
        <StatCard
          label="Checks failed this month"
          value={checksFailedMonth}
          icon={ShieldX}
          accentColor="#D13438"
        />
        <StatCard
          label="Avg. time to resolution"
          value={avgLabel}
          icon={Clock}
          accentColor="#5C6B7A"
        />
      </div>

      <h2 className="mb-3 text-section-title text-canvas-foreground">
        Currently flagged
      </h2>

      {flaggedContexts.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="All clear"
          description="No items are INTEGRITY_FLAGGED right now. Hash mismatches will land here for supervisor review."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-secondary/60">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Evidence ID
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Title
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Last mismatch
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Custodian
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {flaggedContexts.map((row, idx) => {
                const raw = flaggedItems[idx];
                return (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/evidence/${row.id}?tab=integrity`}
                        className="font-mono text-sm font-medium text-accent-integrity hover:underline"
                      >
                        {row.evidenceId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium">{row.title}</td>
                    <td className="px-4 py-3">
                      <StatusPill status="INTEGRITY_FLAGGED" />
                    </td>
                    <td className="px-4 py-3 text-muted-ems">
                      {row.flaggedAt
                        ? format(new Date(row.flaggedAt), "dd MMM yyyy HH:mm")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {raw.currentCustodian?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {canResolve ? (
                        <ResolveIntegrityDialog item={row} />
                      ) : (
                        <span className="text-muted-ems">
                          Supervisor only
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
