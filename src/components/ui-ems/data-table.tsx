"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { Input } from "@/components/ui/input";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  /** Optional label shown above the cell on mobile card layout. */
  mobileLabel?: string;
  /** Hide this column from the mobile card stack. */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  filterPlaceholder?: string;
  filterFn?: (row: T, query: string) => boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  className?: string;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T>({
  columns,
  data,
  getRowId,
  filterPlaceholder = "Filter…",
  filterFn,
  emptyMessage = "No results.",
  emptyTitle = "Nothing to show",
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const filtered = useMemo(() => {
    if (!query.trim() || !filterFn) return data;
    return data.filter((row) => filterFn(row, query.trim().toLowerCase()));
  }, [data, filterFn, query]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [columns, filtered, sortDir, sortKey]);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    if (sortDir === "asc") setSortDir("desc");
    else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else setSortDir("asc");
  }

  const mobileColumns = columns.filter((c) => !c.hideOnMobile);

  return (
    <div className={cn("space-y-3", className)}>
      {filterFn ? (
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={filterPlaceholder}
          className="max-w-sm"
          aria-label={filterPlaceholder}
        />
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState
          compact
          icon={SearchX}
          title={emptyTitle}
          description={emptyMessage}
        />
      ) : (
        <>
          {/* Mobile card stack */}
          <ul className="space-y-3 md:hidden">
            {sorted.map((row) => (
              <li
                key={getRowId(row)}
                className="rounded-lg border border-border bg-card p-4 shadow-card"
              >
                <dl className="space-y-2.5">
                  {mobileColumns.map((col) => (
                    <div
                      key={col.key}
                      className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {col.mobileLabel ?? col.header}
                      </dt>
                      <dd className="min-w-0 text-sm sm:text-right">
                        {col.cell(row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>

          {/* Desktop / tablet table with horizontal scroll */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-secondary/60">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        scope="col"
                        className={cn(
                          "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                          col.className
                        )}
                      >
                        {col.sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(col.key)}
                            className="inline-flex items-center gap-1 hover:text-canvas-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`Sort by ${col.header}`}
                          >
                            {col.header}
                            {sortKey === col.key && sortDir === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                            ) : sortKey === col.key && sortDir === "desc" ? (
                              <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                            ) : (
                              <ArrowUpDown
                                className="h-3.5 w-3.5 opacity-50"
                                aria-hidden
                              />
                            )}
                          </button>
                        ) : (
                          col.header
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => (
                    <tr
                      key={getRowId(row)}
                      className="border-b border-border last:border-0 hover:bg-secondary/40"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            "px-4 py-3 align-middle",
                            col.className
                          )}
                        >
                          {col.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
