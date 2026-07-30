"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
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
}: {
  custodians: CustodianOption[];
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

  return (
    <div className="mb-4 grid gap-3 rounded-lg border border-border bg-card p-4 shadow-card md:grid-cols-2 xl:grid-cols-6">
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

      <div className="flex items-end xl:col-span-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearAll}
          disabled={pending}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
