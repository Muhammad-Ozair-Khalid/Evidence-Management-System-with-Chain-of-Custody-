"use client";

import { FormEvent, useState, useTransition } from "react";
import { Download } from "lucide-react";
import { generateCaseCustodyReport } from "@/actions/reports";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function downloadBase64Pdf(base64: string, filename: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function BulkCaseReportForm({
  caseNumbers,
}: {
  caseNumbers: string[];
}) {
  const [caseNumber, setCaseNumber] = useState(caseNumbers[0] ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await generateCaseCustodyReport(caseNumber);
      if (!result.ok) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Case report failed",
          description: result.error,
        });
        return;
      }
      downloadBase64Pdf(result.base64, result.filename);
      toast({
        variant: "reports",
        title: "Case report generated",
        description: result.filename,
      });
    });
  }

  return (
    <Card className="overflow-hidden border-accent-reports/30">
      <form onSubmit={onSubmit}>
        <div className="border-b border-accent-reports/20 bg-accent-reports/[0.07] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-reports">
            Court-ready PDF
          </p>
          <p className="mt-1 text-section-title text-canvas-foreground">
            Bulk generate — case report
          </p>
          <p className="mt-1.5 text-sm text-muted-ems">
            One LaTeX-style PDF with a shared title page and concatenated custody
            sections for every exhibit on the case.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="caseNumber">Case number</Label>
              {caseNumbers.length > 0 ? (
                <select
                  id="caseNumber"
                  className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                >
                  {caseNumbers.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="caseNumber"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  placeholder="e.g. FIR-2026-118"
                  required
                />
              )}
            </div>
            <Button
              type="submit"
              disabled={pending || !caseNumber.trim()}
              style={{ backgroundColor: "#8764B8" }}
              className="text-white shadow-[0_8px_24px_-12px_rgba(135,100,184,0.7)] hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              {pending ? "Generating…" : "Generate case PDF"}
            </Button>
          </div>

          {error ? (
            <p className="text-sm text-accent-integrity" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
