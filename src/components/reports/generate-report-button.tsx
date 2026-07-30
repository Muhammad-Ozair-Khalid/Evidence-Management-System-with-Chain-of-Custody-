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
    <Card className="border-accent-reports/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-reports/15 text-accent-reports">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-section-title text-canvas-foreground">
              Custody report (PDF)
            </p>
            <p className="mt-1 text-muted-ems">
              Generate a formal Chain of Custody report for {evidenceLabel},
              including hashes in monospace and the full event timeline.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={onGenerate}
          disabled={pending}
          style={{ backgroundColor: "#8764B8" }}
          className="shrink-0 text-white hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          {pending ? "Generating…" : "Generate Custody Report (PDF)"}
        </Button>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-accent-integrity" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
