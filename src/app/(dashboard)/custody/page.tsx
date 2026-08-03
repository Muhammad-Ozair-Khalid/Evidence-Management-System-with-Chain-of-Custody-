import { Suspense } from "react";
import { redirect } from "next/navigation";
import { startOfDay } from "date-fns";
import {
  ArrowLeftRight,
  Microscope,
  Package,
  RotateCcw,
} from "lucide-react";
import { CustodyEventType, Prisma } from "@prisma/client";
import { CustodyFeedFilters } from "@/components/custody/custody-feed-filters";
import { CustodyFeedList } from "@/components/custody/custody-feed-list";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { SectionPanel } from "@/components/ui-ems/section-panel";
import { StatCard } from "@/components/ui-ems/stat-card";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export default async function CustodyPage({
  searchParams,
}: {
  searchParams: {
    eventType?: string;
    handler?: string;
    evidence?: string;
    from?: string;
    to?: string;
  };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "custody:view")) {
    redirect("/dashboard?error=forbidden");
  }

  const where: Prisma.CustodyEventWhereInput = {};

  if (
    searchParams.eventType &&
    Object.values(CustodyEventType).includes(
      searchParams.eventType as CustodyEventType
    )
  ) {
    where.eventType = searchParams.eventType as CustodyEventType;
  }

  if (searchParams.handler) {
    where.OR = [
      { handlerFromId: searchParams.handler },
      { handlerToId: searchParams.handler },
    ];
  }

  if (searchParams.evidence) {
    where.evidenceItemId = searchParams.evidence;
  }

  if (searchParams.from || searchParams.to) {
    where.timestamp = {};
    if (searchParams.from) {
      where.timestamp.gte = new Date(searchParams.from);
    }
    if (searchParams.to) {
      const end = new Date(searchParams.to);
      end.setHours(23, 59, 59, 999);
      where.timestamp.lte = end;
    }
  }

  const todayStart = startOfDay(new Date());

  const [events, handlers, evidenceItems, seizures, transfers, exams, returns] =
    await Promise.all([
      prisma.custodyEvent.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: 200,
        include: {
          evidenceItem: {
            select: { id: true, evidenceId: true, title: true },
          },
          handlerFrom: { select: { name: true } },
          handlerTo: { select: { name: true } },
        },
      }),
      prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.evidenceItem.findMany({
        select: { id: true, evidenceId: true, title: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.custodyEvent.count({
        where: { eventType: "SEIZURE", timestamp: { gte: todayStart } },
      }),
      prisma.custodyEvent.count({
        where: { eventType: "TRANSFER", timestamp: { gte: todayStart } },
      }),
      prisma.custodyEvent.count({
        where: { eventType: "EXAMINATION", timestamp: { gte: todayStart } },
      }),
      prisma.custodyEvent.count({
        where: { eventType: "RETURN", timestamp: { gte: todayStart } },
      }),
    ]);

  const rows = events.map((e) => ({
    id: e.id,
    timestamp: e.timestamp.toISOString(),
    eventType: e.eventType,
    location: e.location,
    reason: e.reason,
    returnDestination: e.returnDestination,
    evidence: e.evidenceItem,
    handlerFrom: e.handlerFrom,
    handlerTo: e.handlerTo,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Chain of Custody"
        eyebrowColor="#C48A00"
        title="Custody ledger"
        subtitle="Global ledger of seizure, transfer, examination, and return events."
        actions={<ModuleBadge module="custody" />}
      />

      <div className="mb-6 grid gap-4 stagger-children sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Seizures today" value={seizures} icon={Package} accentColor="#C48A00" />
        <StatCard label="Transfers today" value={transfers} icon={ArrowLeftRight} accentColor="#107C10" />
        <StatCard label="Examinations today" value={exams} icon={Microscope} accentColor="#8764B8" />
        <StatCard label="Returns today" value={returns} icon={RotateCcw} accentColor="#5C6B7A" />
      </div>

      <SectionPanel
        accent="#C48A00"
        title="Event feed"
        description="Seizure → transfer → examination → return — every handoff with hash check."
      >
        <Suspense
          fallback={
            <div className="mb-4 h-28 animate-shimmer rounded-lg border border-border" />
          }
        >
          <CustodyFeedFilters
            handlers={handlers}
            evidenceItems={evidenceItems}
          />
        </Suspense>

        <CustodyFeedList rows={rows} />
      </SectionPanel>
    </div>
  );
}
