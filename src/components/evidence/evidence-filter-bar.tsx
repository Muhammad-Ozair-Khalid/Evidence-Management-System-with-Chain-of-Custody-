"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { X } from "lucide-react";
import { EvidenceStatus, EvidenceType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_TYPE_LABELS,
} from "@/lib/evidence-labels";

type CustodianOption = { id: string; name: string };

export function EvidenceFilterBar({
  custodians,
  resultCount,
}: {
  custodians: CustodianOption[];
  resultCount?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  function clearAll() {
    startTransition(() => router.push(pathname));
  }

  const chips: { key: string; label: string }[] = [];
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const custodian = searchParams.get("custodian");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (q) chips.push({ key: "q", label: `Search: ${q}` });
  if (status && status in EVIDENCE_STATUS_LABELS) {
    chips.push({
      key: "status",
      label: EVIDENCE_STATUS_LABELS[status as EvidenceStatus],
    });
  }
  if (type && type in EVIDENCE_TYPE_LABELS) {
    chips.push({
      key: "type",
      label: EVIDENCE_TYPE_LABELS[type as EvidenceType],
    });
  }
  if (custodian) {
    const name = custodians.find((c) => c.id === custodian)?.name ?? "Custodian";
    chips.push({ key: "custodian", label: name });
  }
  if (from) chips.push({ key: "from", label: `From ${from}` });
  if (to) chips.push({ key: "to", label: `To ${to}` });

  return (
    <div className="mb-4 space-y-3">
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-card md:grid-cols-2 xl:grid-cols-6">
        <div className="space-y-1.5 xl:col-span-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            placeholder="Evidence ID, case #, or title"
            defaultValue={searchParams.get("q") ?? ""}
            onBlur={(e) => update("q", e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                update("q", (e.target as HTMLInputElement).value.trim());
              }
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
            value={searchParams.get("status") ?? ""}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="">All statuses</option>
            {(Object.keys(EVIDENCE_STATUS_LABELS) as EvidenceStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {EVIDENCE_STATUS_LABELS[s]}
                </option>
              )
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
            value={searchParams.get("type") ?? ""}
            onChange={(e) => update("type", e.target.value)}
          >
            <option value="">All types</option>
            {(Object.keys(EVIDENCE_TYPE_LABELS) as EvidenceType[]).map((t) => (
              <option key={t} value={t}>
                {EVIDENCE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="custodian">Custodian</Label>
          <select
            id="custodian"
            className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
            value={searchParams.get("custodian") ?? ""}
            onChange={(e) => update("custodian", e.target.value)}
          >
            <option value="">All custodians</option>
            {custodians.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 xl:col-span-6 md:col-span-2">
          <div className="space-y-1.5">
            <Label htmlFor="from">Intake from</Label>
            <Input
              id="from"
              type="date"
              value={searchParams.get("from") ?? ""}
              onChange={(e) => update("from", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">Intake to</Label>
            <Input
              id="to"
              type="date"
              value={searchParams.get("to") ?? ""}
              onChange={(e) => update("to", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {typeof resultCount === "number" ? (
          <p className="text-muted-ems">
            <span className="font-semibold text-canvas-foreground">
              {resultCount}
            </span>{" "}
            {resultCount === 1 ? "exhibit" : "exhibits"}
          </p>
        ) : null}
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => update(chip.key, "")}
            className="inline-flex items-center gap-1 rounded-full border border-accent-evidence/30 bg-accent-evidence/10 px-2.5 py-1 text-xs font-medium text-accent-evidence transition-colors hover:bg-accent-evidence/20"
          >
            {chip.label}
            <X className="h-3 w-3" aria-hidden />
          </button>
        ))}
        {chips.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={pending}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        ) : null}
      </div>
    </div>
  );
}
