"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronRight, Menu, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { GlobalSearch } from "@/components/layout/global-search";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { MODULES, ROLE_COLORS, type ModuleKey, type RoleKey } from "@/lib/modules";
import { cn } from "@/lib/utils";

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

function moduleForPath(pathname: string): ModuleKey | null {
  if (pathname.startsWith("/evidence")) return "evidence";
  if (pathname.startsWith("/custody")) return "custody";
  if (pathname.startsWith("/integrity")) return "integrity";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/audit")) return "audit";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  return null;
}

export function TopBar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const crumbs =
    BREADCRUMB_MAP[pathname] ??
    (pathname.startsWith("/evidence/")
      ? ["Evidence Registry", "Detail"]
      : ["EMS"]);

  const modKey = moduleForPath(pathname);
  const accent = modKey ? MODULES[modKey].hex : undefined;
  const role = session?.user?.role as RoleKey | undefined;
  const roleColor = role ? ROLE_COLORS[role] : undefined;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "surface-glass sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border px-3 transition-shadow duration-200 sm:gap-4 md:px-6",
        scrolled && "shadow-card"
      )}
      style={
        accent
          ? {
              borderTopWidth: 2,
              borderTopColor: accent,
              borderTopStyle: "solid",
            }
          : undefined
      }
    >
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
        <ol className="flex items-center gap-1 truncate text-sm">
          <li className="text-muted-foreground">EMS</li>
          {crumbs.map((crumb, i) => (
            <li key={crumb} className="flex items-center gap-1">
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
                aria-hidden
              />
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
        className="hidden shrink-0 items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand sm:inline-flex"
        title="Development environment"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" aria-hidden />
        Dev
      </span>

      {role && roleColor ? (
        <span
          className="hidden shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide md:inline-flex"
          style={{
            color: roleColor,
            backgroundColor: `${roleColor}18`,
            boxShadow: `inset 0 0 0 1px ${roleColor}33`,
          }}
        >
          {role}
        </span>
      ) : null}

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
