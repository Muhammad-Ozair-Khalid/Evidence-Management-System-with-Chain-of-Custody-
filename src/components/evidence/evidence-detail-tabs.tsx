import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui-ems/empty-state";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "custody", label: "Custody Timeline" },
  { key: "integrity", label: "Integrity" },
  { key: "reports", label: "Reports" },
] as const;

export function EvidenceDetailTabs({
  evidenceId,
  active,
}: {
  evidenceId: string;
  active: string;
}) {
  const base = `/evidence/${evidenceId}`;
  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.key === active)
  );

  return (
    <div className="relative mb-6 border-b border-border">
      <div className="flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const href =
            tab.key === "overview" ? base : `${base}?tab=${tab.key}`;
          const isActive = active === tab.key;
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                "relative z-10 inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-accent-evidence"
                  : "text-muted-foreground hover:text-canvas-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <span
        className="pointer-events-none absolute bottom-0 h-0.5 bg-accent-evidence transition-all duration-300 ease-smooth"
        style={{
          width: `${100 / TABS.length}%`,
          left: `${(activeIndex / TABS.length) * 100}%`,
          maxWidth: 140,
        }}
        aria-hidden
      />
    </div>
  );
}

export function EvidenceTabPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <EmptyState
      icon={ClipboardList}
      title={title}
      description={description}
      className="border-dashed"
      accentColor="#8764B8"
    />
  );
}
