"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CustodyEventType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CUSTODY_EVENT_LABELS } from "@/lib/custody-labels";

type Option = { id: string; name: string };
type EvidenceOption = { id: string; evidenceId: string; title: string };

export function CustodyFeedFilters({
  handlers,
  evidenceItems,
}: {
  handlers: Option[];
  evidenceItems: EvidenceOption[];
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
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="mb-4 grid gap-3 rounded-lg border border-border bg-card p-4 shadow-card md:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-1.5">
        <Label htmlFor="eventType">Event type</Label>
        <select
          id="eventType"
          className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
          value={searchParams.get("eventType") ?? ""}
          onChange={(e) => update("eventType", e.target.value)}
        >
          <option value="">All types</option>
          {(Object.keys(CUSTODY_EVENT_LABELS) as CustodyEventType[]).map(
            (t) => (
              <option key={t} value={t}>
                {CUSTODY_EVENT_LABELS[t]}
              </option>
            )
          )}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="handler">Handler</Label>
        <select
          id="handler"
          className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
          value={searchParams.get("handler") ?? ""}
          onChange={(e) => update("handler", e.target.value)}
        >
          <option value="">All handlers</option>
          {handlers.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="evidence">Evidence item</Label>
        <select
          id="evidence"
          className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
          value={searchParams.get("evidence") ?? ""}
          onChange={(e) => update("evidence", e.target.value)}
        >
          <option value="">All items</option>
          {evidenceItems.map((e) => (
            <option key={e.id} value={e.id}>
              {e.evidenceId} — {e.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          type="date"
          value={searchParams.get("from") ?? ""}
          onChange={(e) => update("from", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          type="date"
          value={searchParams.get("to") ?? ""}
          onChange={(e) => update("to", e.target.value)}
        />
      </div>

      <div className="xl:col-span-5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => router.push(pathname))}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
