import Link from "next/link";
import { LogoWordmark } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#07090c] text-[#8B9199]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <LogoWordmark />
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed">
            Evidence Management System with Chain of Custody — NCERT Forensic
            Evidence Unit.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
          <a
            href="#capabilities"
            className="transition-colors hover:text-white"
          >
            Capabilities
          </a>
          <a href="#modules" className="transition-colors hover:text-white">
            Modules
          </a>
          <a href="#roles" className="transition-colors hover:text-white">
            Roles
          </a>
          <a href="#faq" className="transition-colors hover:text-white">
            FAQ
          </a>
          <Link
            href="/login?callbackUrl=%2Fdashboard"
            className="transition-colors hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
      <div className="marketing-section-rule opacity-60" />
      <div className="py-5 text-center text-[11px] tracking-[0.06em] text-[#6B7280]">
        Digital evidence inventory · Tamper-evident custody ledger · Append-only
        audit
      </div>
    </footer>
  );
}
