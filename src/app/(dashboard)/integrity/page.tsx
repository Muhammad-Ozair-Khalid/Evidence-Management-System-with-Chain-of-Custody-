import { redirect } from "next/navigation";
import { differenceInMinutes, format, startOfMonth } from "date-fns";
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import Link from "next/link";
import {
  FlaggedIntegrityTable,
  type FlaggedTableRow,
} from "@/components/integrity/flagged-table";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { PageHeader } from "@/components/ui-ems/page-header";
import { SectionPanel } from "@/components/ui-ems/section-panel";
import { StatCard } from "@/components/ui-ems/stat-card";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    recentResolutions,
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
    prisma.auditLogEntry.findMany({
      where: { action: "INTEGRITY_RESOLVED" },
      orderBy: { timestamp: "desc" },
      take: 8,
      include: {
        actor: { select: { name: true } },
      },
    }),
  ]);

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

  const flaggedRows: FlaggedTableRow[] = flaggedItems.map((item) => {
    const mismatch = item.custodyEvents[0] ?? null;
    return {
      id: item.id,
      evidenceId: item.evidenceId,
      title: item.title,
      expectedHash: item.currentHash,
      flaggedAt:
        mismatch?.timestamp.toISOString() ?? item.updatedAt.toISOString(),
      custodianName: item.currentCustodian?.name ?? "—",
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

  const recentResolvedRows = recentResolutions.map((r) => {
    const meta = (r.metadata ?? {}) as Record<string, unknown>;
    return {
      id: r.id,
      evidenceId:
        typeof meta.evidenceId === "string" ? meta.evidenceId : r.entityId,
      entityId: r.entityId,
      when: r.timestamp,
      actorName: r.actor.name,
      note:
        typeof meta.resolutionNote === "string"
          ? meta.resolutionNote
          : null,
    };
  });

  return (
    <div>
      <PageHeader
        eyebrow="Integrity"
        eyebrowColor="#D13438"
        title="Hash verification"
        subtitle="Re-hash on handoff, flag mismatches, and require supervisor resolution. Only Mark resolved removes an item from the queue."
        actions={<ModuleBadge module="integrity" />}
      />

      <div className="mb-6 grid gap-4 stagger-children sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Items flagged"
          value={flaggedItems.length}
          icon={ShieldAlert}
          accentColor="#D13438"
          riseDelayMs={0}
        />
        <StatCard
          label="Checks passed this month"
          value={checksPassedMonth}
          icon={ShieldCheck}
          accentColor="#5C6B7A"
          riseDelayMs={40}
        />
        <StatCard
          label="Checks failed this month"
          value={checksFailedMonth}
          icon={ShieldX}
          accentColor="#D13438"
          riseDelayMs={80}
        />
        <StatCard
          label="Avg. time to resolution"
          value={avgLabel}
          icon={Clock}
          accentColor="#5C6B7A"
          riseDelayMs={120}
        />
      </div>

      <SectionPanel
        accent="#D13438"
        intensity="strong"
        title="Currently flagged"
        description={
          canResolve
            ? "Supervisor queue — choose Mark resolved to restore IN_CUSTODY, or Confirm issue to keep the flag."
            : "Hash mismatches land here. Resolution is supervisor / admin only."
        }
        className="mb-6"
        bodyClassName={flaggedRows.length === 0 ? undefined : "pt-2 sm:pt-3"}
      >
        {flaggedRows.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="All clear"
            description="No items are INTEGRITY_FLAGGED right now. Hash mismatches will land here for supervisor review."
          />
        ) : (
          <FlaggedIntegrityTable rows={flaggedRows} canResolve={canResolve} />
        )}
      </SectionPanel>

      {recentResolvedRows.length > 0 ? (
        <SectionPanel
          accent="#107C10"
          title="Recently resolved"
          description="Cleared flags with status restored to IN_CUSTODY — proof your resolution landed in the audit trail."
        >
          <ul className="divide-y divide-border/60">
            {recentResolvedRows.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/evidence/${row.entityId}?tab=integrity`}
                    className="font-mono text-sm font-medium text-accent-evidence hover:underline"
                  >
                    {row.evidenceId}
                  </Link>
                  {row.note ? (
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-ems">
                      {row.note}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-xs text-muted-ems">
                  {format(row.when, "dd MMM yyyy HH:mm")} · {row.actorName}
                </p>
              </li>
            ))}
          </ul>
        </SectionPanel>
      ) : null}
    </div>
  );
}
