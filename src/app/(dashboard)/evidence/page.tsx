import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Fingerprint,
  Microscope,
  Plus,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { EvidenceStatus, EvidenceType, Prisma } from "@prisma/client";
import { EvidenceFilterBar } from "@/components/evidence/evidence-filter-bar";
import { EvidenceListTable } from "@/components/evidence/evidence-list-table";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { SectionPanel } from "@/components/ui-ems/section-panel";
import { StatCard } from "@/components/ui-ems/stat-card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export default async function EvidenceListPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    status?: string;
    type?: string;
    custodian?: string;
    from?: string;
    to?: string;
  };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "evidence:view")) {
    redirect("/dashboard?error=forbidden");
  }

  const canRegister = can(session.user.role, "evidence:register");

  const where: Prisma.EvidenceItemWhereInput = {};

  if (searchParams.status && Object.values(EvidenceStatus).includes(searchParams.status as EvidenceStatus)) {
    where.status = searchParams.status as EvidenceStatus;
  }
  if (searchParams.type && Object.values(EvidenceType).includes(searchParams.type as EvidenceType)) {
    where.evidenceType = searchParams.type as EvidenceType;
  }
  if (searchParams.custodian) {
    where.currentCustodianId = searchParams.custodian;
  }
  if (searchParams.from || searchParams.to) {
    where.intakeDate = {};
    if (searchParams.from) {
      where.intakeDate.gte = new Date(searchParams.from);
    }
    if (searchParams.to) {
      const end = new Date(searchParams.to);
      end.setHours(23, 59, 59, 999);
      where.intakeDate.lte = end;
    }
  }
  if (searchParams.q?.trim()) {
    const q = searchParams.q.trim();
    where.OR = [
      { evidenceId: { contains: q, mode: "insensitive" } },
      { caseNumber: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, custodians, totalAll, inCustody, underExam, flagged] =
    await Promise.all([
      prisma.evidenceItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          currentCustodian: { select: { id: true, name: true } },
        },
      }),
      prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.evidenceItem.count(),
      prisma.evidenceItem.count({ where: { status: "IN_CUSTODY" } }),
      prisma.evidenceItem.count({ where: { status: "UNDER_EXAMINATION" } }),
      prisma.evidenceItem.count({ where: { status: "INTEGRITY_FLAGGED" } }),
    ]);

  const rows = items.map((item) => ({
    id: item.id,
    evidenceId: item.evidenceId,
    title: item.title,
    caseNumber: item.caseNumber,
    evidenceType: item.evidenceType,
    status: item.status,
    intakeDate: item.intakeDate.toISOString(),
    custodianName: item.currentCustodian?.name ?? "—",
    custodianId: item.currentCustodian?.id ?? "",
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Evidence Registry"
        eyebrowColor="#107C10"
        title="Exhibit inventory"
        subtitle="Register digital exhibits with unique IDs and ingest-time SHA-256 hashes."
        actions={
          <div className="flex items-center gap-2">
            <ModuleBadge module="evidence" />
            {canRegister ? (
              <Button
                asChild
                style={{ backgroundColor: "#107C10" }}
                className="text-white hover:opacity-90 shadow-glow-brand"
              >
                <Link href="/evidence/new">
                  <Plus className="h-4 w-4" />
                  Register New Evidence
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-6 grid gap-4 stagger-children sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total exhibits"
          value={totalAll}
          icon={Fingerprint}
          accentColor="#107C10"
        />
        <StatCard
          label="In custody"
          value={inCustody}
          icon={Scale}
          accentColor="#C48A00"
        />
        <StatCard
          label="Under examination"
          value={underExam}
          icon={Microscope}
          accentColor="#8764B8"
        />
        <StatCard
          label="Integrity flagged"
          value={flagged}
          icon={ShieldAlert}
          accentColor={flagged > 0 ? "#D13438" : "#5C6B7A"}
        />
      </div>

      <SectionPanel
        accent="#107C10"
        title="Registry"
        description="Filter and open exhibits — each row carries intake hash and current custodian."
      >
        <Suspense
          fallback={
            <div className="mb-4 h-32 animate-shimmer rounded-lg border border-border" />
          }
        >
          <EvidenceFilterBar custodians={custodians} resultCount={rows.length} />
        </Suspense>

        {rows.length === 0 &&
        !searchParams.q &&
        !searchParams.status &&
        !searchParams.type ? (
          <EmptyState
            icon={Fingerprint}
            title="No evidence registered yet"
            description={
              canRegister
                ? "Register the first exhibit to start the custody ledger."
                : "Evidence items will appear here once an examiner or supervisor registers them."
            }
            accentColor="#107C10"
            action={
              canRegister ? (
                <Button
                  asChild
                  style={{ backgroundColor: "#107C10" }}
                  className="text-white hover:opacity-90"
                >
                  <Link href="/evidence/new">Register New Evidence</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <EvidenceListTable rows={rows} />
        )}
      </SectionPanel>
    </div>
  );
}
