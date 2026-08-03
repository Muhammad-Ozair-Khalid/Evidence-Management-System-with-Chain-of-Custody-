"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { MODULES, type ModuleKey } from "@/lib/modules";
import { cn } from "@/lib/utils";

type Breakpoint = "mobile" | "tablet" | "desktop";

function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("desktop");

  useEffect(() => {
    function sync() {
      const w = window.innerWidth;
      if (w < 768) setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else setBp("desktop");
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return bp;
}

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

export function DashboardShell({ children }: { children: ReactNode }) {
  const bp = useBreakpoint();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (bp === "tablet") setCollapsed(true);
    if (bp === "desktop") setCollapsed(false);
    if (bp !== "mobile") setMobileOpen(false);
  }, [bp]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isMobile = bp === "mobile";
  const effectiveCollapsed = isMobile ? false : collapsed;
  const modKey = moduleForPath(pathname);
  const wash = modKey ? MODULES[modKey].hex : undefined;

  return (
    <AuthSessionProvider>
      <ThemeProvider>
        <div className="relative min-h-screen bg-canvas">
          {wash ? (
            <div
              className="pointer-events-none fixed inset-0 z-0"
              style={{
                opacity: 0.11,
                backgroundImage: `
                  radial-gradient(ellipse 70% 50% at 85% -10%, ${wash}, transparent 55%),
                  radial-gradient(ellipse 45% 35% at 8% 90%, ${wash}66, transparent 50%),
                  linear-gradient(${wash}22 1px, transparent 1px),
                  linear-gradient(90deg, ${wash}22 1px, transparent 1px)
                `,
                backgroundSize: "auto, auto, 40px 40px, 40px 40px",
                maskImage:
                  "radial-gradient(ellipse 90% 80% at 50% 20%, #000 20%, transparent 75%)",
              }}
              aria-hidden
            />
          ) : null}

          {isMobile && mobileOpen ? (
            <button
              type="button"
              className="animate-fade fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
              aria-label="Close navigation overlay"
              onClick={() => setMobileOpen(false)}
            />
          ) : null}

          <Sidebar
            collapsed={effectiveCollapsed}
            onToggle={() => {
              if (isMobile) setMobileOpen(false);
              else setCollapsed((v) => !v);
            }}
            mobileOpen={isMobile ? mobileOpen : undefined}
            onCloseMobile={() => setMobileOpen(false)}
          />

          <div
            className={cn(
              "relative z-10 flex min-h-screen flex-col transition-[padding] duration-200",
              isMobile ? "pl-0" : collapsed ? "pl-16" : "pl-[260px]"
            )}
          >
            <TopBar
              onOpenMobileNav={
                isMobile ? () => setMobileOpen(true) : undefined
              }
            />
            <main className="flex-1 px-3 py-5 sm:px-4 md:px-6 md:py-7">
              <div key={pathname} className="animate-rise mx-auto w-full max-w-7xl">
                {children}
              </div>
            </main>
          </div>
          <Toaster />
        </div>
      </ThemeProvider>
    </AuthSessionProvider>
  );
}
