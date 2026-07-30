import { CustodyEventType } from "@prisma/client";

export const CUSTODY_EVENT_LABELS: Record<CustodyEventType, string> = {
  SEIZURE: "Seizure",
  TRANSFER: "Transfer",
  EXAMINATION: "Examination",
  RETURN: "Return",
  RE_HASH_CHECK: "Re-hash check",
};

export const CUSTODY_EVENT_COLORS: Record<
  CustodyEventType,
  { hex: string; bg: string; border: string }
> = {
  SEIZURE: { hex: "#8A5A00", bg: "#D292001A", border: "#D2920040" },
  TRANSFER: { hex: "#2F3846", bg: "#3F4A5A1A", border: "#3F4A5A40" },
  EXAMINATION: { hex: "#6B4F9A", bg: "#8764B81A", border: "#8764B840" },
  RETURN: { hex: "#0B5A0B", bg: "#107C101A", border: "#107C1040" },
  RE_HASH_CHECK: { hex: "#0A7A82", bg: "#00B7C31A", border: "#00B7C340" },
};

export const RETURN_DESTINATION_PRESETS = [
  "Evidence Locker — Room 4",
  "Returned to Owner",
  "Transferred to Court Registry",
  "Central Evidence Vault",
  "Other (specify below)",
] as const;

export const LOGABLE_EVENT_TYPES = [
  "TRANSFER",
  "EXAMINATION",
  "RETURN",
] as const satisfies readonly CustodyEventType[];
