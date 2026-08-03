import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  ActivitySection,
  AdminHealthSection,
  AttentionSection,
  CaseLoadSection,
  ChartsSection,
  CustodyVelocitySection,
  CustodianSection,
  EvidenceTypeMixSection,
  ExaminerSection,
  IntegrityHealthSection,
  StatsSection,
  SupervisorSection,
  WelcomeBand,
} from "@/components/dashboard/sections";
import {
  ChartsSkeleton,
  PanelSkeleton,
  StatGridSkeleton,
  WelcomeBandSkeleton,
} from "@/components/dashboard/skeletons";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { getSession } from "@/lib/auth";
import { MODULES } from "@/lib/modules";
import { can } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const forbidden = searchParams?.error === "forbidden";
  const role = session.user.role;
  const isCustodian = role === "CUSTODIAN";
  const isExaminer = role === "EXAMINER";
  const isSupervisor = role === "SUPERVISOR";
  const isAdmin = role === "ADMIN";

  return (
    <div>
      <PageHeader
        eyebrow={
          isCustodian
            ? "Custody workspace"
            : isExaminer
              ? "Examiner console"
              : isSupervisor
                ? "Supervisor desk"
                : isAdmin
                  ? "Admin command"
                  : "Command centre"
        }
        eyebrowColor={MODULES.dashboard.onDark ?? MODULES.dashboard.hex}
        title="Overview"
        subtitle={
          isCustodian
            ? `Your custody workspace, ${session.user.name}.`
            : `Command centre — signed in as ${session.user.name} (${role}).`
        }
        actions={<ModuleBadge module="dashboard" />}
      />

      {forbidden ? (
        <div
          role="alert"
          className="mb-6 animate-shake rounded-md border border-accent-integrity/30 bg-accent-integrity/10 px-4 py-3 text-sm text-accent-integrity"
        >
          You do not have permission to access that page. Contact a supervisor
          if you need elevated access.
        </div>
      ) : null}

      <Suspense fallback={<WelcomeBandSkeleton />}>
        <WelcomeBand name={session.user.name} role={role} />
      </Suspense>

      {isCustodian ? (
        <div className="space-y-6">
          <Suspense fallback={<PanelSkeleton className="h-[420px]" />}>
            <CustodianSection userId={session.user.id} />
          </Suspense>

          <div className="grid gap-6 lg:grid-cols-2">
            <Suspense fallback={<PanelSkeleton />}>
              <CustodyVelocitySection />
            </Suspense>
            <Suspense fallback={<PanelSkeleton />}>
              <ActivitySection role={role} userId={session.user.id} />
            </Suspense>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Suspense fallback={<StatGridSkeleton />}>
            <StatsSection />
          </Suspense>

          {isExaminer ? (
            <Suspense fallback={<PanelSkeleton className="h-[280px]" />}>
              <ExaminerSection userId={session.user.id} />
            </Suspense>
          ) : null}

          {isSupervisor || isAdmin ? (
            <Suspense fallback={<PanelSkeleton className="h-[280px]" />}>
              <SupervisorSection />
            </Suspense>
          ) : null}

          {isAdmin ? (
            <Suspense fallback={<PanelSkeleton className="h-[280px]" />}>
              <AdminHealthSection />
            </Suspense>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Suspense fallback={<ChartsSkeleton />}>
                <ChartsSection />
              </Suspense>
            </div>
            <div className="space-y-6">
              <Suspense fallback={<PanelSkeleton />}>
                <ActivitySection role={role} userId={session.user.id} />
              </Suspense>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Suspense fallback={<PanelSkeleton />}>
              <CustodyVelocitySection />
            </Suspense>
            <Suspense fallback={<PanelSkeleton />}>
              <CaseLoadSection />
            </Suspense>
            {can(role, "integrity:rehash") ? (
              <Suspense fallback={<PanelSkeleton />}>
                <IntegrityHealthSection />
              </Suspense>
            ) : (
              <Suspense fallback={<PanelSkeleton />}>
                <EvidenceTypeMixSection />
              </Suspense>
            )}
          </div>

          {can(role, "integrity:rehash") ? (
            <Suspense fallback={<PanelSkeleton />}>
              <EvidenceTypeMixSection />
            </Suspense>
          ) : null}

          <Suspense fallback={<PanelSkeleton className="h-[120px]" />}>
            <AttentionSection />
          </Suspense>
        </div>
      )}
    </div>
  );
}
