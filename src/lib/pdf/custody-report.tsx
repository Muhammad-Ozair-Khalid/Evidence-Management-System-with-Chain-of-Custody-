/**
 * LaTeX / Overleaf–inspired Chain of Custody report.
 * Serif body (Times), monospace hashes (Courier), booktabs rules,
 * numbered sections, classical academic margins — not a marketing PDF.
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CustodyReportItem, CustodyReportPayload } from "@/lib/pdf/types";

const C = {
  ink: "#111111",
  body: "#1a1a1a",
  muted: "#444444",
  rule: "#000000",
  soft: "#666666",
  pass: "#006400",
  fail: "#8B0000",
  pending: "#555555",
  paper: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 88,
    paddingHorizontal: 64,
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: C.body,
    lineHeight: 1.35,
  },

  /* ---- Title block (article-like) ---- */
  orgLine: {
    fontSize: 9,
    fontFamily: "Times-Italic",
    color: C.muted,
    textAlign: "center",
    marginBottom: 6,
  },
  mainTitle: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    color: C.ink,
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Times-Roman",
    color: C.muted,
    textAlign: "center",
    marginBottom: 10,
  },
  thickRule: {
    borderBottomWidth: 1.5,
    borderBottomColor: C.rule,
    marginBottom: 2,
  },
  thinRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    marginBottom: 12,
  },

  metaBlock: {
    marginBottom: 14,
  },
  metaLine: {
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: C.body,
    marginBottom: 2,
  },
  metaLabel: {
    fontFamily: "Times-Bold",
  },

  /* ---- Numbered sections ---- */
  section: {
    marginTop: 12,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: C.ink,
    marginBottom: 6,
  },

  /* ---- Description list / summary ---- */
  summaryTable: {
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  summaryLabel: {
    width: "30%",
    fontSize: 9,
    fontFamily: "Times-Bold",
    color: C.ink,
  },
  summaryValue: {
    width: "70%",
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: C.body,
  },
  mono: {
    fontFamily: "Courier",
    fontSize: 7.5,
    color: C.ink,
  },
  hashBox: {
    borderWidth: 0.5,
    borderColor: C.rule,
    paddingVertical: 3,
    paddingHorizontal: 4,
    marginTop: 1,
    backgroundColor: "#FAFAFA",
  },

  /* ---- Booktabs-style table ---- */
  tableTop: {
    borderTopWidth: 1.25,
    borderTopColor: C.rule,
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: C.rule,
    paddingVertical: 4,
    paddingHorizontal: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.25,
    borderBottomColor: "#AAAAAA",
    paddingVertical: 3.5,
    paddingHorizontal: 1,
  },
  tableBottom: {
    borderBottomWidth: 1.25,
    borderBottomColor: C.rule,
  },
  th: {
    fontSize: 7.5,
    fontFamily: "Times-Bold",
    color: C.ink,
  },
  td: {
    fontSize: 7.5,
    fontFamily: "Times-Roman",
    color: C.body,
  },
  colTime: { width: "13%" },
  colType: { width: "12%" },
  colHandlers: { width: "18%" },
  colLoc: { width: "13%" },
  colReason: { width: "18%" },
  colHash: { width: "18%" },
  colResult: { width: "8%" },

  /* ---- Abstract / note ---- */
  abstract: {
    marginTop: 8,
    marginBottom: 10,
    paddingVertical: 6,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: C.rule,
  },
  abstractLabel: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    marginBottom: 3,
  },
  abstractBody: {
    fontSize: 8.5,
    fontFamily: "Times-Italic",
    color: C.muted,
    textAlign: "justify",
  },

  /* ---- TOC (case reports) ---- */
  tocItem: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    marginBottom: 4,
  },

  /* ---- Signature block ---- */
  sigSection: {
    marginTop: 28,
  },
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sigBlock: {
    width: "30%",
  },
  sigLine: {
    borderBottomWidth: 0.75,
    borderBottomColor: C.rule,
    marginTop: 22,
    marginBottom: 3,
  },
  sigLabel: {
    fontSize: 8,
    fontFamily: "Times-Roman",
    color: C.muted,
  },

  /* ---- Footer ---- */
  footer: {
    position: "absolute",
    bottom: 36,
    left: 64,
    right: 64,
  },
  footerRule: {
    borderTopWidth: 0.5,
    borderTopColor: C.rule,
    marginBottom: 4,
  },
  footerNote: {
    fontSize: 7,
    fontFamily: "Times-Italic",
    color: C.soft,
    textAlign: "justify",
  },
  pageNumber: {
    position: "absolute",
    bottom: 22,
    left: 64,
    right: 64,
    fontSize: 8,
    fontFamily: "Times-Roman",
    color: C.muted,
    textAlign: "center",
  },

  itemHeading: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: C.ink,
    marginBottom: 8,
    marginTop: 4,
  },
});

function integrityLabel(match: boolean | null): string {
  if (match === true) return "PASS";
  if (match === false) return "FAIL";
  return "—";
}

function integrityColor(match: boolean | null): string {
  if (match === true) return C.pass;
  if (match === false) return C.fail;
  return C.pending;
}

function TitleBlock({
  organisationName,
  title,
  subtitle,
}: {
  organisationName: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View>
      <Text style={styles.orgLine}>{organisationName}</Text>
      <Text style={styles.mainTitle}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.thickRule} />
      <View style={styles.thinRule} />
    </View>
  );
}

function EvidenceSummary({
  item,
  sectionNumber,
}: {
  item: CustodyReportItem;
  sectionNumber: string;
}) {
  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Evidence ID", value: item.evidenceId },
    { label: "Case number", value: item.caseNumber },
    { label: "Title", value: item.title },
    { label: "Type", value: item.evidenceType },
    { label: "Status", value: item.status },
    { label: "Intake date", value: item.intakeDate },
    { label: "Intake location", value: item.intakeLocation },
    { label: "Submitting examiner", value: item.submittedByName },
    {
      label: "Current custodian",
      value: item.returnedTo
        ? `${item.currentCustodianName} (returned to: ${item.returnedTo})`
        : item.currentCustodianName,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {sectionNumber} Evidence summary
      </Text>
      <View style={styles.summaryTable}>
        {rows.map((row) => (
          <View key={row.label} style={styles.summaryRow} wrap={false}>
            <Text style={styles.summaryLabel}>{row.label}</Text>
            <Text style={styles.summaryValue}>{row.value}</Text>
          </View>
        ))}
        <View style={[styles.summaryRow, { marginTop: 4 }]} wrap={false}>
          <Text style={styles.summaryLabel}>Original hash (SHA-256)</Text>
          <View style={{ width: "70%" }}>
            <View style={styles.hashBox}>
              <Text style={styles.mono}>{item.originalHash}</Text>
            </View>
          </View>
        </View>
        <View style={styles.summaryRow} wrap={false}>
          <Text style={styles.summaryLabel}>Current hash (SHA-256)</Text>
          <View style={{ width: "70%" }}>
            <View style={styles.hashBox}>
              <Text style={styles.mono}>{item.currentHash}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function CustodyTable({
  item,
  sectionNumber,
}: {
  item: CustodyReportItem;
  sectionNumber: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {sectionNumber} Chain of custody timeline
      </Text>
      <View style={styles.tableTop}>
        <View style={styles.tableHeader} wrap={false}>
          <Text style={[styles.th, styles.colTime]}>Timestamp</Text>
          <Text style={[styles.th, styles.colType]}>Event</Text>
          <Text style={[styles.th, styles.colHandlers]}>From → To</Text>
          <Text style={[styles.th, styles.colLoc]}>Location</Text>
          <Text style={[styles.th, styles.colReason]}>Reason</Text>
          <Text style={[styles.th, styles.colHash]}>Hash at event</Text>
          <Text style={[styles.th, styles.colResult]}>Result</Text>
        </View>
        {item.events.length === 0 ? (
          <Text
            style={{
              fontFamily: "Times-Italic",
              color: C.muted,
              fontSize: 9,
              marginVertical: 6,
            }}
          >
            No custody events recorded.
          </Text>
        ) : (
          item.events.map((ev, idx) => (
            <View
              key={`${item.evidenceId}-${idx}`}
              style={[
                styles.tableRow,
                idx === item.events.length - 1 ? styles.tableBottom : {},
              ]}
              wrap={false}
            >
              <Text style={[styles.td, styles.colTime]}>{ev.timestamp}</Text>
              <Text style={[styles.td, styles.colType]}>{ev.eventType}</Text>
              <Text style={[styles.td, styles.colHandlers]}>
                {ev.fromName} → {ev.toName}
              </Text>
              <Text style={[styles.td, styles.colLoc]}>{ev.location}</Text>
              <Text style={[styles.td, styles.colReason]}>{ev.reason}</Text>
              <Text style={[styles.td, styles.colHash, styles.mono]}>
                {ev.hashAtEvent}
              </Text>
              <Text
                style={[
                  styles.td,
                  styles.colResult,
                  {
                    color: integrityColor(ev.hashMatch),
                    fontFamily: "Times-Bold",
                  },
                ]}
              >
                {integrityLabel(ev.hashMatch)}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function SignatureBlock() {
  return (
    <View style={styles.sigSection} wrap={false}>
      <Text style={styles.sectionTitle}>3. Sign-off</Text>
      <Text
        style={{
          fontSize: 8.5,
          fontFamily: "Times-Italic",
          color: C.muted,
          marginBottom: 4,
        }}
      >
        Wet-ink signatures for physical confirmation of this system-generated
        record.
      </Text>
      <View style={styles.sigRow}>
        <View style={styles.sigBlock}>
          <View style={styles.sigLine} />
          <Text style={styles.sigLabel}>Prepared by</Text>
        </View>
        <View style={styles.sigBlock}>
          <View style={styles.sigLine} />
          <Text style={styles.sigLabel}>Reviewed by</Text>
        </View>
        <View style={styles.sigBlock}>
          <View style={styles.sigLine} />
          <Text style={styles.sigLabel}>Date</Text>
        </View>
      </View>
    </View>
  );
}

function PageChrome({ generatedAt }: { generatedAt: string }) {
  return (
    <>
      <View style={styles.footer} fixed>
        <View style={styles.footerRule} />
        <Text style={styles.footerNote}>
          System-generated Chain of Custody report reflecting the EMS append-only
          audit trail as of {generatedAt}. Cryptographic hashes are rendered in
          monospace for unambiguous comparison with external forensic tools. This
          document does not replace physical exhibit seals or institutional
          wet-ink custody forms.
        </Text>
      </View>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `— ${pageNumber} of ${totalPages} —`
        }
        fixed
      />
    </>
  );
}

function ItemBody({
  item,
  showExhibitHeading,
}: {
  item: CustodyReportItem;
  showExhibitHeading: boolean;
}) {
  return (
    <View>
      {showExhibitHeading ? (
        <Text style={styles.itemHeading}>
          Exhibit {item.evidenceId} — {item.title}
        </Text>
      ) : null}
      <EvidenceSummary item={item} sectionNumber="1." />
      <CustodyTable item={item} sectionNumber="2." />
      <SignatureBlock />
    </View>
  );
}

export function CustodyReportDocument({ data }: { data: CustodyReportPayload }) {
  const isCase = data.reportKind === "case";

  return (
    <Document
      title={
        isCase
          ? `Case Custody Report — ${data.caseNumber}`
          : `Custody Report — ${data.items[0]?.evidenceId ?? "EMS"}`
      }
      author={data.generatedByName}
      subject="Chain of Custody Report"
      creator="EMS · Chain of Custody"
    >
      {isCase ? (
        <Page size="A4" style={styles.page}>
          <TitleBlock
            organisationName={data.organisationName}
            title="Combined Case Custody Report"
            subtitle={`Case ${data.caseNumber}`}
          />
          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Generated: </Text>
              {data.generatedAt}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Author: </Text>
              {data.generatedByName} ({data.generatedByEmail})
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Exhibits included: </Text>
              {data.items.length}
            </Text>
          </View>
          <View style={styles.abstract}>
            <Text style={styles.abstractLabel}>Abstract.</Text>
            <Text style={styles.abstractBody}>
              This document concatenates the chain-of-custody records for every
              evidence item registered under case {data.caseNumber}. Each
              subsequent page presents one exhibit in the style of a formal
              forensic custody ledger, with SHA-256 digests suitable for
              independent verification.
            </Text>
          </View>
          <Text style={styles.sectionTitle}>Contents</Text>
          {data.items.map((item, i) => (
            <Text key={item.evidenceId} style={styles.tocItem}>
              {i + 1}. {item.evidenceId} — {item.title} ({item.status})
            </Text>
          ))}
          <PageChrome generatedAt={data.generatedAt} />
        </Page>
      ) : null}

      {data.items.map((item) => (
        <Page key={item.evidenceId} size="A4" style={styles.page} wrap>
          <TitleBlock
            organisationName={data.organisationName}
            title="Chain of Custody Report"
            subtitle={isCase ? undefined : item.evidenceId}
          />
          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Generated: </Text>
              {data.generatedAt}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Author: </Text>
              {data.generatedByName} ({data.generatedByEmail})
            </Text>
            {!isCase ? (
              <Text style={styles.metaLine}>
                <Text style={styles.metaLabel}>Case: </Text>
                {item.caseNumber}
              </Text>
            ) : null}
          </View>
          <ItemBody item={item} showExhibitHeading={isCase} />
          <PageChrome generatedAt={data.generatedAt} />
        </Page>
      ))}
    </Document>
  );
}
