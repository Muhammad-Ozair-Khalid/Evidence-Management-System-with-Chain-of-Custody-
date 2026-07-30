import { type CustodyEventType } from "@prisma/client";
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
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center px-1">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: color }}
                  title={step.label}
                >
                  {i + 1}
                </span>
                <span className="mt-1 max-w-[72px] truncate text-center text-[10px] font-medium text-canvas-foreground">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 ? (
                <div
                  className={cn("mx-1 h-0.5 w-8 sm:w-12", connectorClass)}
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
