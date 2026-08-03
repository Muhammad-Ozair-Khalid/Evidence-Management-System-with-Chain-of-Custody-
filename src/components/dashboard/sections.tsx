import Link from "next/link";
import {
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
  differenceInHours,
} from "date-fns";
import {
  ClipboardList,
  FileWarning,
  Fingerprint,
  Microscope,
  Plus,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { EvidenceStatus, EvidenceType, type Role } from "@prisma/client";
import { AttentionPanel } from "@/components/dashboard/attention-panel";
import { CustodyVelocityChart } from "@/components/dashboard/custody-velocity-chart";
import { EvidenceIntakeChart } from "@/components/dashboard/intake-chart";
import { IntegrityRing } from "@/components/dashboard/integrity-ring";
import { RecentCustodyFeed } from "@/components/dashboard/recent-custody-feed";
import { StatusDonut } from "@/components/dashboard/status-donut";
import { SystemActivityWidget } from "@/components/audit/system-activity-widget";
import { RoleBadge } from "@/components/admin/role-badge";
import { StatusPill } from "@/components/evidence/status-pill";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { StatCard } from "@/components/ui-ems/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EVIDENCE_TYPE_LABELS } from "@/lib/evidence-labels";
import { ROLE_COLORS, type RoleKey } from "@/lib/modules";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const NEUTRAL = "#3F4A5A";

export async function WelcomeBand({
  name,
  role,
}: {
  name: string;
  role: Role;
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const roleColor = ROLE_COLORS[role as RoleKey] ?? ROLE_COLORS.CUSTODIAN;
  const today = format(new Date(), "EEEE, d MMMM yyyy");

  const actions: { href: string; label: string; color: string }[] = [];
  if (can(role, "evidence:register")) {
    actions.push({
      href: "/evidence/new",
      label: "Register evidence",
      color: "#107C10",
    });
  }
  if (can(role, "custody:create")) {
    actions.push({
      href: "/custody",
      label: "Custody ledger",
      color: "#C48A00",
    });
  }
  if (can(role, "integrity:resolve")) {
    actions.push({
      href: "/integrity",
      label: "Resolve flags",
      color: "#D13438",
    });
  }
  if (can(role, "users:manage")) {
    actions.push({
      href: "/admin/users",
      label: "Manage users",
      color: "#5C6B7A",
    });
  }
  if (can(role, "reports:generate") && actions.length < 3) {
    actions.push({
      href: "/reports",
      label: "Generate report",
      color: "#8764B8",
    });
  }

  return (
    <div
      className="mb-6 overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card"
      style={{
        backgroundImage: `linear-gradient(135deg, ${roleColor}12 0%, transparent 55%)`,
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-ems">{today}</p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-canvas-foreground">
            {greeting}, {name.split(" ")[0]}
          </h2>
          <div className="mt-2">
            <RoleBadge role={role} />
          </div>
        </div>
        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {actions.slice(0, 3).map((a) => (
              <Button
                key={a.href}
                asChild
                size="sm"
                className="text-white hover:opacity-90"
                style={{ backgroundColor: a.color }}
              >
                <Link href={a.href}>
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  {a.label}
                </Link>
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export async function StatsSection() {
  const monthStart = startOfMonth(new Date());

  const [
    totalItems,
    inCustody,
    underExamination,
    flagged,
    reportsThisMonth,
    activeUsers,
    prevTotal,
    intakeRows,
  ] = await Promise.all([
    prisma.evidenceItem.count(),
    prisma.evidenceItem.count({ where: { status: "IN_CUSTODY" } }),
    prisma.evidenceItem.count({ where: { status: "UNDER_EXAMINATION" } }),
    prisma.evidenceItem.count({ where: { status: "INTEGRITY_FLAGGED" } }),
    prisma.auditLogEntry.count({
      where: { action: "REPORT_GENERATED", timestamp: { gte: monthStart } },
    }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.evidenceItem.count({
      where: { createdAt: { lt: monthStart } },
    }),
    prisma.evidenceItem.findMany({
      where: { intakeDate: { gte: startOfMonth(subMonths(new Date(), 5)) } },
      select: { intakeDate: true },
    }),
  ]);

  const sparkBuckets = Array.from({ length: 6 }).map((_, i) => {
    const date = startOfMonth(subMonths(new Date(), 5 - i));
    return { key: format(date, "yyyy-MM"), count: 0 };
  });
  const byKey = new Map(sparkBuckets.map((b) => [b.key, b]));
  for (const row of intakeRows) {
    const b = byKey.get(format(row.intakeDate, "yyyy-MM"));
    if (b) b.count += 1;
  }
  const spark = sparkBuckets.map((b) => b.count);
  const deltaItems = totalItems - prevTotal;

  return (
    <div className="mb-6 grid gap-4 stagger-children sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        label="Total evidence items"
        value={totalItems}
        icon={Fingerprint}
        accentColor="#107C10"
        sparkline={spark}
        delta={
          deltaItems !== 0
            ? {
                value: `${deltaItems > 0 ? "+" : ""}${deltaItems} this month`,
                positive: deltaItems >= 0,
              }
            : undefined
        }
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
      <Card className="card-interactive">
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

      <Card className="card-interactive">
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
      <div className="grid gap-4 stagger-children sm:grid-cols-3">
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

      <Card className="border-accent-custody/20 card-interactive">
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
            <EmptyState
              compact
              icon={Fingerprint}
              title="No exhibits in your custody"
              description="You are not holding any exhibits right now. Items transferred to you will appear here."
              className="border-0 shadow-none"
              accentColor="#C48A00"
            />
          ) : (
            <ul className="stagger-children divide-y divide-border">
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

export async function ExaminerSection({ userId }: { userId: string }) {
  const monthStart = startOfMonth(new Date());
  const [examining, registered] = await Promise.all([
    prisma.evidenceItem.findMany({
      where: {
        currentCustodianId: userId,
        status: "UNDER_EXAMINATION",
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        evidenceId: true,
        title: true,
        caseNumber: true,
        updatedAt: true,
      },
    }),
    prisma.evidenceItem.findMany({
      where: {
        submittedById: userId,
        createdAt: { gte: monthStart },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        evidenceId: true,
        title: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-accent-reports/20 card-interactive">
        <CardHeader className="pb-2">
          <CardTitle className="text-accent-reports">
            Under your examination
          </CardTitle>
          <p className="text-muted-ems">Exhibits currently marked UNDER_EXAMINATION</p>
        </CardHeader>
        <CardContent>
          {examining.length === 0 ? (
            <EmptyState
              compact
              icon={Microscope}
              title="No active examinations"
              description="Items you take into examination will appear here."
              className="border-0 shadow-none"
              accentColor="#8764B8"
            />
          ) : (
            <ul className="divide-y divide-border">
              {examining.map((item) => (
                <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link
                    href={`/evidence/${item.id}`}
                    className="font-mono text-sm font-semibold text-accent-reports hover:underline"
                  >
                    {item.evidenceId}
                  </Link>
                  <p className="truncate text-sm">{item.title}</p>
                  <p className="text-muted-ems">
                    Case {item.caseNumber} · {format(item.updatedAt, "dd MMM HH:mm")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-accent-evidence/20 card-interactive">
        <CardHeader className="pb-2">
          <CardTitle className="text-accent-evidence">
            Registered this month
          </CardTitle>
          <p className="text-muted-ems">Exhibits you registered since {format(monthStart, "d MMM")}</p>
        </CardHeader>
        <CardContent>
          {registered.length === 0 ? (
            <EmptyState
              compact
              icon={Fingerprint}
              title="None yet this month"
              description="Register a new exhibit to start the chain."
              className="border-0 shadow-none"
              accentColor="#107C10"
              action={
                <Button asChild size="sm" style={{ backgroundColor: "#107C10" }} className="text-white">
                  <Link href="/evidence/new">Register evidence</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {registered.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/evidence/${item.id}`}
                      className="font-mono text-sm font-semibold text-accent-evidence hover:underline"
                    >
                      {item.evidenceId}
                    </Link>
                    <p className="truncate text-sm">{item.title}</p>
                  </div>
                  <StatusPill status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export async function SupervisorSection() {
  const [flagged, recentAudit] = await Promise.all([
    prisma.evidenceItem.findMany({
      where: { status: "INTEGRITY_FLAGGED" },
      orderBy: { updatedAt: "asc" },
      take: 8,
      select: {
        id: true,
        evidenceId: true,
        title: true,
        caseNumber: true,
        updatedAt: true,
      },
    }),
    prisma.auditLogEntry.findMany({
      where: {
        action: {
          in: ["HASH_MISMATCH_FLAGGED", "INTEGRITY_RESOLVED", "REPORT_GENERATED"],
        },
      },
      orderBy: { timestamp: "desc" },
      take: 6,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-accent-integrity/25 card-interactive">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-accent-integrity">
              Awaiting your resolution
            </CardTitle>
            <p className="text-muted-ems">Flagged exhibits sorted oldest first</p>
          </div>
          <Link
            href="/integrity"
            className="text-xs font-medium text-accent-integrity hover:underline"
          >
            Open Integrity
          </Link>
        </CardHeader>
        <CardContent>
          {flagged.length === 0 ? (
            <EmptyState
              compact
              icon={ShieldCheck}
              title="All clear"
              description="No INTEGRITY_FLAGGED items need review."
              className="border-0 shadow-none"
              accentColor="#D13438"
            />
          ) : (
            <ul className="divide-y divide-border">
              {flagged.map((item) => {
                const ageH = differenceInHours(new Date(), item.updatedAt);
                const ageLabel =
                  ageH < 24 ? `${ageH}h` : `${Math.floor(ageH / 24)}d`;
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/evidence/${item.id}?tab=integrity`}
                        className="font-mono text-sm font-semibold text-accent-integrity hover:underline"
                      >
                        {item.evidenceId}
                      </Link>
                      <p className="truncate text-sm">{item.title}</p>
                      <p className="text-muted-ems">Case {item.caseNumber}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-accent-integrity/10 px-2 py-0.5 text-xs font-semibold text-accent-integrity">
                      {ageLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-accent-audit/20 card-interactive">
        <CardHeader className="pb-2">
          <CardTitle className="text-accent-audit">Audit spotlight</CardTitle>
          <p className="text-muted-ems">Recent integrity and report actions</p>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {recentAudit.map((e) => (
              <li key={e.id} className="py-2.5 first:pt-0 last:pb-0">
                <p className="text-sm font-medium">{e.action.replace(/_/g, " ")}</p>
                <p className="text-muted-ems">
                  {e.actor.name} · {format(e.timestamp, "dd MMM HH:mm")}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export async function AdminHealthSection() {
  const [byRole, active, inactive, recentLogins] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      where: { email: { not: "system@ems.local" } },
      _count: { _all: true },
    }),
    prisma.user.count({
      where: { isActive: true, email: { not: "system@ems.local" } },
    }),
    prisma.user.count({
      where: { isActive: false, email: { not: "system@ems.local" } },
    }),
    prisma.user.findMany({
      where: {
        email: { not: "system@ems.local" },
        lastLoginAt: { not: null },
      },
      orderBy: { lastLoginAt: "desc" },
      take: 5,
      select: { id: true, name: true, role: true, lastLoginAt: true },
    }),
  ]);

  const roles: Role[] = ["ADMIN", "SUPERVISOR", "EXAMINER", "CUSTODIAN"];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="card-interactive lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle>Directory health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Active"
              value={active}
              icon={Users}
              accentColor="#107C10"
              className="p-4"
            />
            <StatCard
              label="Deactivated"
              value={inactive}
              icon={Users}
              accentColor="#5C6B7A"
              className="p-4"
            />
          </div>
          <ul className="space-y-2">
            {roles.map((r) => {
              const count =
                byRole.find((g) => g.role === r)?._count._all ?? 0;
              const color = ROLE_COLORS[r as RoleKey];
              return (
                <li key={r} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  <span className="font-medium">{r}</span>
                  <span className="ml-auto tabular text-muted-foreground">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card className="card-interactive lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Recent logins</CardTitle>
          <Link
            href="/admin/users"
            className="text-xs font-medium text-accent-admin hover:underline"
          >
            Users & Roles
          </Link>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {recentLogins.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <RoleBadge role={u.role} />
                </div>
                <time className="text-muted-ems">
                  {u.lastLoginAt
                    ? format(u.lastLoginAt, "dd MMM yyyy HH:mm")
                    : "—"}
                </time>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export async function CustodyVelocitySection() {
  const since = startOfDay(subDays(new Date(), 29));
  const events = await prisma.custodyEvent.findMany({
    where: { timestamp: { gte: since } },
    select: { timestamp: true },
  });

  const buckets = Array.from({ length: 30 }).map((_, i) => {
    const d = startOfDay(subDays(new Date(), 29 - i));
    return { key: format(d, "yyyy-MM-dd"), day: format(d, "d"), count: 0 };
  });
  const map = new Map(buckets.map((b) => [b.key, b]));
  for (const e of events) {
    const b = map.get(format(e.timestamp, "yyyy-MM-dd"));
    if (b) b.count += 1;
  }

  return (
    <Card className="card-interactive">
      <CardHeader className="pb-2">
        <CardTitle className="text-accent-custody">Custody velocity</CardTitle>
        <p className="text-muted-ems">Events logged per day · last 30 days</p>
      </CardHeader>
      <CardContent>
        <CustodyVelocityChart
          data={buckets.map((b) => ({ day: b.day, count: b.count }))}
        />
      </CardContent>
    </Card>
  );
}

export async function CaseLoadSection() {
  const groups = await prisma.evidenceItem.groupBy({
    by: ["caseNumber"],
    _count: { _all: true },
    orderBy: { _count: { caseNumber: "desc" } },
    take: 8,
  });

  const max = Math.max(...groups.map((g) => g._count._all), 1);

  return (
    <Card className="card-interactive">
      <CardHeader className="pb-2">
        <CardTitle>Case load</CardTitle>
        <p className="text-muted-ems">Top cases by exhibit count</p>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="text-muted-ems">No cases registered yet.</p>
        ) : (
          <ul className="space-y-3">
            {groups.map((g) => (
              <li key={g.caseNumber}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-mono font-medium">{g.caseNumber}</span>
                  <span className="tabular text-muted-foreground">
                    {g._count._all}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent-evidence transition-all duration-500"
                    style={{
                      width: `${(g._count._all / max) * 100}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export async function IntegrityHealthSection() {
  const monthStart = startOfMonth(new Date());
  const [passed, failed] = await Promise.all([
    prisma.custodyEvent.count({
      where: { hashMatch: true, timestamp: { gte: monthStart } },
    }),
    prisma.custodyEvent.count({
      where: { hashMatch: false, timestamp: { gte: monthStart } },
    }),
  ]);

  return (
    <Card className="card-interactive">
      <CardHeader className="pb-2">
        <CardTitle className="text-accent-integrity">Integrity health</CardTitle>
        <p className="text-muted-ems">Hash check pass rate this month</p>
      </CardHeader>
      <CardContent className="flex justify-center py-2">
        <IntegrityRing passed={passed} failed={failed} />
      </CardContent>
    </Card>
  );
}

export async function EvidenceTypeMixSection() {
  const groups = await prisma.evidenceItem.groupBy({
    by: ["evidenceType"],
    _count: { _all: true },
  });
  const total = groups.reduce((s, g) => s + g._count._all, 0) || 1;
  const colors: Record<EvidenceType, string> = {
    DIGITAL_MEDIA: "#107C10",
    DOCUMENT: "#5C6B7A",
    DEVICE: "#C48A00",
    IMAGE_FORENSIC: "#8764B8",
    OTHER: "#00B7C3",
  };

  return (
    <Card className="card-interactive">
      <CardHeader className="pb-2">
        <CardTitle>Evidence type mix</CardTitle>
        <p className="text-muted-ems">Distribution across the registry</p>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="text-muted-ems">No exhibits yet.</p>
        ) : (
          <ul className="space-y-3">
            {(Object.keys(EVIDENCE_TYPE_LABELS) as EvidenceType[]).map((t) => {
              const count =
                groups.find((g) => g.evidenceType === t)?._count._all ?? 0;
              if (count === 0) return null;
              return (
                <li key={t}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {EVIDENCE_TYPE_LABELS[t]}
                    </span>
                    <span className="tabular text-muted-foreground">
                      {count} · {Math.round((count / total) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(count / total) * 100}%`,
                        backgroundColor: colors[t],
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
