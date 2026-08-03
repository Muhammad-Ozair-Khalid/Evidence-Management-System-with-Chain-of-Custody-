"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { format } from "date-fns";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { resolveIntegrityFlag } from "@/actions/integrity";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type FlaggedItemContext = {
  id: string;
  evidenceId: string;
  title: string;
  mismatchEvent: {
    id: string;
    eventType: string;
    timestamp: string;
    hashAtEvent: string;
    location: string;
    reason: string;
    actorName: string | null;
  } | null;
  expectedHash: string;
  flaggedAt: string | null;
};

export function ResolveIntegrityDialog({
  item,
  onResolved,
}: {
  item: FlaggedItemContext;
  /** Called only when decision === resolve (item leaves the queue). */
  onResolved?: (evidenceItemId: string) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<"keep_flagged" | "resolve">(
    "resolve"
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("evidenceItemId", item.id);
    formData.set("decision", decision);

    startTransition(async () => {
      const result = await resolveIntegrityFlag(formData);
      if (!result.ok) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Resolution failed",
          description: result.error,
        });
        return;
      }

      setOpen(false);

      if (result.decision === "resolve") {
        onResolved?.(item.id);
        toast({
          variant: "evidence",
          title: `${result.evidenceId} cleared`,
          description:
            "Status restored to IN_CUSTODY — removed from the flagged queue.",
        });
      } else {
        toast({
          variant: "integrity",
          title: `${result.evidenceId} still flagged`,
          description:
            "You confirmed the issue. It remains INTEGRITY_FLAGGED until Mark resolved is chosen.",
        });
      }

      router.refresh();
    });
  }

  const submitLabel =
    decision === "resolve"
      ? pending
        ? "Clearing…"
        : "Mark resolved · restore IN_CUSTODY"
      : pending
        ? "Saving…"
        : "Confirm · keep flagged";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          style={{ backgroundColor: "#D13438" }}
          className="text-white hover:opacity-90"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Review & Resolve
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review integrity flag</DialogTitle>
          <DialogDescription>
            {item.evidenceId} — {item.title}. Choose carefully: only{" "}
            <strong>Mark resolved</strong> removes this row from the queue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-md border border-accent-integrity/40 bg-accent-integrity/5 p-3 text-sm">
          {item.mismatchEvent ? (
            <>
              <p>
                <span className="text-muted-ems">Event:</span>{" "}
                {item.mismatchEvent.eventType} ·{" "}
                {format(
                  new Date(item.mismatchEvent.timestamp),
                  "dd MMM yyyy HH:mm"
                )}
              </p>
              <p>
                <span className="text-muted-ems">Performed by:</span>{" "}
                {item.mismatchEvent.actorName ?? "Unknown"}
              </p>
              <p>
                <span className="text-muted-ems">Location / reason:</span>{" "}
                {item.mismatchEvent.location} — {item.mismatchEvent.reason}
              </p>
              <div>
                <p className="text-muted-ems">Expected (currentHash)</p>
                <code className="break-all font-mono text-xs">
                  {item.expectedHash}
                </code>
              </div>
              <div>
                <p className="text-muted-ems">Actual (hash at event)</p>
                <code className="break-all font-mono text-xs text-accent-integrity">
                  {item.mismatchEvent.hashAtEvent}
                </code>
              </div>
            </>
          ) : (
            <p className="text-muted-ems">
              No mismatch custody event found — review audit trail for context.
            </p>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="decision" value={decision} readOnly />
          <div className="space-y-2">
            <Label>Decision</Label>
            <div className="grid gap-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                  decision === "resolve"
                    ? "border-accent-evidence/45 bg-accent-evidence/10"
                    : "border-border bg-surface/40 hover:border-border/80"
                }`}
              >
                <input
                  type="radio"
                  name="decisionRadio"
                  checked={decision === "resolve"}
                  onChange={() => setDecision("resolve")}
                  className="mt-1"
                />
                <span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-canvas-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent-evidence" />
                    Mark resolved
                  </span>
                  <span className="mt-0.5 block text-muted-ems">
                    Hashing tool error or false positive — restore status to{" "}
                    <strong>IN_CUSTODY</strong> and <strong>leave this list</strong>
                  </span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                  decision === "keep_flagged"
                    ? "border-accent-integrity/45 bg-accent-integrity/10"
                    : "border-border bg-surface/40 hover:border-border/80"
                }`}
              >
                <input
                  type="radio"
                  name="decisionRadio"
                  checked={decision === "keep_flagged"}
                  onChange={() => setDecision("keep_flagged")}
                  className="mt-1"
                />
                <span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-canvas-foreground">
                    <ShieldAlert className="h-3.5 w-3.5 text-accent-integrity" />
                    Confirm issue
                  </span>
                  <span className="mt-0.5 block text-muted-ems">
                    Keep <strong>INTEGRITY_FLAGGED</strong> — row{" "}
                    <strong>stays in this queue</strong> for further investigation
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resolutionNote">
              Resolution note{" "}
              <span className="text-accent-integrity">(required · min 15 chars)</span>
            </Label>
            <Textarea
              id="resolutionNote"
              name="resolutionNote"
              required
              minLength={15}
              placeholder="Document findings, tools used, and justification for this decision…"
              className="min-h-[100px]"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-md border border-accent-integrity/30 bg-accent-integrity/10 px-3 py-2 text-sm text-accent-integrity"
            >
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              style={{
                backgroundColor:
                  decision === "resolve" ? "#107C10" : "#D13438",
              }}
              className="text-white hover:opacity-90"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
