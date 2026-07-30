import { type Role } from "@prisma/client";
import { ROLE_COLORS, type RoleKey } from "@/lib/modules";
import { cn } from "@/lib/utils";

export function RoleBadge({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  const color = ROLE_COLORS[role as RoleKey] ?? ROLE_COLORS.CUSTODIAN;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
        className
      )}
      style={{
        backgroundColor: `${color}1A`,
        color,
        borderColor: `${color}40`,
      }}
    >
      {role}
    </span>
  );
}
