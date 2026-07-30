"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type IntakePoint = { month: string; count: number };

export function EvidenceIntakeChart({ data }: { data: IntakePoint[] }) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="intakeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#107C10" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#107C10" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
          />
          <Tooltip
            cursor={{ stroke: "#107C10", strokeOpacity: 0.25 }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--surface-foreground)",
            }}
            labelStyle={{ color: "var(--muted)" }}
            formatter={(value) => [`${String(value)} item(s)`, "Intake"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#107C10"
            strokeWidth={2}
            fill="url(#intakeFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
