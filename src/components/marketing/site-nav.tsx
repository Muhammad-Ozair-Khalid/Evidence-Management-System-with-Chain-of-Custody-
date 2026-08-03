"use client";

import Link from "next/link";
import { LogoWordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#modules", label: "Modules" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#roles", label: "Roles" },
  { href: "#faq", label: "FAQ" },
];

/** Public landing always routes through login — never skip auth. */
const LOGIN_HREF = "/login?callbackUrl=%2Fdashboard";

export function SiteNav({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/10 bg-[#121820]/88 backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="EMS home">
          <LogoWordmark sequenced />
        </Link>

        <nav
          aria-label="Landing sections"
          className="hidden items-center gap-0.5 md:flex"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-[13px] text-[#C5CCD6] transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            className="border border-white/20 bg-white/[0.08] text-white shadow-none hover:bg-white/[0.14]"
          >
            <Link href={LOGIN_HREF}>Sign in</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
