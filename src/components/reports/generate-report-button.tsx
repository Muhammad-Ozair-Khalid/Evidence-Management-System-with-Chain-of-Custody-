"use client";

import { useState, useTransition } from "react";
import { Download, FileText } from "lucide-react";
import { generateEvidenceCustodyReport } from "@/actions/reports";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

export function GenerateCustodyReportButton({
  evidenceDbId,
  evidenceLabel,
}: {
  evidenceDbId: string;
  evidenceLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateEvidenceCustodyReport(evidenceDbId);
      if (!result.ok) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "PDF generation failed",
          description: result.error,
        });
        return;
      }
      downloadBase64Pdf(result.base64, result.filename);
      toast({
        variant: "reports",
        title: "Report generated",
        description: result.filename,
      });
    });
  }

  return (
    <Card className="overflow-hidden border-accent-reports/35">
      <div className="flex flex-col gap-4 border-b border-accent-reports/15 bg-accent-reports/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-reports/20 text-accent-reports ring-1 ring-accent-reports/30">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-reports">
              LaTeX-style custody PDF
            </p>
            <p className="mt-1 text-section-title text-canvas-foreground">
              Custody report
            </p>
            <p className="mt-1 text-sm text-muted-ems">
              Title page, integrity digests, and full chain for {evidenceLabel}.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={onGenerate}
          disabled={pending}
          style={{ backgroundColor: "#8764B8" }}
          className="shrink-0 text-white shadow-[0_8px_24px_-12px_rgba(135,100,184,0.7)] hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          {pending ? "Generating…" : "Generate Custody Report (PDF)"}
        </Button>
      </div>
      {error ? (
        <p className="px-5 py-3 text-sm text-accent-integrity" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
