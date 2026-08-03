"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const NODES = [
  { label: "Seizure", color: "#C48A00", x: 40, y: 120 },
  { label: "Transfer", color: "#3F4A5A", x: 150, y: 70 },
  { label: "Examine", color: "#8764B8", x: 260, y: 120 },
  { label: "Return", color: "#107C10", x: 370, y: 70 },
] as const;

/**
 * CSS / SVG isometric-style custody chain for the landing hero.
 * Pure 2.5D — no WebGL.
 */
export function HeroChain({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    function onMove(e: MouseEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--rx", `${py * -6}deg`);
      el.style.setProperty("--ry", `${px * 8}deg`);
    }
    function onLeave() {
      if (!el) return;
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    }
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "animate-chain-in relative mx-auto w-full max-w-xl [perspective:900px]",
        className
      )}
      style={
        {
          "--rx": "0deg",
          "--ry": "0deg",
        } as CSSProperties
      }
      aria-hidden
    >
      <div
        className="relative transition-transform duration-300 ease-smooth will-change-transform"
        style={{
          transform:
            "rotateX(var(--rx)) rotateY(var(--ry)) rotateX(12deg) rotateZ(-6deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Floor plane */}
        <div
          className="absolute inset-x-4 bottom-2 h-24 rounded-[40%] bg-brand/20 blur-2xl"
          style={{ transform: "translateZ(-40px)" }}
        />

        <svg
          viewBox="0 0 440 200"
          className="relative h-auto w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        >
          <defs>
            <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#107C10" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#C48A00" stopOpacity="0.8" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connecting path */}
          <path
            d="M55 120 C 100 120, 110 70, 165 70 S 230 120, 275 120 S 340 70, 385 70"
            fill="none"
            stroke="url(#linkGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 5"
            opacity="0.9"
          />

          {NODES.map((node, i) => (
            <g
              key={node.label}
              className="animate-chain-in"
              style={{ animationDelay: `${120 + i * 110}ms` }}
            >
              {/* Isometric tile — forest green */}
              <path
                d={`M${node.x} ${node.y + 28} l28 -14 28 14 -28 14 z`}
                fill="#122618"
                stroke="#1a3d28"
                strokeWidth="1"
              />
              <path
                d={`M${node.x} ${node.y + 28} l0 -22 28 -14 0 22 z`}
                fill="#0a1a12"
                stroke="#1a3d28"
                strokeWidth="1"
              />
              <path
                d={`M${node.x + 28} ${node.y - 8} l28 14 0 22 -28 -14 z`}
                fill="#163020"
                stroke="#1a3d28"
                strokeWidth="1"
              />
              <circle
                cx={node.x + 28}
                cy={node.y + 8}
                r="10"
                fill={node.color}
                filter="url(#softGlow)"
                opacity="0.95"
              />
              <circle
                cx={node.x + 28}
                cy={node.y + 8}
                r="4"
                fill="#06140c"
              />
              <text
                x={node.x + 28}
                y={node.y + 52}
                textAnchor="middle"
                fill="#9bb0a3"
                fontSize="11"
                fontFamily="var(--font-plex-sans), sans-serif"
                fontWeight="600"
              >
                {node.label}
              </text>
            </g>
          ))}

          {/* Hash badge floating */}
          <g transform="translate(175, 8)">
            <rect
              width="90"
              height="28"
              rx="6"
              fill="#107C10"
              opacity="0.95"
            />
            <text
              x="45"
              y="18"
              textAnchor="middle"
              fill="#F4F6F5"
              fontSize="10"
              fontFamily="var(--font-plex-mono), monospace"
            >
              SHA-256 ✓
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
