"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_TYPES,
  auditActionLabel,
} from "@/lib/audit-labels";

type ActorOption = { id: string; name: string; role: string };

export function AuditFilters({ actors }: { actors: ActorOption[] }) {
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

  const knownActions = Object.keys(AUDIT_ACTION_LABELS);

  return (
    <div className="mb-4 grid gap-3 rounded-lg border border-border bg-card p-4 shadow-card md:grid-cols-2 xl:grid-cols-6">
      <div className="space-y-1.5 xl:col-span-2">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          placeholder="Actor name or entity ID"
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
        <Label htmlFor="action">Action</Label>
        <select
          id="action"
          className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
          value={searchParams.get("action") ?? ""}
          onChange={(e) => update("action", e.target.value)}
        >
          <option value="">All actions</option>
          {knownActions.map((a) => (
            <option key={a} value={a}>
              {auditActionLabel(a)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="actor">Actor</Label>
        <select
          id="actor"
          className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
          value={searchParams.get("actor") ?? ""}
          onChange={(e) => update("actor", e.target.value)}
        >
          <option value="">All actors</option>
          {actors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.role})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="entityType">Entity type</Label>
        <select
          id="entityType"
          className="flex h-9 w-full rounded-md border border-input bg-surface px-3 text-sm"
          value={searchParams.get("entityType") ?? ""}
          onChange={(e) => update("entityType", e.target.value)}
        >
          <option value="">All entities</option>
          {AUDIT_ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 xl:col-span-6 md:col-span-2">
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
      </div>

      <div className="xl:col-span-6">
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
