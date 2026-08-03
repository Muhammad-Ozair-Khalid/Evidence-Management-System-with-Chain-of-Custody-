import { redirect } from "next/navigation";
import { differenceInDays, format } from "date-fns";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import {
  OwnActivityList,
  type OwnActivityEntry,
} from "@/components/settings/own-activity-list";
import { RoleBadge } from "@/components/admin/role-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { ROLE_COLORS, type RoleKey } from "@/lib/modules";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

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

  const roleColor =
    ROLE_COLORS[profile.role as RoleKey] ?? ROLE_COLORS.CUSTODIAN;
  const accountAgeDays = differenceInDays(new Date(), profile.createdAt);

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
        eyebrow="Account"
        eyebrowColor="#0B5C2E"
        title="Account settings"
        subtitle="Manage your password and review your own activity."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          className="overflow-hidden lg:col-span-1"
          style={{
            backgroundImage: `linear-gradient(160deg, ${roleColor}14 0%, transparent 50%)`,
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <Avatar
                className="h-16 w-16 ring-2"
                style={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ["--tw-ring-color" as any]: `${roleColor}66`,
                }}
              >
                <AvatarFallback
                  className="text-lg font-semibold text-white"
                  style={{ backgroundColor: roleColor }}
                >
                  {initials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{profile.name}</CardTitle>
                <div className="mt-1.5">
                  <RoleBadge role={profile.role} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-ems">Email</p>
              <p className="mt-0.5 font-medium text-canvas-foreground">
                {profile.email}
              </p>
            </div>
            <div>
              <p className="text-muted-ems">Badge</p>
              <p className="mt-0.5 font-mono text-xs text-canvas-foreground">
                {profile.badgeNumber ?? "—"}
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-muted-ems">Last login</p>
              <p className="mt-0.5 text-canvas-foreground">
                {profile.lastLoginAt
                  ? format(profile.lastLoginAt, "dd MMM yyyy HH:mm")
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-ems">Account age</p>
              <p className="mt-0.5 text-canvas-foreground">
                {accountAgeDays} day{accountAgeDays === 1 ? "" : "s"} · since{" "}
                {format(profile.createdAt, "dd MMM yyyy")}
              </p>
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
