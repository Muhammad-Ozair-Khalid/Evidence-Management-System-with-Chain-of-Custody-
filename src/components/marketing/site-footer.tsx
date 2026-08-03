import Link from "next/link";
import { LogoMark } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080a0e] text-[#9aa0a6]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <LogoMark size={32} />
          <div>
            <p className="font-display text-sm font-bold text-white">EMS</p>
            <p className="mt-1 max-w-sm text-[13px] leading-relaxed">
              Evidence Management System with Chain of Custody — NCERT Forensic
              Evidence Unit.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <a href="#capabilities" className="hover:text-white">
            Capabilities
          </a>
          <a href="#modules" className="hover:text-white">
            Modules
          </a>
          <a href="#roles" className="hover:text-white">
            Roles
          </a>
          <Link href="/login" className="hover:text-white">
            Sign in
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-[11px] tracking-wide">
        Digital evidence inventory · Tamper-evident custody ledger · Append-only
        audit
      </div>
    </footer>
  );
}
