"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
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

export function DashboardShell({ children }: { children: ReactNode }) {
  const bp = useBreakpoint();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse to icon rail on tablet; expand on desktop.
  useEffect(() => {
    if (bp === "tablet") setCollapsed(true);
    if (bp === "desktop") setCollapsed(false);
    if (bp !== "mobile") setMobileOpen(false);
  }, [bp]);

  // Close drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isMobile = bp === "mobile";
  const effectiveCollapsed = isMobile ? false : collapsed;

  return (
    <AuthSessionProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-canvas">
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
              "flex min-h-screen flex-col transition-[padding] duration-200",
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
