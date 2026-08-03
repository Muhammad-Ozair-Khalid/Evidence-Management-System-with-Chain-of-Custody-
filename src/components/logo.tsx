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

const LETTERS = ["E", "M", "S"] as const;

export function LogoWordmark({
  collapsed = false,
  light = false,
  sequenced = false,
  variant = "nav",
}: {
  collapsed?: boolean;
  light?: boolean;
  /** Staggered mark → word → tagline entrance for marketing surfaces */
  sequenced?: boolean;
  /** `hero` = large display lockup for the landing first viewport */
  variant?: "nav" | "hero";
}) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "flex overflow-hidden",
        isHero ? "items-start gap-4 sm:gap-5" : "items-center gap-2.5",
        sequenced && (isHero ? "logo-sequence logo-sequence--hero" : "logo-sequence")
      )}
    >
      <span
        className={cn(
          "relative inline-flex",
          sequenced && "logo-seq-mark",
          isHero && "logo-seq-mark-glow"
        )}
      >
        <LogoMark size={isHero ? 56 : 28} />
      </span>
      {!collapsed ? (
        <div className={cn("min-w-0 leading-tight", isHero && "pt-1")}>
          <span
            className={cn(
              "flex font-display font-extrabold tracking-tight",
              isHero
                ? "text-5xl sm:text-6xl lg:text-[4.25rem] leading-[0.92]"
                : "truncate text-sm font-bold",
              light ? "text-canvas-foreground" : "text-white"
            )}
            aria-hidden={isHero ? true : undefined}
          >
            {isHero || sequenced
              ? LETTERS.map((letter, i) => (
                  <span
                    key={letter}
                    className={cn(
                      "inline-block",
                      sequenced && "logo-seq-letter",
                      isHero && "logo-seq-letter--hero"
                    )}
                    style={
                      sequenced
                        ? { animationDelay: `${(isHero ? 90 : 100) + i * 70}ms` }
                        : undefined
                    }
                  >
                    {letter}
                  </span>
                ))
              : "EMS"}
          </span>
          <span
            className={cn(
              "block truncate",
              isHero
                ? "mt-2 text-sm tracking-[0.14em] uppercase sm:text-[15px]"
                : "text-[11px]",
              light
                ? "text-muted-foreground"
                : isHero
                  ? "text-[#9AA3AD]"
                  : "text-sidebar-muted",
              sequenced && "logo-seq-tag",
              isHero && sequenced && "logo-seq-tag--hero"
            )}
            aria-hidden={isHero ? true : undefined}
          >
            Chain of Custody
          </span>
          {isHero ? (
            <span
              className={cn(
                "mt-3 block h-px w-16 origin-left bg-gradient-to-r from-brand-soft to-transparent",
                sequenced && "logo-seq-rail"
              )}
              aria-hidden
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
