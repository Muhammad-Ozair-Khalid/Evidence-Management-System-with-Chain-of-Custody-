import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  ActivitySection,
  AttentionSection,
  ChartsSection,
  CustodianSection,
  StatsSection,
} from "@/components/dashboard/sections";
import {
  ChartsSkeleton,
  PanelSkeleton,
  StatGridSkeleton,
} from "@/components/dashboard/skeletons";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const forbidden = searchParams?.error === "forbidden";
  const isCustodian = session.user.role === "CUSTODIAN";

  return (
    <div>
      <PageHeader
        eyebrow={isCustodian ? "Custody workspace" : "Command centre"}
        title="Overview"
        subtitle={
          isCustodian
            ? `Your custody workspace, ${session.user.name}.`
            : `Command centre — signed in as ${session.user.name} (${session.user.role}).`
        }
        actions={<ModuleBadge module="dashboard" />}
      />

      {forbidden ? (
        <div
          role="alert"
          className="mb-6 rounded-md border border-accent-integrity/30 bg-accent-integrity/10 px-4 py-3 text-sm text-accent-integrity"
        >
          You do not have permission to access that page. Contact a supervisor
          if you need elevated access.
        </div>
      ) : null}

      {isCustodian ? (
        <div className="space-y-6">
          <Suspense fallback={<PanelSkeleton className="h-[420px]" />}>
            <CustodianSection userId={session.user.id} />
          </Suspense>

          <Suspense fallback={<PanelSkeleton />}>
            <ActivitySection
              role={session.user.role}
              userId={session.user.id}
            />
          </Suspense>
        </div>
      ) : (
        <div className="space-y-6">
          <Suspense fallback={<StatGridSkeleton />}>
            <StatsSection />
          </Suspense>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Suspense fallback={<ChartsSkeleton />}>
                <ChartsSection />
              </Suspense>
            </div>
            <div>
              <Suspense fallback={<PanelSkeleton className="h-[560px]" />}>
                <ActivitySection
                  role={session.user.role}
                  userId={session.user.id}
                />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={<PanelSkeleton className="h-[120px]" />}>
            <AttentionSection />
          </Suspense>
        </div>
      )}
    </div>
  );
}
