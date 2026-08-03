"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui-ems/reveal";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Seizure", color: "#C48A00" },
  { label: "Transfer", color: "#3D9A5F" },
  { label: "Examination", color: "#8764B8" },
  { label: "Return", color: "#7CB894" },
] as const;

const CYCLE_MS = 2200;

export function LiveChainDemo({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % STEPS.length);
    }, CYCLE_MS);

    return () => window.clearInterval(id);
  }, []);

  return (
    <Reveal
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#2a5a3c]/60 bg-[#06140c]/80 p-6 ring-1 ring-[#c48a00]/20 sm:p-8",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
      >
        <div className="absolute -left-8 top-0 h-32 w-32 rounded-full bg-[#c48a00]/20 blur-3xl" />
        <div className="absolute -right-8 bottom-0 h-28 w-28 rounded-full bg-[#107c10]/25 blur-3xl" />
      </div>

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#c48a00]">
          Live custody loop
        </p>
        <p className="mt-1 font-display text-lg font-semibold text-[#e8f0ea]">
          Chain of custody in motion
        </p>
        <p className="mt-1 text-sm text-[#9bb0a3]">
          Each handoff is logged with handler, timestamp, and integrity check.
        </p>

        <div
          className="mt-8 flex items-start justify-between gap-1 sm:gap-2"
          role="list"
          aria-label="Custody chain steps"
        >
          {STEPS.map((step, i) => {
            const isActive = i === activeIndex;
            const isComplete = i < activeIndex;
            const connectorFilled = i < activeIndex;

            return (
              <div
                key={step.label}
                role="listitem"
                className="flex min-w-0 flex-1 flex-col items-center"
              >
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <div
                      className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-[#1a3d28]"
                      aria-hidden
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: connectorFilled ? "100%" : "0%",
                          backgroundColor: STEPS[i - 1].color,
                          opacity: connectorFilled ? 0.9 : 0,
                        }}
                      />
                    </div>
                  )}

                  <div
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 sm:h-11 sm:w-11",
                      isActive && "glow-ring scale-105",
                      !isActive &&
                        !isComplete &&
                        "border-[#1a3d28] bg-[#0a1a12]"
                    )}
                    style={
                      isActive || isComplete
                        ? {
                            borderColor: step.color,
                            backgroundColor: `${step.color}22`,
                            ["--glow" as string]: step.color,
                          }
                        : undefined
                    }
                  >
                    {isActive && (
                      <span
                        className="animate-pulse-ring absolute inset-0 rounded-full opacity-60"
                        style={{ boxShadow: `0 0 0 0 ${step.color}66` }}
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        "relative font-display text-sm font-bold tabular-nums",
                        isActive || isComplete
                          ? "text-[#e8f0ea]"
                          : "text-[#6f8578]"
                      )}
                    >
                      {i + 1}
                    </span>
                  </div>

                  {i < STEPS.length - 1 && (
                    <div
                      className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-[#1a3d28]"
                      aria-hidden
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: isComplete ? "100%" : isActive ? "50%" : "0%",
                          backgroundColor: step.color,
                          opacity: isComplete || isActive ? 0.9 : 0,
                        }}
                      />
                    </div>
                  )}
                </div>

                <p
                  className={cn(
                    "mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.06em] sm:text-xs",
                    isActive ? "text-[#e8f0ea]" : "text-[#6f8578]"
                  )}
                  style={isActive ? { color: step.color } : undefined}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-[#1a3d28] bg-[#0a1a12]/80 px-4 py-2.5">
          <span
            className="h-2 w-2 animate-pulse rounded-full"
            style={{ backgroundColor: STEPS[activeIndex].color }}
            aria-hidden
          />
          <p className="font-mono text-xs text-[#9bb0a3]">
            Event:{" "}
            <span className="font-semibold text-[#e8f0ea]">
              {STEPS[activeIndex].label}
            </span>
            <span className="text-[#6f8578]"> · </span>
            SHA-256 verified
          </p>
        </div>
      </div>
    </Reveal>
  );
}
