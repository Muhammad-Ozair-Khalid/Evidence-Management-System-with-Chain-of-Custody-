import "server-only";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { CustodyReportDocument } from "@/lib/pdf/custody-report";
import type {
  CustodyReportItem,
  CustodyReportPayload,
} from "@/lib/pdf/types";
import { EVIDENCE_STATUS_LABELS, EVIDENCE_TYPE_LABELS } from "@/lib/evidence-labels";
import { CUSTODY_EVENT_LABELS } from "@/lib/custody-labels";
import { prisma } from "@/lib/prisma";

function orgName() {
  return (
    process.env.ORGANIZATION_NAME?.trim() ||
    "NCERT Forensic Evidence Unit (letterhead placeholder)"
  );
}

export async function loadEvidenceReportItem(
  evidenceDbId: string
): Promise<CustodyReportItem | null> {
  const item = await prisma.evidenceItem.findUnique({
    where: { id: evidenceDbId },
    include: {
      submittedBy: { select: { name: true } },
      currentCustodian: { select: { name: true } },
      custodyEvents: {
        orderBy: { timestamp: "asc" },
        include: {
          handlerFrom: { select: { name: true } },
          handlerTo: { select: { name: true } },
        },
      },
    },
  });

  if (!item) return null;

  return {
    evidenceId: item.evidenceId,
    caseNumber: item.caseNumber,
    title: item.title,
    description: item.description,
    evidenceType: EVIDENCE_TYPE_LABELS[item.evidenceType],
    status: EVIDENCE_STATUS_LABELS[item.status],
    originalHash: item.originalHash,
    currentHash: item.currentHash,
    intakeDate: format(item.intakeDate, "dd MMM yyyy HH:mm"),
    intakeLocation: item.intakeLocation,
    submittedByName: item.submittedBy.name,
    currentCustodianName: item.currentCustodian?.name ?? "—",
    returnedTo: item.returnedTo,
    events: item.custodyEvents.map((e) => ({
      timestamp: format(e.timestamp, "dd MMM yyyy HH:mm"),
      eventType: CUSTODY_EVENT_LABELS[e.eventType],
      fromName: e.handlerFrom?.name ?? "—",
      toName:
        e.eventType === "RETURN"
          ? e.returnDestination ?? "Destination"
          : e.handlerTo?.name ?? "—",
      location: e.location,
      reason: e.reason,
      hashAtEvent: e.hashAtEvent,
      hashMatch: e.hashMatch,
    })),
  };
}

export async function loadCaseReportItems(
  caseNumber: string
): Promise<CustodyReportItem[]> {
  const items = await prisma.evidenceItem.findMany({
    where: { caseNumber },
    orderBy: { evidenceId: "asc" },
    select: { id: true },
  });

  const loaded: CustodyReportItem[] = [];
  for (const row of items) {
    const item = await loadEvidenceReportItem(row.id);
    if (item) loaded.push(item);
  }
  return loaded;
}

export async function renderCustodyReportPdf(
  payload: CustodyReportPayload
): Promise<Buffer> {
  const document = (
    <CustodyReportDocument data={payload} />
  ) as React.ReactElement;
  const instance = pdf(document);
  const result = await instance.toBuffer();

  if (Buffer.isBuffer(result)) {
    return result;
  }

  // Some @react-pdf versions return a Node readable stream from toBuffer().
  const stream = result as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export function buildSingleReportPayload(input: {
  item: CustodyReportItem;
  generatedByName: string;
  generatedByEmail: string;
}): CustodyReportPayload {
  return {
    organisationName: orgName(),
    generatedAt: format(new Date(), "dd MMM yyyy HH:mm:ss"),
    generatedByName: input.generatedByName,
    generatedByEmail: input.generatedByEmail,
    reportKind: "single",
    items: [input.item],
  };
}

export function buildCaseReportPayload(input: {
  caseNumber: string;
  items: CustodyReportItem[];
  generatedByName: string;
  generatedByEmail: string;
}): CustodyReportPayload {
  return {
    organisationName: orgName(),
    generatedAt: format(new Date(), "dd MMM yyyy HH:mm:ss"),
    generatedByName: input.generatedByName,
    generatedByEmail: input.generatedByEmail,
    reportKind: "case",
    caseNumber: input.caseNumber,
    items: input.items,
  };
}
