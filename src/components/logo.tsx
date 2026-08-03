import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  size?: number;
}

/** Geometric shield + hash mark for EMS (NCERT brand green). */
export function LogoMark({ className, size = 32 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M16 2.5L27 7.5V15.2C27 21.4 22.6 27.1 16 29.5C9.4 27.1 5 21.4 5 15.2V7.5L16 2.5Z"
        fill="#0B5C2E"
      />
      <path
        d="M16 5.2L24.2 8.9V15.2C24.2 19.9 20.9 24.3 16 26.3C11.1 24.3 7.8 19.9 7.8 15.2V8.9L16 5.2Z"
        fill="#0B0E14"
        fillOpacity="0.28"
      />
      <path
        d="M11.2 16.2H20.8M11.2 13.4H20.8M13.5 11.5V21M18.5 11.5V21"
        stroke="#F4F6F5"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16.2" r="1.4" fill="#C48A00" />
    </svg>
  );
}

export function LogoWordmark({
  collapsed = false,
  light = false,
  sequenced = false,
}: {
  collapsed?: boolean;
  light?: boolean;
  /** Staggered mark → word → tagline entrance for marketing surfaces */
  sequenced?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 overflow-hidden",
        sequenced && "logo-sequence"
      )}
    >
      <span className={cn(sequenced && "logo-seq-mark inline-flex")}>
        <LogoMark size={28} />
      </span>
      {!collapsed ? (
        <div className="min-w-0 leading-tight">
          <p
            className={cn(
              "truncate font-display text-sm font-bold tracking-tight",
              light ? "text-canvas-foreground" : "text-white",
              sequenced && "logo-seq-word"
            )}
          >
            EMS
          </p>
          <p
            className={cn(
              "truncate text-[11px]",
              light ? "text-muted-foreground" : "text-sidebar-muted",
              sequenced && "logo-seq-tag"
            )}
          >
            Chain of Custody
          </p>
        </div>
      ) : null}
    </div>
  );
}
