import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import {
  OwnActivityList,
  type OwnActivityEntry,
} from "@/components/settings/own-activity-list";
import { RoleBadge } from "@/components/admin/role-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [profile, activity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        role: true,
        badgeNumber: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    prisma.auditLogEntry.findMany({
      where: { actorId: session.user.id },
      orderBy: { timestamp: "desc" },
      take: 15,
    }),
  ]);

  if (!profile) redirect("/login");

  const entries: OwnActivityEntry[] = activity.map((e) => {
    const meta = e.metadata as Record<string, unknown> | null;
    const summary =
      typeof meta?.evidenceId === "string"
        ? meta.evidenceId
        : e.entityType === "Auth"
          ? String(e.entityId)
          : `${e.entityType} · ${e.entityId.slice(0, 8)}…`;
    return {
      id: e.id,
      timestamp: e.timestamp.toISOString(),
      action: e.action,
      entityType: e.entityType,
      entityId: e.entityId,
      summary,
    };
  });

  return (
    <div>
      <PageHeader
        title="Account settings"
        subtitle="Manage your password and review your own activity."
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-ems">Name</p>
              <p className="font-medium">{profile.name}</p>
            </div>
            <div>
              <p className="text-muted-ems">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-muted-ems">Role</p>
              <div className="mt-1">
                <RoleBadge role={profile.role} />
              </div>
            </div>
            <div>
              <p className="text-muted-ems">Badge</p>
              <p className="font-mono text-xs">
                {profile.badgeNumber ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-ems">Last login</p>
              <p>
                {profile.lastLoginAt
                  ? format(profile.lastLoginAt, "dd MMM yyyy HH:mm")
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-ems">Account created</p>
              <p>{format(profile.createdAt, "dd MMM yyyy")}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <ChangePasswordForm />
          <OwnActivityList entries={entries} />
        </div>
      </div>
    </div>
  );
}
