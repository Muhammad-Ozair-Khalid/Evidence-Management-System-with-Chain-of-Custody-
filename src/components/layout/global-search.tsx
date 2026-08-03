"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { Fingerprint, Loader2, Search, Users } from "lucide-react";
import { globalSearch, type GlobalSearchResult } from "@/actions/search";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMPTY: GlobalSearchResult = {
  evidence: [],
  users: [],
  canOpenAdmin: false,
};

export function GlobalSearch() {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult>(EMPTY);
  const [pending, startTransition] = useTransition();
  const [activeIndex, setActiveIndex] = useState(-1);

  const flatLinks = [
    ...results.evidence.map((e) => ({ href: `/evidence/${e.id}` })),
    ...(results.canOpenAdmin
      ? results.users.map(() => ({ href: "/admin/users" }))
      : []),
  ];

  const runSearch = useCallback((value: string) => {
    startTransition(async () => {
      const data = await globalSearch(value);
      setResults(data);
      setActiveIndex(-1);
    });
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(EMPTY);
      return;
    }
    const handle = setTimeout(() => runSearch(trimmed), 220);
    return () => clearTimeout(handle);
  }, [query, runSearch]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ⌘K / Ctrl+K focuses search from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hasResults = results.evidence.length > 0 || results.users.length > 0;
  const showPanel = open && query.trim().length >= 2;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!showPanel) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatLinks.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0 && flatLinks[activeIndex]) {
      e.preventDefault();
      window.location.href = flatLinks[activeIndex].href;
    }
  }

  return (
    <div ref={rootRef} className="relative w-full max-w-xs">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label="Search evidence, cases, and users"
        placeholder="Search evidence, cases…"
        className="pl-8 pr-14 focus-visible:ring-brand/30"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {pending && query.trim().length >= 2 ? (
        <Loader2
          className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden
        />
      ) : (
        <kbd
          className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-secondary px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:inline-flex"
          aria-hidden
        >
          ⌘K
        </kbd>
      )}

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="animate-rise absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-card shadow-elevated"
        >
          {!hasResults && !pending ? (
            <p className="px-3 py-5 text-center text-muted-ems">
              No matches for “{query.trim()}”.
            </p>
          ) : null}

          {results.evidence.length > 0 ? (
            <section className="border-b border-border py-2 last:border-0">
              <p className="flex items-center gap-1.5 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-accent-evidence">
                <Fingerprint className="h-3 w-3" aria-hidden />
                Evidence
              </p>
              <ul>
                {results.evidence.map((item, idx) => (
                  <li key={item.id} role="option" aria-selected={activeIndex === idx}>
                    <Link
                      href={`/evidence/${item.id}`}
                      className={cn(
                        "block border-l-2 border-transparent px-3 py-2 transition-colors hover:border-l-accent-evidence hover:bg-secondary/70 focus:bg-secondary/70 focus:outline-none",
                        activeIndex === idx &&
                          "border-l-accent-evidence bg-secondary/70"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <p className="font-mono text-xs font-semibold text-accent-evidence">
                        {item.evidenceId}
                      </p>
                      <p className="truncate text-sm text-canvas-foreground">
                        {item.title}
                      </p>
                      <p className="text-muted-ems">Case {item.caseNumber}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.users.length > 0 ? (
            <section className="py-2">
              <p className="flex items-center gap-1.5 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-accent-admin">
                <Users className="h-3 w-3" aria-hidden />
                Users
              </p>
              <ul>
                {results.users.map((user, idx) => {
                  const flatIdx = results.evidence.length + idx;
                  const content = (
                    <>
                      <p className="text-sm font-medium text-canvas-foreground">
                        {user.name}
                      </p>
                      <p className="text-muted-ems">
                        {user.email} · {user.role}
                      </p>
                    </>
                  );
                  return (
                    <li
                      key={user.id}
                      role="option"
                      aria-selected={activeIndex === flatIdx}
                    >
                      {results.canOpenAdmin ? (
                        <Link
                          href="/admin/users"
                          className={cn(
                            "block border-l-2 border-transparent px-3 py-2 transition-colors hover:border-l-accent-admin hover:bg-secondary/70 focus:bg-secondary/70 focus:outline-none",
                            activeIndex === flatIdx &&
                              "border-l-accent-admin bg-secondary/70"
                          )}
                          onClick={() => setOpen(false)}
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="px-3 py-2">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
