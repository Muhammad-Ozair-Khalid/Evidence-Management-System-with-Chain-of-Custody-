import { CheckCircle2, XCircle, MinusCircle, Scale } from "lucide-react";
import { format } from "date-fns";
import { type CustodyEventType } from "@prisma/client";
import { CustodyEventTypeTag } from "@/components/custody/event-type-tag";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { CUSTODY_EVENT_COLORS } from "@/lib/custody-labels";

export type TimelineEvent = {
  id: string;
  eventType: CustodyEventType;
  timestamp: string;
  location: string;
  reason: string;
  hashAtEvent: string;
  hashMatch: boolean | null;
  returnDestination: string | null;
  handlerFrom: { id: string; name: string } | null;
  handlerTo: { id: string; name: string } | null;
};

function HashMatchIcon({ match }: { match: boolean | null }) {
  if (match === true) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-evidence">
        <CheckCircle2 className="h-3.5 w-3.5" /> Hash match
      </span>
    );
  }
  if (match === false) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-integrity">
        <XCircle className="h-3.5 w-3.5" /> Hash mismatch
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <MinusCircle className="h-3.5 w-3.5" /> Re-hash pending
    </span>
  );
}

export function CustodyTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Scale}
        title="No custody events yet"
        description="The seizure event created at intake will appear here, followed by every transfer, examination, and return."
      />
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const color = CUSTODY_EVENT_COLORS[event.eventType].hex;
        const isLast = index === events.length - 1;
        const fromLabel = event.handlerFrom?.name ?? "—";
        const toLabel =
          event.eventType === "RETURN"
            ? event.returnDestination ?? "Destination"
            : event.handlerTo?.name ?? "—";

        return (
          <li key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            <div className="flex w-28 shrink-0 flex-col items-end pt-1 text-right sm:w-36">
              <time className="text-xs font-medium text-canvas-foreground">
                {format(new Date(event.timestamp), "dd MMM yyyy")}
              </time>
              <span className="text-muted-ems">
                {format(new Date(event.timestamp), "HH:mm")}
              </span>
            </div>

            <div className="relative flex flex-col items-center">
              <span
                className="z-10 mt-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-canvas"
                style={{ backgroundColor: color }}
              />
              {!isLast ? (
                <span
                  className="absolute top-5 bottom-0 w-0.5"
                  style={{ backgroundColor: `${color}55` }}
                  aria-hidden
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <CustodyEventTypeTag type={event.eventType} />
                <HashMatchIcon match={event.hashMatch} />
              </div>
              <p className="text-sm font-medium text-canvas-foreground">
                <span className="text-muted-foreground">{fromLabel}</span>
                <span className="mx-1.5 text-accent-custody">→</span>
                <span>{toLabel}</span>
              </p>
              <p className="mt-1 text-muted-ems">{event.location}</p>
              <p className="mt-2 text-sm text-canvas-foreground">{event.reason}</p>
              <p className="mt-3 font-mono text-xs break-all text-muted-foreground">
                hash@event: {event.hashAtEvent}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
