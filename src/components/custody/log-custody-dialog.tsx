"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { AlertTriangle, Scale } from "lucide-react";
import { logCustodyEvent } from "@/actions/custody";
import {
  LOGABLE_EVENT_TYPES,
  RETURN_DESTINATION_PRESETS,
  CUSTODY_EVENT_LABELS,
} from "@/lib/custody-labels";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type UserOption = { id: string; name: string; email: string; role: string };

function normalizeClientHash(v: string) {
  return v.trim().toLowerCase();
}

export function LogCustodyEventButton({
  evidenceItemId,
  evidenceLabel,
  currentHash,
  hasStoredFile,
  users,
  disabled,
  isOverride,
}: {
  evidenceItemId: string;
  evidenceLabel: string;
  currentHash: string;
  hasStoredFile: boolean;
  users: UserOption[];
  disabled?: boolean;
  isOverride?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] =
    useState<(typeof LOGABLE_EVENT_TYPES)[number]>("TRANSFER");
  const [destinationPreset, setDestinationPreset] = useState<string>(
    RETURN_DESTINATION_PRESETS[0]
  );
  const [customDestination, setCustomDestination] = useState("");
  const [manualHash, setManualHash] = useState("");
  const [manualHashConfirm, setManualHashConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState<{
    expectedHash: string;
    actualHash: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const isReturn = eventType === "RETURN";

  const doubleEntryMismatch = useMemo(() => {
    if (hasStoredFile) return false;
    if (!manualHash && !manualHashConfirm) return false;
    return (
      normalizeClientHash(manualHash) !== normalizeClientHash(manualHashConfirm)
    );
  }, [hasStoredFile, manualHash, manualHashConfirm]);

  const resolvedDestination = useMemo(() => {
    if (destinationPreset === "Other (specify below)") {
      return customDestination.trim();
    }
    return destinationPreset;
  }, [customDestination, destinationPreset]);

  function resetState() {
    setError(null);
    setMismatch(null);
    setManualHash("");
    setManualHashConfirm("");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMismatch(null);

    if (!hasStoredFile) {
      if (
        normalizeClientHash(manualHash) !==
        normalizeClientHash(manualHashConfirm)
      ) {
        setError(
          "New hash and Confirm new hash must match character-for-character (case-insensitive)."
        );
        return;
      }
    }

    const formData = new FormData(e.currentTarget);
    formData.set("evidenceItemId", evidenceItemId);
    formData.set("eventType", eventType);
    if (isReturn) {
      formData.set("returnDestination", resolvedDestination);
      formData.delete("handlerToId");
    }
    if (!hasStoredFile) {
      formData.set("manualHash", manualHash);
      formData.set("manualHashConfirm", manualHashConfirm);
    }

    startTransition(async () => {
      const result = await logCustodyEvent(formData);
      if (!result.ok) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Custody event failed",
          description: result.error,
        });
        return;
      }
      if (result.hashMatch === false) {
        setMismatch({
          expectedHash: result.expectedHash,
          actualHash: result.actualHash,
        });
        toast({
          variant: "integrity",
          title: "Hash mismatch detected",
          description:
            "Event logged, but the transfer is blocked until a supervisor resolves the integrity flag.",
        });
        router.refresh();
        return;
      }
      setOpen(false);
      resetState();
      toast({
        variant: "custody",
        title: "Custody event logged",
        description: "The chain of custody ledger has been updated.",
      });
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          style={{ backgroundColor: "#D29200" }}
          className="text-white hover:opacity-90"
        >
          <Scale className="h-4 w-4" />
          Log Custody Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log custody event</DialogTitle>
          <DialogDescription>
            {evidenceLabel}
            {isOverride
              ? " — you are logging under a SUPERVISOR/ADMIN override."
              : null}
          </DialogDescription>
        </DialogHeader>

        {mismatch ? (
          <div
            role="alert"
            className="space-y-3 rounded-lg border border-accent-integrity bg-accent-integrity/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-accent-integrity" />
              <div>
                <p className="text-section-title text-accent-integrity">
                  Hash mismatch detected — this evidence&apos;s integrity cannot
                  be confirmed
                </p>
                <p className="mt-2 text-sm text-canvas-foreground">
                  The custody handoff was <strong>not completed</strong>. The
                  failed check was logged and the item is now{" "}
                  <strong>INTEGRITY_FLAGGED</strong>. A SUPERVISOR/ADMIN must
                  review and resolve the flag before further handoffs.
                </p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-medium text-muted-foreground">Expected</p>
                <code className="break-all font-mono">{mismatch.expectedHash}</code>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Actual</p>
                <code className="break-all font-mono text-accent-integrity">
                  {mismatch.actualHash}
                </code>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetState();
              }}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="eventType">Event type</Label>
              <select
                id="eventType"
                className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
                value={eventType}
                onChange={(e) =>
                  setEventType(
                    e.target.value as (typeof LOGABLE_EVENT_TYPES)[number]
                  )
                }
              >
                {LOGABLE_EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CUSTODY_EVENT_LABELS[t]}
                  </option>
                ))}
              </select>
              <p className="text-muted-ems">
                Seizure is recorded automatically at intake and cannot be logged
                here.
              </p>
            </div>

            {!isReturn ? (
              <div className="space-y-1.5">
                <Label htmlFor="handlerToId">Handler to (receiving user)</Label>
                <select
                  id="handlerToId"
                  name="handlerToId"
                  required={!isReturn}
                  className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select user…
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3 rounded-md border border-border bg-secondary/40 p-3">
                <p className="text-sm font-medium text-canvas-foreground">
                  Return destination
                </p>
                <p className="text-muted-ems">
                  Evidence is returned to a place, not a person. Enter the
                  destination explicitly — it is not assumed from the original
                  submitter.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="returnPreset">Destination</Label>
                  <select
                    id="returnPreset"
                    className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
                    value={destinationPreset}
                    onChange={(e) => setDestinationPreset(e.target.value)}
                  >
                    {RETURN_DESTINATION_PRESETS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                {destinationPreset === "Other (specify below)" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="customDestination">Specify destination</Label>
                    <Input
                      id="customDestination"
                      value={customDestination}
                      onChange={(e) => setCustomDestination(e.target.value)}
                      placeholder="e.g. District Court Exhibit Room"
                      required
                    />
                  </div>
                ) : null}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                required
                placeholder="Where this handoff occurred"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason (min. 10 characters)</Label>
              <Textarea
                id="reason"
                name="reason"
                required
                minLength={10}
                placeholder="Provide a real justification for this custody event…"
              />
            </div>

            <div className="space-y-3 rounded-xl border border-accent-custody/35 bg-accent-custody/5 p-4 ring-1 ring-accent-custody/15">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-custody">
                Integrity verification
              </p>
              <code className="block break-all rounded-lg border border-border/60 bg-surface/80 px-2.5 py-2 font-mono text-[11px] text-muted-foreground">
                Expected currentHash: {currentHash}
              </code>

              {hasStoredFile ? (
                <p className="text-sm leading-relaxed text-canvas-foreground">
                  A digital file is stored for this exhibit. On submit, the
                  server will re-read the file and recompute SHA-256
                  automatically — manual hash entry is not allowed.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-canvas-foreground">
                    No in-system file. Enter the hash freshly generated by your
                    external forensic tool (MD5 or SHA-256). Double-entry
                    prevents typos from falsely flagging integrity.
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="manualHash">New hash</Label>
                    <Input
                      id="manualHash"
                      value={manualHash}
                      onChange={(e) => setManualHash(e.target.value)}
                      className="font-mono text-xs"
                      spellCheck={false}
                      required
                      placeholder="MD5 (32) or SHA-256 (64) hex"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="manualHashConfirm">Confirm new hash</Label>
                    <Input
                      id="manualHashConfirm"
                      value={manualHashConfirm}
                      onChange={(e) => setManualHashConfirm(e.target.value)}
                      className="font-mono text-xs"
                      spellCheck={false}
                      required
                      placeholder="Re-enter the same hash"
                    />
                  </div>
                  {doubleEntryMismatch ? (
                    <p className="text-sm text-accent-integrity">
                      Entries do not match — fix before submitting.
                    </p>
                  ) : null}
                </div>
              )}
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending || doubleEntryMismatch}
                style={{ backgroundColor: "#D29200" }}
                className="text-white hover:opacity-90"
              >
                {pending ? "Verifying & saving…" : "Log event"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
