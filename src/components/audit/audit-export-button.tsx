"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { exportAuditCsv } from "@/actions/audit";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function AuditExportButton() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onExport() {
    setError(null);
    const filters = {
      q: searchParams.get("q") ?? undefined,
      action: searchParams.get("action") ?? undefined,
      actorId: searchParams.get("actor") ?? undefined,
      entityType: searchParams.get("entityType") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    };

    startTransition(async () => {
      const result = await exportAuditCsv(filters);
      if (!result.ok) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Export failed",
          description: result.error,
        });
        return;
      }
      const blob = new Blob([result.csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        variant: "audit",
        title: "Audit CSV exported",
        description: result.filename,
      });
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        onClick={onExport}
        disabled={pending}
        className="border-accent-audit/40 text-accent-audit hover:bg-accent-audit/10"
      >
        <Download className="h-4 w-4" />
        {pending ? "Exporting…" : "Export CSV"}
      </Button>
      {error ? (
        <p className="text-xs text-accent-integrity">{error}</p>
      ) : null}
    </div>
  );
}
