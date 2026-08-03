"use client";

import { cn } from "@/lib/utils";

/**
 * Compact Pakistan flag mark for the NCERT landing hero — subtle motion, respects reduced-motion.
 */
export function PakistanFlagBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pakistan-flag-badge pointer-events-none absolute z-[5]",
        className
      )}
      aria-hidden
    >
      <div className="pakistan-flag-glow absolute -inset-3 rounded-lg opacity-60 blur-md" />
      <svg
        viewBox="0 0 90 60"
        className="relative h-10 w-[60px] overflow-hidden rounded-sm shadow-[0_8px_28px_-6px_rgba(0,0,0,0.55)] ring-1 ring-white/25 sm:h-12 sm:w-[72px]"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>Flag of Pakistan</title>
        {/* Green field */}
        <rect width="90" height="60" fill="#01411C" />
        {/* White hoist stripe */}
        <rect width="22.5" height="60" fill="#FFFFFF" />
        {/* Crescent */}
        <circle cx="52" cy="30" r="14" fill="#FFFFFF" />
        <circle cx="56.5" cy="27.5" r="11.5" fill="#01411C" />
        {/* Star */}
        <polygon
          fill="#FFFFFF"
          points="66,18 67.6,22.8 72.6,22.8 68.6,25.8 70.2,30.6 66,27.6 61.8,30.6 63.4,25.8 59.4,22.8 64.4,22.8"
        />
      </svg>
    </div>
  );
}
