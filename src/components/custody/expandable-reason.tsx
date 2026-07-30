"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ExpandableReason({
  reason,
  max = 80,
  className,
}: {
  reason: string;
  max?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const needsTruncate = reason.length > max;

  if (!needsTruncate) {
    return <span className={cn("text-sm", className)}>{reason}</span>;
  }

  return (
    <span className={cn("text-sm", className)}>
      {open ? reason : `${reason.slice(0, max).trimEnd()}…`}{" "}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-medium text-accent-custody hover:underline"
      >
        {open ? "Show less" : "Show more"}
      </button>
    </span>
  );
}
