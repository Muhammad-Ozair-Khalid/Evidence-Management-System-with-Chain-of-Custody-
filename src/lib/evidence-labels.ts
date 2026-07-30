import { EvidenceStatus, EvidenceType } from "@prisma/client";

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  DIGITAL_MEDIA: "Digital media",
  DOCUMENT: "Document",
  DEVICE: "Device",
  IMAGE_FORENSIC: "Forensic image",
  OTHER: "Other",
};

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  REGISTERED: "Registered",
  IN_CUSTODY: "In custody",
  UNDER_EXAMINATION: "Under examination",
  RETURNED: "Returned",
  ARCHIVED: "Archived",
  INTEGRITY_FLAGGED: "Integrity flagged",
};

export const EVIDENCE_STATUS_STYLES: Record<
  EvidenceStatus,
  { bg: string; text: string; border: string }
> = {
  REGISTERED: {
    bg: "#5C6B7A1A",
    text: "#3F4A5A",
    border: "#5C6B7A40",
  },
  IN_CUSTODY: {
    bg: "#107C101A",
    text: "#0B5A0B",
    border: "#107C1040",
  },
  UNDER_EXAMINATION: {
    // Darkened from #D29200 for WCAG AA contrast on white/light canvas.
    bg: "#D292001A",
    text: "#8A5A00",
    border: "#D2920040",
  },
  RETURNED: {
    bg: "#64748B1A",
    text: "#334155",
    border: "#64748B40",
  },
  ARCHIVED: {
    bg: "#9CA3AF1A",
    text: "#4B5563",
    border: "#9CA3AF40",
  },
  INTEGRITY_FLAGGED: {
    // Darkened from #D13438 for WCAG AA contrast on white/light canvas.
    bg: "#D134381A",
    text: "#A11F22",
    border: "#D1343840",
  },
};
