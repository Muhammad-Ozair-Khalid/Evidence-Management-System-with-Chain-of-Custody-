"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LogoWordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#modules", label: "Modules" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#roles", label: "Roles" },
];

export function SiteNav({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated" && !!session?.user;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/10 bg-[#0B0E14]/85 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="EMS home">
          <LogoWordmark />
        </Link>

        <nav
          aria-label="Landing sections"
          className="hidden items-center gap-1 md:flex"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-[#C7CBD1] transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {signedIn ? (
            <Button
              asChild
              className="bg-brand text-white shadow-brand hover:bg-brand-soft"
            >
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <Button
              asChild
              className="bg-brand text-white shadow-brand hover:bg-brand-soft"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
