"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { format } from "date-fns";
import { ShieldAlert } from "lucide-react";
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

export function ResolveIntegrityDialog({ item }: { item: FlaggedItemContext }) {
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
      toast({
        variant: "integrity",
        title: "Integrity flag reviewed",
        description: "Your resolution note has been recorded in the audit trail.",
      });
      router.refresh();
    });
  }

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
            {item.evidenceId} — {item.title}
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
          <div className="space-y-2">
            <Label>Decision</Label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="decisionRadio"
                checked={decision === "resolve"}
                onChange={() => setDecision("resolve")}
                className="mt-1"
              />
              <span>
                Mark resolved (e.g. hashing tool error) — restore status to{" "}
                <strong>IN_CUSTODY</strong>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="decisionRadio"
                checked={decision === "keep_flagged"}
                onChange={() => setDecision("keep_flagged")}
                className="mt-1"
              />
              <span>
                Confirm tampering/error — keep <strong>INTEGRITY_FLAGGED</strong>{" "}
                for investigation
              </span>
            </label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resolutionNote">Resolution note</Label>
            <Textarea
              id="resolutionNote"
              name="resolutionNote"
              required
              minLength={15}
              placeholder="Document findings, tools used, and justification for this decision…"
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
              style={{ backgroundColor: "#D13438" }}
              className="text-white hover:opacity-90"
            >
              {pending ? "Saving…" : "Submit resolution"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
