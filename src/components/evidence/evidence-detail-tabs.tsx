import Link from "next/link";
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

  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
      {TABS.map((tab) => {
        const href =
          tab.key === "overview" ? base : `${base}?tab=${tab.key}`;
        const isActive = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              "relative -mb-px inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-b-2 border-accent-evidence text-accent-evidence"
                : "text-muted-foreground hover:text-canvas-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
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
    <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center shadow-card">
      <p className="text-section-title text-canvas-foreground">{title}</p>
      <p className="mt-2 text-muted-ems">{description}</p>
    </div>
  );
}
