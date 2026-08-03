import { type CustodyEventType } from "@prisma/client";
import { CheckCircle2, XCircle } from "lucide-react";
import { CUSTODY_EVENT_COLORS } from "@/lib/custody-labels";
import { cn } from "@/lib/utils";

export type ChainStep = {
  id: string;
  eventType: CustodyEventType;
  label: string;
  hashMatch: boolean | null;
};

export function CustodyChainStepper({ steps }: { steps: ChainStep[] }) {
  if (steps.length === 0) return null;

  const anyFailed = steps.some((s) => s.hashMatch === false);
  const connectorClass = anyFailed
    ? "bg-accent-integrity"
    : "bg-accent-evidence";

  return (
    <div className="mb-6 overflow-x-auto rounded-lg border border-border bg-card p-4 shadow-card">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Custody chain integrity
      </p>
      <div className="flex min-w-max items-center gap-0">
        {steps.map((step, i) => {
          const color = CUSTODY_EVENT_COLORS[step.eventType].hex;
          return (
            <div
              key={step.id}
              className="animate-fade flex items-center"
              style={{ animationDelay: `${i * 50}ms` }}
              title={`${step.label}${
                step.hashMatch === false
                  ? " — hash mismatch"
                  : step.hashMatch === true
                    ? " — hash match"
                    : ""
              }`}
            >
              <div className="flex flex-col items-center px-1">
                <span
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-white/40"
                  style={{
                    backgroundColor: color,
                    ["--glow" as string]: `${color}66`,
                  }}
                >
                  {i + 1}
                  {step.hashMatch === true ? (
                    <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-card text-accent-evidence" />
                  ) : null}
                  {step.hashMatch === false ? (
                    <XCircle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-card text-accent-integrity" />
                  ) : null}
                </span>
                <span className="mt-1.5 max-w-[80px] truncate text-center text-[10px] font-medium text-canvas-foreground">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 ? (
                <div
                  className={cn(
                    "mx-1 h-0.5 w-10 origin-left sm:w-14",
                    connectorClass
                  )}
                  style={{
                    animation: "scaleIn 0.4s ease both",
                    animationDelay: `${i * 50 + 80}ms`,
                  }}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-muted-ems">
        {anyFailed
          ? "One or more hash checks along this chain failed."
          : "No failed hash checks recorded on this chain (pending checks do not fail the connector)."}
      </p>
    </div>
  );
}
