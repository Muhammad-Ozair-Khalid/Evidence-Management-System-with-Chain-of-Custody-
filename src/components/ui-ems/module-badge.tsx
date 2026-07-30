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
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: `${config.hex}1A`,
        color: config.hex,
      }}
    >
      {config.label}
    </span>
  );
}
