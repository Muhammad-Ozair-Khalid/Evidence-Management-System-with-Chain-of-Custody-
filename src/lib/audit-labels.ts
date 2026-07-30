export const AUDIT_ACTION_LABELS: Record<string, string> = {
  EVIDENCE_CREATED: "Evidence Registered",
  CUSTODY_TRANSFERRED: "Custody Transferred",
  EVIDENCE_EXAMINED: "Evidence Examined",
  EVIDENCE_RETURNED: "Evidence Returned",
  HASH_MISMATCH_FLAGGED: "Hash Mismatch Flagged",
  INTEGRITY_RESOLVED: "Integrity Flag Resolved",
  INTEGRITY_KEEP_FLAGGED: "Integrity Flag Kept",
  CUSTODY_OVERRIDE: "Custody Override",
  USER_CREATED: "User Created",
  USER_ROLE_CHANGED: "User Role Changed",
  USER_DEACTIVATED: "User Deactivated",
  USER_REACTIVATED: "User Reactivated",
  USER_UPDATED: "User Updated",
  PASSWORD_CHANGED: "Password Changed",
  REPORT_GENERATED: "Report Generated",
  LOGIN_FAILED: "Login Failed",
  LOGIN_SUCCESS: "Login Success",
};

export function auditActionLabel(action: string): string {
  return (
    AUDIT_ACTION_LABELS[action] ??
    action
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ")
  );
}

export const AUDIT_ENTITY_TYPES = [
  "EvidenceItem",
  "User",
  "Auth",
  "CustodyEvent",
] as const;
