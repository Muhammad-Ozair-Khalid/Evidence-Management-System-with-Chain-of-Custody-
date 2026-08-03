export type ModuleKey =
  | "dashboard"
  | "evidence"
  | "custody"
  | "integrity"
  | "reports"
  | "audit"
  | "admin";

export const MODULES: Record<
  ModuleKey,
  { label: string; accentVar: string; hex: string; onDark?: string }
> = {
  dashboard: {
    label: "Dashboard",
    accentVar: "var(--accent-dashboard)",
    hex: "#3F4A5A",
    onDark: "#7CB894",
  },
  evidence: {
    label: "Evidence",
    accentVar: "var(--accent-evidence)",
    hex: "#107C10",
  },
  custody: {
    label: "Custody",
    accentVar: "var(--accent-custody)",
    hex: "#C48A00",
  },
  integrity: {
    label: "Integrity",
    accentVar: "var(--accent-integrity)",
    hex: "#D13438",
  },
  reports: {
    label: "Reports",
    accentVar: "var(--accent-reports)",
    hex: "#8764B8",
  },
  audit: {
    label: "Audit",
    accentVar: "var(--accent-audit)",
    hex: "#00B7C3",
  },
  admin: {
    label: "Admin",
    accentVar: "var(--accent-admin)",
    hex: "#5C6B7A",
    onDark: "#8B9AA9",
  },
};

export type RoleKey = "CUSTODIAN" | "EXAMINER" | "SUPERVISOR" | "ADMIN";

export const ROLE_COLORS: Record<RoleKey, string> = {
  CUSTODIAN: "#475569", // blue-grey, AA on white
  EXAMINER: "#6B4F9A", // purple, AA on white
  SUPERVISOR: "#8A5A00", // gold darkened for AA on white
  ADMIN: "#2F3846", // dark slate
};
