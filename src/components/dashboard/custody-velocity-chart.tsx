"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type CustodyVelocityPoint = { day: string; count: number };

export function CustodyVelocityChart({ data }: { data: CustodyVelocityPoint[] }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
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
            cursor={{ fill: "#C48A00", fillOpacity: 0.15 }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--surface-foreground)",
            }}
            labelStyle={{ color: "var(--muted)" }}
            formatter={(value) => [`${String(value)} event(s)`, "Custody"]}
          />
          <Bar dataKey="count" fill="#C48A00" animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
