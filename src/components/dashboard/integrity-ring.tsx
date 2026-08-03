"use client";

import { AnimatedNumber } from "@/components/ui-ems/animated-number";

export function IntegrityRing({ passed, failed }: { passed: number; failed: number }) {
  const total = passed + failed;
  const passRate = total === 0 ? 100 : Math.round((passed / total) * 100);

  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - passRate / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#107C10"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold text-canvas-foreground">
            <AnimatedNumber value={passRate} />
            <span className="text-lg">%</span>
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-ems">
        {passed} / {total} checks
      </p>
    </div>
  );
}
