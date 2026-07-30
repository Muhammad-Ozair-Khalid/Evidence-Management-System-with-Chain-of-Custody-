"use client";

import { Bell, Menu, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { GlobalSearch } from "@/components/layout/global-search";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";

const BREADCRUMB_MAP: Record<string, string[]> = {
  "/dashboard": ["Overview"],
  "/evidence": ["Evidence Registry"],
  "/custody": ["Chain of Custody"],
  "/integrity": ["Integrity Checks"],
  "/reports": ["Reports"],
  "/audit": ["Audit Trail"],
  "/admin/users": ["Admin", "Users & Roles"],
  "/settings": ["Account settings"],
};

export function TopBar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const crumbs =
    BREADCRUMB_MAP[pathname] ??
    (pathname.startsWith("/evidence/")
      ? ["Evidence Registry", "Detail"]
      : ["EMS"]);

  return (
    <header className="surface-glass sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border px-3 sm:gap-4 md:px-6">
      {onOpenMobileNav ? (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>
      ) : null}

      <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 sm:block">
        <ol className="flex items-center gap-1.5 truncate text-sm">
          <li className="text-muted-foreground">EMS</li>
          {crumbs.map((crumb, i) => (
            <li key={crumb} className="flex items-center gap-1.5">
              <span className="text-muted-foreground/60" aria-hidden>
                /
              </span>
              <span
                className={
                  i === crumbs.length - 1
                    ? "truncate font-medium text-canvas-foreground"
                    : "truncate text-muted-foreground"
                }
              >
                {crumb}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="min-w-0 flex-1 sm:max-w-xs sm:flex-none">
        <GlobalSearch />
      </div>

      <span
        className="hidden shrink-0 items-center gap-1.5 rounded-full border border-accent-admin/30 bg-accent-admin/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-admin sm:inline-flex"
        title="Development environment"
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-accent-admin"
          aria-hidden
        />
        Dev
      </span>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" aria-hidden />
          ) : (
            <Moon className="h-4 w-4" aria-hidden />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications (coming soon)"
          title="Notifications (coming soon)"
          disabled
          className="hidden sm:inline-flex"
        >
          <Bell className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </header>
  );
}
