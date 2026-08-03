import { redirect } from "next/navigation";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { UsersTable, type AdminUserRow } from "@/components/admin/users-table";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { SYSTEM_AUDIT_EMAIL } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "users:view")) {
    redirect("/dashboard?error=forbidden");
  }

  const canManage = can(session.user.role, "users:manage");

  const users = await prisma.user.findMany({
    where: { email: { not: SYSTEM_AUDIT_EMAIL } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      badgeNumber: true,
      isActive: true,
      lastLoginAt: true,
      _count: {
        select: {
          custodyEventsFrom: true,
          custodyEventsTo: true,
          evidenceCustodianOf: true,
        },
      },
    },
  });

  const rows: AdminUserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    badgeNumber: u.badgeNumber,
    isActive: u.isActive,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    hasCustodyHistory:
      u._count.custodyEventsFrom + u._count.custodyEventsTo > 0,
    currentlyHolds: u._count.evidenceCustodianOf,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        eyebrowColor="#5C6B7A"
        title="Users & Roles"
        subtitle="ADMIN-only directory. Soft-deactivate accounts — never hard-delete users with custody history."
        actions={
          <div className="flex items-center gap-2">
            <ModuleBadge module="admin" />
            {canManage ? <CreateUserDialog /> : null}
          </div>
        }
      />

      <UsersTable
        rows={rows}
        canManage={canManage}
        currentUserId={session.user.id}
      />
    </div>
  );
}
