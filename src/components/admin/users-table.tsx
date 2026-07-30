"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { type Role } from "@prisma/client";
import { setUserActive } from "@/actions/users";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { RoleBadge } from "@/components/admin/role-badge";
import { DataTable, type DataTableColumn } from "@/components/ui-ems/data-table";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  badgeNumber: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  hasCustodyHistory: boolean;
  currentlyHolds: number;
};

export function UsersTable({
  rows,
  canManage,
  currentUserId,
}: {
  rows: AdminUserRow[];
  canManage: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleActive(row: AdminUserRow, next: boolean) {
    setError(null);
    setPendingId(row.id);
    startTransition(async () => {
      const result = await setUserActive(row.id, next);
      setPendingId(null);
      if (!result.ok) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: next ? "Reactivation failed" : "Deactivation failed",
          description: result.error,
        });
        return;
      }
      toast({
        variant: "admin",
        title: next ? "User reactivated" : "User deactivated",
        description: `${row.name} is now ${next ? "active" : "inactive"}.`,
      });
      router.refresh();
    });
  }

  const columns = useMemo<DataTableColumn<AdminUserRow>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        sortable: true,
        sortValue: (r) => r.name.toLowerCase(),
        cell: (r) => (
          <div>
            <p className="font-medium text-canvas-foreground">{r.name}</p>
            {r.id === currentUserId ? (
              <span className="text-[11px] text-muted-foreground">You</span>
            ) : null}
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        sortable: true,
        sortValue: (r) => r.email,
        cell: (r) => (
          <span className="text-sm text-canvas-foreground">{r.email}</span>
        ),
      },
      {
        key: "role",
        header: "Role",
        sortable: true,
        sortValue: (r) => r.role,
        cell: (r) => <RoleBadge role={r.role} />,
      },
      {
        key: "badge",
        header: "Badge",
        cell: (r) => (
          <span className="font-mono text-xs text-muted-foreground">
            {r.badgeNumber ?? "—"}
          </span>
        ),
      },
      {
        key: "active",
        header: "Active",
        cell: (r) =>
          canManage ? (
            <Switch
              checked={r.isActive}
              disabled={
                pending ||
                pendingId === r.id ||
                r.id === currentUserId
              }
              onCheckedChange={(checked) => toggleActive(r, checked)}
              aria-label={
                r.isActive ? `Deactivate ${r.name}` : `Reactivate ${r.name}`
              }
              style={
                r.isActive
                  ? { backgroundColor: "#5C6B7A" }
                  : undefined
              }
            />
          ) : (
            <span
              className={
                r.isActive
                  ? "text-xs font-medium text-accent-evidence"
                  : "text-xs font-medium text-muted-foreground"
              }
            >
              {r.isActive ? "Active" : "Inactive"}
            </span>
          ),
      },
      {
        key: "lastLogin",
        header: "Last login",
        sortable: true,
        sortValue: (r) =>
          r.lastLoginAt ? new Date(r.lastLoginAt).getTime() : 0,
        cell: (r) => (
          <span className="text-muted-ems">
            {r.lastLoginAt
              ? format(new Date(r.lastLoginAt), "dd MMM yyyy HH:mm")
              : "Never"}
          </span>
        ),
      },
      ...(canManage
        ? [
            {
              key: "actions",
              header: "",
              className: "w-12",
              cell: (r: AdminUserRow) => <EditUserDialog user={r} />,
            } satisfies DataTableColumn<AdminUserRow>,
          ]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, currentUserId, pending, pendingId]
  );

  return (
    <div className="space-y-3">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-accent-integrity/30 bg-accent-integrity/10 px-3 py-2 text-sm text-accent-integrity"
        >
          {error}
        </p>
      ) : null}
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        filterPlaceholder="Filter by name, email, role…"
        filterFn={(row, q) =>
          row.name.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.role.toLowerCase().includes(q) ||
          (row.badgeNumber?.toLowerCase().includes(q) ?? false)
        }
        emptyMessage="No users found."
      />
    </div>
  );
}
