"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { CheckCircle2, FileUp, Fingerprint, Hash } from "lucide-react";
import { EvidenceType } from "@prisma/client";
import { registerEvidence } from "@/actions/evidence";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { EVIDENCE_TYPE_LABELS } from "@/lib/evidence-labels";
import { cn } from "@/lib/utils";

function detectExternalHash(value: string): "MD5" | "SHA-256" | "invalid" | "empty" {
  const v = value.trim();
  if (!v) return "empty";
  if (/^[a-fA-F0-9]{64}$/.test(v)) return "SHA-256";
  if (/^[a-fA-F0-9]{32}$/.test(v)) return "MD5";
  return "invalid";
}

export function RegisterEvidenceForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [externalHash, setExternalHash] = useState("");
  const [hasFile, setHasFile] = useState(false);
  const [success, setSuccess] = useState<{
    evidenceId: string;
    id: string;
  } | null>(null);

  const hashKind = useMemo(
    () => detectExternalHash(externalHash),
    [externalHash]
  );

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerEvidence(formData);
      if (!result.ok) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: result.error,
        });
        return;
      }
      setSuccess({ evidenceId: result.evidenceId, id: result.id });
      toast({
        variant: "evidence",
        title: "Evidence registered",
        description: `Assigned ID ${result.evidenceId}`,
      });
      router.refresh();
    });
  }

  if (success) {
    return (
      <Card className="overflow-hidden border-accent-evidence/40 bg-gradient-to-br from-accent-evidence/10 via-surface to-surface">
        <div className="flex flex-col items-start gap-4 p-1 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-evidence/20 text-accent-evidence ring-1 ring-accent-evidence/30">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-evidence">
              Intake complete
            </p>
            <p className="mt-1 text-section-title text-canvas-foreground">
              Evidence registered
            </p>
            <p className="mt-1.5 text-muted-ems">
              Assigned ID{" "}
              <span className="font-mono text-base font-semibold text-accent-evidence">
                {success.evidenceId}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/evidence">Back to list</Link>
            </Button>
            <Button
              asChild
              style={{ backgroundColor: "#107C10" }}
              className="text-white hover:opacity-90"
            >
              <Link href={`/evidence/${success.id}`}>View item</Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-accent-evidence/20">
      <form onSubmit={onSubmit} className="space-y-0">
        <div className="border-b border-border/80 bg-accent-evidence/[0.06] px-5 py-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-evidence">
            Step 1 · Exhibit details
          </p>
          <p className="mt-1 text-sm text-muted-ems">
            Case filing, type, and intake location lock the exhibit into the
            ledger.
          </p>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="caseNumber">Case number</Label>
              <Input
                id="caseNumber"
                name="caseNumber"
                required
                placeholder="e.g. FIR-2026-118"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="evidenceType">Evidence type</Label>
              <select
                id="evidenceType"
                name="evidenceType"
                required
                className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="" disabled>
                  Select type…
                </option>
                {(Object.keys(EVIDENCE_TYPE_LABELS) as EvidenceType[]).map(
                  (t) => (
                    <option key={t} value={t}>
                      {EVIDENCE_TYPE_LABELS[t]}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Short exhibit title"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder="Describe the exhibit, packaging, and any identifiers…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="intakeLocation">Intake location</Label>
            <Input
              id="intakeLocation"
              name="intakeLocation"
              required
              placeholder="e.g. Digital Forensics Lab — Bench 2"
            />
          </div>
        </div>

        <div className="border-y border-border/80 bg-secondary/30 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-evidence/15 text-accent-evidence ring-1 ring-accent-evidence/25">
              <Fingerprint className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-evidence">
                Step 2 · Integrity hash
              </p>
              <p className="mt-1 text-sm text-muted-ems">
                Provide{" "}
                <span className="font-semibold text-canvas-foreground">
                  either
                </span>{" "}
                a digital file{" "}
                <span className="font-semibold text-canvas-foreground">or</span>{" "}
                an external MD5 / SHA-256 — one path is required.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className={cn(
                "rounded-xl border p-4 transition-colors",
                hasFile
                  ? "border-accent-evidence/50 bg-accent-evidence/5"
                  : "border-border bg-surface/40"
              )}
            >
              <div className="mb-3 flex items-center gap-2 text-accent-evidence">
                <FileUp className="h-4 w-4" />
                <p className="text-[11px] font-bold uppercase tracking-[0.1em]">
                  Option A — Upload
                </p>
              </div>
              <Label htmlFor="file" className="text-xs text-muted-ems">
                Digital file (SHA-256 computed server-side)
              </Label>
              <Input
                id="file"
                name="file"
                type="file"
                className="mt-2"
                onChange={(e) =>
                  setHasFile(Boolean(e.target.files?.[0]?.size))
                }
              />
            </div>

            <div
              className={cn(
                "rounded-xl border p-4 transition-colors",
                hashKind === "MD5" || hashKind === "SHA-256"
                  ? "border-accent-custody/50 bg-accent-custody/5"
                  : "border-border bg-surface/40"
              )}
            >
              <div className="mb-3 flex items-center gap-2 text-accent-custody">
                <Hash className="h-4 w-4" />
                <p className="text-[11px] font-bold uppercase tracking-[0.1em]">
                  Option B — External hash
                </p>
              </div>
              <Label htmlFor="externalHash" className="text-xs text-muted-ems">
                MD5 (32 hex) or SHA-256 (64 hex)
              </Label>
              <Input
                id="externalHash"
                name="externalHash"
                value={externalHash}
                onChange={(e) => setExternalHash(e.target.value)}
                placeholder="Paste hex digest…"
                className="mt-2 font-mono text-xs"
                spellCheck={false}
              />
              <p
                className={cn(
                  "mt-2 text-[11px] font-medium",
                  hashKind === "empty" && "text-muted-foreground",
                  hashKind === "MD5" && "text-accent-custody",
                  hashKind === "SHA-256" && "text-accent-evidence",
                  hashKind === "invalid" && "text-accent-integrity"
                )}
              >
                {hashKind === "empty" && "Waiting for hash or file…"}
                {hashKind === "MD5" && "Detected: valid MD5 (32 hex)"}
                {hashKind === "SHA-256" && "Detected: valid SHA-256 (64 hex)"}
                {hashKind === "invalid" &&
                  "Not a valid MD5/SHA-256 hex string yet"}
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="px-5 pb-2 sm:px-6">
            <div
              role="alert"
              className="rounded-md border border-accent-integrity/30 bg-accent-integrity/10 px-3 py-2 text-sm text-accent-integrity"
            >
              {error}
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-border/80 bg-secondary/20 px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/evidence">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={pending}
            style={{ backgroundColor: "#107C10" }}
            className="text-white shadow-[0_8px_24px_-12px_rgba(16,124,16,0.8)] hover:opacity-90"
          >
            {pending ? "Registering…" : "Register evidence"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
