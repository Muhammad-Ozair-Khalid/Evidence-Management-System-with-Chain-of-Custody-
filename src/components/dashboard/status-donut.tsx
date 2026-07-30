"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { type EvidenceStatus } from "@prisma/client";
import {
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUS_STYLES,
} from "@/lib/evidence-labels";

export type StatusSlice = { status: EvidenceStatus; count: number };

export function StatusDonut({ data }: { data: StatusSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <p className="flex h-[200px] items-center justify-center text-center text-muted-ems">
        No evidence registered yet.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    name: EVIDENCE_STATUS_LABELS[d.status],
    value: d.count,
    color: EVIDENCE_STATUS_STYLES[d.status].text,
  }));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--surface-foreground)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-canvas-foreground">
            {total}
          </span>
          <span className="text-muted-ems">items</span>
        </div>
      </div>

      <ul className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
        {chartData.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: entry.color }}
              aria-hidden
            />
            <span className="truncate text-canvas-foreground">{entry.name}</span>
            <span className="ml-auto font-medium text-muted-foreground">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
