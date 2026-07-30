"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ClipboardList,
  FileSearch,
  Fingerprint,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { type Role } from "@prisma/client";
import { LogoWordmark } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MODULES, ROLE_COLORS, type ModuleKey, type RoleKey } from "@/lib/modules";
import { can, type Action } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  module: ModuleKey;
  icon: typeof LayoutDashboard;
  action: Action;
};

const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        module: "dashboard",
        icon: LayoutDashboard,
        action: "dashboard:view",
      },
    ],
  },
  {
    heading: "Casework",
    items: [
      {
        href: "/evidence",
        label: "Evidence Registry",
        module: "evidence",
        icon: Fingerprint,
        action: "evidence:view",
      },
      {
        href: "/custody",
        label: "Chain of Custody",
        module: "custody",
        icon: Scale,
        action: "custody:view",
      },
      {
        href: "/integrity",
        label: "Integrity Checks",
        module: "integrity",
        icon: ShieldCheck,
        action: "integrity:rehash",
      },
    ],
  },
  {
    heading: "Oversight",
    items: [
      {
        href: "/reports",
        label: "Reports",
        module: "reports",
        icon: ClipboardList,
        action: "reports:generate",
      },
      {
        href: "/audit",
        label: "Audit Trail",
        module: "audit",
        icon: FileSearch,
        action: "audit:view",
      },
      {
        href: "/admin/users",
        label: "Users & Roles",
        module: "admin",
        icon: Users,
        action: "users:view",
      },
    ],
  },
];

const SETTINGS_ITEM = {
  href: "/settings",
  label: "Account settings",
  icon: Settings,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  /** When defined, sidebar is in mobile drawer mode. */
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isDrawer = mobileOpen !== undefined;

  const name = session?.user?.name ?? "Signed out";
  const role = (session?.user?.role ?? "CUSTODIAN") as Role;
  const roleColor = ROLE_COLORS[role as RoleKey] ?? ROLE_COLORS.CUSTODIAN;
  // Lighter role colour so the pill stays legible on near-black.
  const roleOnDark =
    role === "ADMIN" || role === "CUSTODIAN" ? "#A8B4C4" : roleColor;
  const showLabels = isDrawer || !collapsed;
  const settingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => can(role, item.action)),
  })).filter((g) => g.items.length > 0);

  return (
    <aside
      id="app-sidebar"
      aria-label="Main navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-text transition-transform duration-200 ease-smooth",
        isDrawer
          ? cn(
              "w-[260px] shadow-elevated",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )
          : cn(
              "translate-x-0 transition-[width]",
              collapsed ? "w-16" : "w-[260px]"
            )
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border px-3",
          showLabels ? "justify-between gap-2" : "justify-center"
        )}
      >
        <LogoWordmark collapsed={!showLabels} />
        {showLabels ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={isDrawer ? onCloseMobile : onToggle}
            className="h-8 w-8 text-sidebar-muted hover:bg-sidebar-hover hover:text-white"
            aria-label={isDrawer ? "Close navigation menu" : "Collapse sidebar"}
          >
            {isDrawer ? (
              <X className="h-4 w-4" aria-hidden />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden />
            )}
          </Button>
        ) : null}
      </div>

      {!isDrawer && collapsed ? (
        <div className="flex justify-center py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-sidebar-muted hover:bg-sidebar-hover hover:text-white"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group, gi) => (
          <div key={group.heading} className={cn(gi > 0 && "mt-5")}>
            {showLabels ? (
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-muted/70">
                {group.heading}
              </p>
            ) : gi > 0 ? (
              <div
                className="mx-3 mb-2 h-px bg-sidebar-border"
                aria-hidden
              />
            ) : null}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const mod = MODULES[item.module];
                const accent = mod.onDark ?? mod.hex;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors duration-150",
                      !showLabels && "justify-center px-0",
                      active
                        ? "bg-sidebar-hover font-medium text-white"
                        : "text-sidebar-text hover:bg-sidebar-hover/70 hover:text-white"
                    )}
                  >
                    {active ? (
                      <span
                        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                        style={{ backgroundColor: accent }}
                        aria-hidden
                      />
                    ) : null}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-opacity duration-150",
                        active ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                      )}
                      style={{ color: accent }}
                      aria-hidden
                    />
                    {showLabels ? (
                      <span className="truncate">{item.label}</span>
                    ) : (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-2 py-2">
        <Link
          href={SETTINGS_ITEM.href}
          title={SETTINGS_ITEM.label}
          aria-current={settingsActive ? "page" : undefined}
          className={cn(
            "relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors duration-150",
            !showLabels && "justify-center px-0",
            settingsActive
              ? "bg-sidebar-hover font-medium text-white"
              : "text-sidebar-text hover:bg-sidebar-hover/70 hover:text-white"
          )}
        >
          {settingsActive ? (
            <span
              className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
              style={{ backgroundColor: "#8B9AA9" }}
              aria-hidden
            />
          ) : null}
          <SETTINGS_ITEM.icon
            className="h-4 w-4 shrink-0"
            style={{ color: "#8B9AA9" }}
            aria-hidden
          />
          {showLabels ? (
            <span className="truncate">{SETTINGS_ITEM.label}</span>
          ) : (
            <span className="sr-only">{SETTINGS_ITEM.label}</span>
          )}
        </Link>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-3",
            !showLabels && "flex-col gap-2"
          )}
        >
          <Avatar className="h-8 w-8 ring-1 ring-sidebar-border">
            <AvatarFallback className="bg-[#1c2230] text-xs font-medium text-white">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          {showLabels ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{name}</p>
              <span
                className="mt-1 inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: `${roleOnDark}29`,
                  color: roleOnDark,
                }}
              >
                {role}
              </span>
            </div>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-sidebar-muted hover:bg-sidebar-hover hover:text-white"
            title="Sign out"
            aria-label="Sign out"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </aside>
  );
}
