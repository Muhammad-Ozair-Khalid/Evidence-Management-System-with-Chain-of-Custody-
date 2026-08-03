import Link from "next/link";
import { LogoMark } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1a3d28] bg-[#04100a] text-[#9bb0a3]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <LogoMark size={36} />
          <div>
            <p className="font-display text-base font-bold tracking-tight text-[#e8f0ea]">
              EMS
            </p>
            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed">
              Evidence Management System with Chain of Custody — NCERT Forensic
              Evidence Unit.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
          <a
            href="#capabilities"
            className="transition-colors hover:text-[#3d9a5f]"
          >
            Capabilities
          </a>
          <a href="#modules" className="transition-colors hover:text-[#3d9a5f]">
            Modules
          </a>
          <a href="#playbook" className="transition-colors hover:text-[#3d9a5f]">
            Playbook
          </a>
          <a href="#roles" className="transition-colors hover:text-[#3d9a5f]">
            Roles
          </a>
          <a href="#faq" className="transition-colors hover:text-[#3d9a5f]">
            FAQ
          </a>
          <Link
            href="/login?callbackUrl=%2Fdashboard"
            className="transition-colors hover:text-[#3d9a5f]"
          >
            Sign in
          </Link>
        </div>
      </div>
      <div className="marketing-section-rule opacity-80" />
      <div className="py-5 text-center text-[11px] tracking-[0.06em] text-[#6f8578]">
        Digital evidence inventory · Tamper-evident custody ledger · Append-only
        audit
      </div>
    </footer>
  );
}
