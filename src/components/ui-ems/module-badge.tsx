import { MODULES, type ModuleKey } from "@/lib/modules";
import { cn } from "@/lib/utils";

interface ModuleBadgeProps {
  module: ModuleKey;
  className?: string;
}

export function ModuleBadge({ module, className }: ModuleBadgeProps) {
  const config = MODULES[module];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em]",
        className
      )}
      style={{
        backgroundColor: `${config.hex}12`,
        color: config.hex,
        borderColor: `${config.hex}33`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: config.hex }}
        aria-hidden
      />
      {config.label}
    </span>
  );
}
