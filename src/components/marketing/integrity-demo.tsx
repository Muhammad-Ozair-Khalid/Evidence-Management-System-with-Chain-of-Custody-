"use client";

import { useEffect, useState } from "react";
import { Check, Flag } from "lucide-react";
import { Reveal } from "@/components/ui-ems/reveal";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/modules";

const STORED_HASH =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const MATCH_HASH =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const MISMATCH_HASH =
  "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";

const TOGGLE_MS = 3000;

function truncateHash(hash: string, head = 12, tail = 8) {
  if (hash.length <= head + tail + 3) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export function IntegrityDemo({ className }: { className?: string }) {
  const [matched, setMatched] = useState(true);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      setMatched((m) => !m);
    }, TOGGLE_MS);

    return () => window.clearInterval(id);
  }, []);

  const computedHash = matched ? MATCH_HASH : MISMATCH_HASH;
  const integrityColor = MODULES.integrity.hex;

  return (
    <Reveal
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-[#0d1118] p-6 sm:p-8",
        !matched && "animate-shake",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
            Integrity check
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-white">
            Re-hash on every custody move
          </p>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors duration-500",
            matched
              ? "bg-[#107C10]/20 text-[#7CB894]"
              : "bg-[#D13438]/20 text-[#F87171]"
          )}
        >
          {matched ? (
            <Check className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <Flag className="h-4 w-4 shrink-0" aria-hidden />
          )}
          <span className="text-xs font-bold uppercase tracking-wide">
            {matched ? "Match" : "Mismatch"}
          </span>
        </div>
      </div>

      {!matched && (
        <div
          className="mt-4 inline-flex items-center gap-2 rounded border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: integrityColor,
            borderColor: `${integrityColor}55`,
            backgroundColor: `${integrityColor}18`,
          }}
        >
          <Flag className="h-3 w-3" aria-hidden />
          INTEGRITY_FLAGGED
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <HashPanel
          label="Stored (intake)"
          hash={STORED_HASH}
          accent={MODULES.evidence.hex}
        />
        <HashPanel
          label="Computed (now)"
          hash={computedHash}
          accent={matched ? MODULES.evidence.hex : integrityColor}
          highlight={!matched}
        />
      </div>

      <p className="mt-5 text-sm leading-relaxed text-[#9aa0a6]">
        {matched
          ? "Hashes align — custody may proceed without escalation."
          : "Byte-level drift detected — movement blocked until a supervisor resolves the flag."}
      </p>
    </Reveal>
  );
}

function HashPanel({
  label,
  hash,
  accent,
  highlight = false,
}: {
  label: string;
  hash: string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-colors duration-500",
        highlight && "border-[#D13438]/40 bg-[#D13438]/5"
      )}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: accent }}
      >
        {label}
      </p>
      <p
        className="mt-2 break-all font-mono text-sm text-white sm:text-base"
        title={hash}
      >
        {truncateHash(hash)}
      </p>
    </div>
  );
}
