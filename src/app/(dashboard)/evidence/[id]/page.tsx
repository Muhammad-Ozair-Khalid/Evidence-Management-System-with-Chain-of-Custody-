import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { FileSearch } from "lucide-react";
import {
  EvidenceDetailTabs,
  EvidenceTabPlaceholder,
} from "@/components/evidence/evidence-detail-tabs";
import { CopyButton } from "@/components/evidence/copy-button";
import { StatusPill } from "@/components/evidence/status-pill";
import { CustodyChainStepper } from "@/components/custody/chain-stepper";
import { CustodyTimeline } from "@/components/custody/custody-timeline";
import { LogCustodyEventButton } from "@/components/custody/log-custody-dialog";
import { IntegrityHistory } from "@/components/integrity/integrity-history";
import { GenerateCustodyReportButton } from "@/components/reports/generate-report-button";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { CUSTODY_EVENT_LABELS } from "@/lib/custody-labels";
import { EVIDENCE_TYPE_LABELS } from "@/lib/evidence-labels";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export default async function EvidenceDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "evidence:view")) {
    redirect("/dashboard?error=forbidden");
  }

  const item = await prisma.evidenceItem.findUnique({
    where: { id: params.id },
    include: {
      submittedBy: { select: { id: true, name: true, email: true } },
      currentCustodian: { select: { id: true, name: true, email: true } },
      custodyEvents: {
        orderBy: { timestamp: "asc" },
        include: {
          handlerFrom: { select: { id: true, name: true } },
          handlerTo: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!item) notFound();

  const tab = searchParams.tab ?? "overview";

  const [recentAudit, activeUsers] = await Promise.all([
    prisma.auditLogEntry.findMany({
      where: {
        entityType: "EvidenceItem",
        entityId: item.id,
      },
      orderBy: { timestamp: "desc" },
      take: 5,
      include: {
        actor: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        NOT: item.currentCustodianId
          ? { id: item.currentCustodianId }
          : undefined,
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const isCurrentCustodian = item.currentCustodianId === session.user.id;
  const canOverride =
    session.user.role === "SUPERVISOR" || session.user.role === "ADMIN";
  const canLog =
    can(session.user.role, "custody:create") &&
    item.status !== "RETURNED" &&
    item.status !== "ARCHIVED" &&
    item.status !== "INTEGRITY_FLAGGED" &&
    (isCurrentCustodian || canOverride);

  const timelineEvents = item.custodyEvents.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    timestamp: e.timestamp.toISOString(),
    location: e.location,
    reason: e.reason,
    hashAtEvent: e.hashAtEvent,
    hashMatch: e.hashMatch,
    returnDestination: e.returnDestination,
    handlerFrom: e.handlerFrom,
    handlerTo: e.handlerTo,
  }));

  const chainSteps = item.custodyEvents.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    label: CUSTODY_EVENT_LABELS[e.eventType],
    hashMatch: e.hashMatch,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ModuleBadge module="evidence" />
            <StatusPill status={item.status} />
          </div>
          <p className="font-mono text-sm font-semibold text-accent-evidence">
            {item.evidenceId}
          </p>
          <h1 className="text-page-title text-canvas-foreground">{item.title}</h1>
          <p className="mt-1 text-muted-ems">{item.description}</p>
        </div>
        {canLog ? (
          <LogCustodyEventButton
            evidenceItemId={item.id}
            evidenceLabel={item.evidenceId}
            currentHash={item.currentHash}
            hasStoredFile={Boolean(item.filePath)}
            users={activeUsers}
            isOverride={!isCurrentCustodian && canOverride}
          />
        ) : item.status === "INTEGRITY_FLAGGED" ? (
          <p className="max-w-xs text-right text-sm text-accent-integrity">
            INTEGRITY_FLAGGED — custody handoffs blocked until a supervisor
            resolves the flag on the Integrity module.
          </p>
        ) : null}
      </div>

      <CustodyChainStepper steps={chainSteps} />

      <EvidenceDetailTabs evidenceId={item.id} active={tab} />

      {tab === "custody" ? (
        <CustodyTimeline events={timelineEvents} />
      ) : null}

      {tab === "integrity" ? (
        <IntegrityHistory
          rows={[...item.custodyEvents].reverse().map((e) => ({
            id: e.id,
            timestamp: e.timestamp.toISOString(),
            eventType: e.eventType,
            hashAtEvent: e.hashAtEvent,
            hashMatch: e.hashMatch,
            actorName:
              e.handlerTo?.name ??
              e.handlerFrom?.name ??
              item.submittedBy.name,
          }))}
        />
      ) : null}

      {tab === "reports" ? (
        can(session.user.role, "reports:generate") ? (
          <GenerateCustodyReportButton
            evidenceDbId={item.id}
            evidenceLabel={item.evidenceId}
          />
        ) : (
          <EvidenceTabPlaceholder
            title="Custody reports"
            description="PDF custody reports can be generated by examiners, supervisors, and admins."
          />
        )
      ) : null}

      {tab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Exhibit details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-ems">Case number</dt>
                  <dd className="mt-0.5 font-medium">{item.caseNumber}</dd>
                </div>
                <div>
                  <dt className="text-muted-ems">Type</dt>
                  <dd className="mt-0.5 font-medium">
                    {EVIDENCE_TYPE_LABELS[item.evidenceType]}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-ems">Intake date</dt>
                  <dd className="mt-0.5 font-medium">
                    {format(item.intakeDate, "dd MMM yyyy HH:mm")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-ems">Intake location</dt>
                  <dd className="mt-0.5 font-medium">{item.intakeLocation}</dd>
                </div>
                <div>
                  <dt className="text-muted-ems">Submitted by</dt>
                  <dd className="mt-0.5 font-medium">
                    {item.submittedBy.name}
                    <span className="block text-muted-ems">
                      {item.submittedBy.email}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-ems">Current custodian</dt>
                  <dd className="mt-0.5 font-medium">
                    {item.currentCustodian ? (
                      <>
                        {item.currentCustodian.name}
                        <span className="block text-muted-ems">
                          {item.currentCustodian.email}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        None (returned
                        {item.returnedTo ? ` → ${item.returnedTo}` : ""})
                      </span>
                    )}
                  </dd>
                </div>
                {item.returnedTo ? (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-ems">Returned to</dt>
                    <dd className="mt-0.5 font-medium">{item.returnedTo}</dd>
                  </div>
                ) : null}
                {item.fileName ? (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-ems">Stored file</dt>
                    <dd className="mt-0.5 font-medium">
                      {item.fileName}
                      {item.fileSize != null ? (
                        <span className="text-muted-ems">
                          {" "}
                          ({(item.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
                <div className="sm:col-span-2">
                  <dt className="text-muted-ems">
                    Current hash{" "}
                    <span className="normal-case">
                      ({item.hashSource === "EXTERNAL" ? "external" : "upload"})
                    </span>
                  </dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-2">
                    <code className="break-all rounded bg-secondary px-2 py-1 font-mono text-xs">
                      {item.currentHash}
                    </code>
                    <CopyButton value={item.currentHash} />
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-ems">Original hash (intake)</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-2">
                    <code className="break-all rounded bg-secondary px-2 py-1 font-mono text-xs">
                      {item.originalHash}
                    </code>
                    <CopyButton value={item.originalHash} />
                    {item.currentHash !== item.originalHash ? (
                      <span className="text-xs font-medium text-accent-integrity">
                        Differs from current hash
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-accent-evidence">
                        Matches current hash
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAudit.length === 0 ? (
                <EmptyState
                  compact
                  icon={FileSearch}
                  title="No audit entries yet"
                  description="Actions on this exhibit will appear here."
                  className="border-0 shadow-none"
                />
              ) : (
                <ul className="space-y-3">
                  {recentAudit.map((entry) => (
                    <li
                      key={entry.id}
                      className="border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <p className="text-sm font-medium text-canvas-foreground">
                        {entry.action}
                      </p>
                      <p className="text-muted-ems">
                        {entry.actor.name} ·{" "}
                        {format(entry.timestamp, "dd MMM yyyy HH:mm")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
