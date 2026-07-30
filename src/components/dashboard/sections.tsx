import Link from "next/link";
import { format, startOfMonth, subMonths } from "date-fns";
import {
  ClipboardList,
  FileWarning,
  Fingerprint,
  Microscope,
  Scale,
  ShieldAlert,
  Users,
} from "lucide-react";
import { EvidenceStatus, type Role } from "@prisma/client";
import { AttentionPanel } from "@/components/dashboard/attention-panel";
import { EvidenceIntakeChart } from "@/components/dashboard/intake-chart";
import { RecentCustodyFeed } from "@/components/dashboard/recent-custody-feed";
import { StatusDonut } from "@/components/dashboard/status-donut";
import { SystemActivityWidget } from "@/components/audit/system-activity-widget";
import { StatusPill } from "@/components/evidence/status-pill";
import { StatCard } from "@/components/ui-ems/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const NEUTRAL = "#3F4A5A";

export async function StatsSection() {
  const monthStart = startOfMonth(new Date());

  const [
    totalItems,
    inCustody,
    underExamination,
    flagged,
    reportsThisMonth,
    activeUsers,
  ] = await Promise.all([
    prisma.evidenceItem.count(),
    prisma.evidenceItem.count({ where: { status: "IN_CUSTODY" } }),
    prisma.evidenceItem.count({ where: { status: "UNDER_EXAMINATION" } }),
    prisma.evidenceItem.count({ where: { status: "INTEGRITY_FLAGGED" } }),
    prisma.auditLogEntry.count({
      where: { action: "REPORT_GENERATED", timestamp: { gte: monthStart } },
    }),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        label="Total evidence items"
        value={totalItems}
        icon={Fingerprint}
        accentColor="#107C10"
      />
      <StatCard
        label="Items in custody"
        value={inCustody}
        icon={Scale}
        accentColor="#D29200"
      />
      <StatCard
        label="Under examination"
        value={underExamination}
        icon={Microscope}
        accentColor="#8764B8"
      />
      <StatCard
        label="Integrity flags open"
        value={flagged}
        icon={flagged > 0 ? ShieldAlert : FileWarning}
        accentColor={flagged > 0 ? "#D13438" : NEUTRAL}
      />
      <StatCard
        label="Reports this month"
        value={reportsThisMonth}
        icon={ClipboardList}
        accentColor="#8764B8"
      />
      <StatCard
        label="Active users"
        value={activeUsers}
        icon={Users}
        accentColor="#00B7C3"
      />
    </div>
  );
}

export async function ChartsSection() {
  const windowStart = startOfMonth(subMonths(new Date(), 11));

  const [intakeRows, statusGroups] = await Promise.all([
    prisma.evidenceItem.findMany({
      where: { intakeDate: { gte: windowStart } },
      select: { intakeDate: true },
    }),
    prisma.evidenceItem.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const buckets = Array.from({ length: 12 }).map((_, i) => {
    const date = startOfMonth(subMonths(new Date(), 11 - i));
    return { key: format(date, "yyyy-MM"), month: format(date, "MMM"), count: 0 };
  });
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const row of intakeRows) {
    const bucket = byKey.get(format(row.intakeDate, "yyyy-MM"));
    if (bucket) bucket.count += 1;
  }

  const statusData = (Object.keys(EvidenceStatus) as EvidenceStatus[])
    .map((status) => ({
      status,
      count:
        statusGroups.find((g) => g.status === status)?._count._all ?? 0,
    }))
    .filter((s) => s.count > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Evidence intake over time</CardTitle>
          <p className="text-muted-ems">Registered exhibits per month (last 12 months)</p>
        </CardHeader>
        <CardContent>
          <EvidenceIntakeChart
            data={buckets.map((b) => ({ month: b.month, count: b.count }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Items by status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusDonut data={statusData} />
        </CardContent>
      </Card>
    </div>
  );
}

export async function ActivitySection({
  role,
  userId,
}: {
  role: Role;
  userId: string;
}) {
  const canViewAll = can(role, "audit:view");

  const [custodyEvents, auditEntries] = await Promise.all([
    prisma.custodyEvent.findMany({
      orderBy: { timestamp: "desc" },
      take: 6,
      include: {
        evidenceItem: { select: { id: true, evidenceId: true } },
        handlerFrom: { select: { name: true } },
        handlerTo: { select: { name: true } },
      },
    }),
    prisma.auditLogEntry.findMany({
      where: canViewAll ? undefined : { actorId: userId },
      orderBy: { timestamp: "desc" },
      take: 8,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  const custodyRows = custodyEvents.map((e) => ({
    id: e.id,
    timestamp: e.timestamp.toISOString(),
    eventType: e.eventType,
    fromName: e.handlerFrom?.name ?? "—",
    toName:
      e.eventType === "RETURN"
        ? e.returnDestination ?? "Destination"
        : e.handlerTo?.name ?? "—",
    evidenceDbId: e.evidenceItem.id,
    evidenceId: e.evidenceItem.evidenceId,
  }));

  const activity = auditEntries.map((e) => {
    const meta = e.metadata as Record<string, unknown> | null;
    const summary =
      typeof meta?.evidenceId === "string"
        ? meta.evidenceId
        : e.entityType === "Auth"
          ? String(e.entityId)
          : e.entityType;
    return {
      id: e.id,
      timestamp: e.timestamp.toISOString(),
      action: e.action,
      actorName: e.actor.name,
      summary,
    };
  });

  return (
    <div className="space-y-6">
      <RecentCustodyFeed rows={custodyRows} />
      <SystemActivityWidget entries={activity} role={role} />
    </div>
  );
}

export async function AttentionSection() {
  const flagged = await prisma.evidenceItem.findMany({
    where: { status: "INTEGRITY_FLAGGED" },
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: {
      id: true,
      evidenceId: true,
      title: true,
      caseNumber: true,
      updatedAt: true,
    },
  });

  return (
    <AttentionPanel
      items={flagged.map((f) => ({
        id: f.id,
        evidenceId: f.evidenceId,
        title: f.title,
        caseNumber: f.caseNumber,
        flaggedAt: f.updatedAt.toISOString(),
      }))}
    />
  );
}

export async function CustodianSection({ userId }: { userId: string }) {
  const [held, heldCount, examCount, flaggedCount] = await Promise.all([
    prisma.evidenceItem.findMany({
      where: { currentCustodianId: userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        evidenceId: true,
        title: true,
        caseNumber: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.evidenceItem.count({ where: { currentCustodianId: userId } }),
    prisma.evidenceItem.count({
      where: { currentCustodianId: userId, status: "UNDER_EXAMINATION" },
    }),
    prisma.evidenceItem.count({
      where: { currentCustodianId: userId, status: "INTEGRITY_FLAGGED" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Items you hold"
          value={heldCount}
          icon={Fingerprint}
          accentColor="#107C10"
        />
        <StatCard
          label="Under examination"
          value={examCount}
          icon={Microscope}
          accentColor="#8764B8"
        />
        <StatCard
          label="Integrity flagged"
          value={flaggedCount}
          icon={flaggedCount > 0 ? ShieldAlert : FileWarning}
          accentColor={flaggedCount > 0 ? "#D13438" : NEUTRAL}
        />
      </div>

      <Card className="border-accent-custody/20">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-accent-custody">
            Evidence currently in your custody
          </CardTitle>
          <Link
            href="/evidence"
            className="text-xs font-medium text-accent-custody hover:underline"
          >
            All evidence
          </Link>
        </CardHeader>
        <CardContent>
          {held.length === 0 ? (
            <p className="text-muted-ems">
              You are not holding any exhibits right now.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {held.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/evidence/${item.id}`}
                        className="font-mono text-sm font-semibold text-accent-evidence hover:underline"
                      >
                        {item.evidenceId}
                      </Link>
                      <StatusPill status={item.status} />
                    </div>
                    <p className="truncate text-sm text-canvas-foreground">
                      {item.title}
                    </p>
                    <p className="text-muted-ems">
                      Case {item.caseNumber} · updated{" "}
                      {format(item.updatedAt, "dd MMM HH:mm")}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    style={{ backgroundColor: "#D29200" }}
                    className="shrink-0 text-white hover:opacity-90"
                  >
                    <Link href={`/evidence/${item.id}?tab=custody`}>
                      <Scale className="h-3.5 w-3.5" />
                      Log custody event
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
