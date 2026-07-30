"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { EvidenceType } from "@prisma/client";
import { registerEvidence } from "@/actions/evidence";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { EVIDENCE_TYPE_LABELS } from "@/lib/evidence-labels";

export function RegisterEvidenceForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    evidenceId: string;
    id: string;
  } | null>(null);

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
      <Card className="border-accent-evidence/30 bg-accent-evidence/5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-evidence/15 text-accent-evidence">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-section-title text-canvas-foreground">
              Evidence registered
            </p>
            <p className="mt-1 text-muted-ems">
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
    <Card>
      <form onSubmit={onSubmit} className="space-y-5">
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

        <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-4">
          <div>
            <p className="text-section-title">Integrity hash</p>
            <p className="mt-1 text-muted-ems">
              Upload a digital file to compute SHA-256 server-side, or enter a
              hash from an external forensic tool for physical exhibits.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="file">Digital file (optional)</Label>
            <Input id="file" name="file" type="file" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="externalHash">
              Externally computed hash — enter exactly as generated by your
              forensic tool.
            </Label>
            <Input
              id="externalHash"
              name="externalHash"
              placeholder="64-character SHA-256 hex"
              className="font-mono text-xs"
              spellCheck={false}
            />
          </div>
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
          <Button type="button" variant="outline" asChild>
            <Link href="/evidence">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={pending}
            style={{ backgroundColor: "#107C10" }}
            className="text-white hover:opacity-90"
          >
            {pending ? "Registering…" : "Register evidence"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
