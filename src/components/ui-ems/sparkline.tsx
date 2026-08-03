"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

export function Sparkline({
  data,
  color = "#107C10",
  className,
  width = 72,
  height = 28,
}: {
  data: number[];
  color?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const id = useId();
  const path = useMemo(() => {
    if (!data.length) return "";
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = Math.max(max - min, 1);
    const step = data.length > 1 ? width / (data.length - 1) : width;
    return data
      .map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data, width, height]);

  if (!data.length) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`${path} L${width},${height} L0,${height} Z`}
        fill={`url(#${id}-fill)`}
        opacity={0.6}
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw-line"
        style={{ strokeDasharray: 200, strokeDashoffset: 200 }}
      />
    </svg>
  );
}
