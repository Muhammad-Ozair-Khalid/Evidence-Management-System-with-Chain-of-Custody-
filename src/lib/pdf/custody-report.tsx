/**
 * Overleaf / LaTeX article–style Chain of Custody report.
 * Dedicated titlepage (HRules, small-caps org, darkgreen accents),
 * numbered sections, booktabs tables, Times + Courier — court-ready.
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle,
} from "@react-pdf/renderer";
import type { CustodyReportItem, CustodyReportPayload } from "@/lib/pdf/types";

/** darkgreen ≈ rgb(0.0, 0.4, 0.0) from the Overleaf template */
const C = {
  ink: "#111111",
  body: "#1a1a1a",
  muted: "#444444",
  soft: "#666666",
  rule: "#000000",
  darkgreen: "#006600",
  pass: "#006600",
  fail: "#8B0000",
  pending: "#555555",
  paper: "#ffffff",
  hashBg: "#F7F9F7",
};

/** A4 ≈ top 3cm / bottom 2cm / left-right 2cm */
const M = {
  top: 85,
  bottom: 72,
  x: 56,
};

const styles = StyleSheet.create({
  /* ---- Title page ---- */
  titlePage: {
    paddingTop: M.top,
    paddingBottom: M.bottom + 16,
    paddingHorizontal: M.x,
    fontFamily: "Times-Roman",
    color: C.body,
    alignItems: "center",
    flexDirection: "column",
  },
  tpOrg: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    color: C.darkgreen,
    textAlign: "center",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  tpSubject: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: C.ink,
    textAlign: "center",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  tpCourse: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: C.muted,
    textAlign: "center",
    marginBottom: 22,
  },
  hRuleThick: {
    alignSelf: "stretch",
    borderBottomWidth: 1.75,
    borderBottomColor: C.rule,
    marginBottom: 3,
  },
  hRuleThin: {
    alignSelf: "stretch",
    borderBottomWidth: 0.6,
    borderBottomColor: C.rule,
    marginBottom: 22,
  },
  tpMainTitle: {
    fontSize: 22,
    fontFamily: "Times-Bold",
    color: C.ink,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 1.25,
  },
  tpEmph: {
    fontSize: 11,
    fontFamily: "Times-Italic",
    color: C.muted,
    textAlign: "center",
    marginBottom: 28,
  },
  tpAuthorsLabel: {
    fontSize: 10,
    fontFamily: "Times-Italic",
    color: C.muted,
    textAlign: "center",
    marginBottom: 4,
  },
  tpAuthor: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: C.ink,
    textAlign: "center",
    marginBottom: 2,
  },
  tpAuthorEmail: {
    fontSize: 9,
    fontFamily: "Courier",
    color: C.muted,
    textAlign: "center",
    marginBottom: 18,
  },
  tpDate: {
    fontSize: 11,
    fontFamily: "Times-Roman",
    color: C.body,
    textAlign: "center",
    marginBottom: 36,
  },
  tpFill: {
    flexGrow: 1,
  },
  tpBrand: {
    fontSize: 8,
    fontFamily: "Times-Italic",
    color: C.soft,
    textAlign: "center",
    marginTop: 12,
  },
  shieldWrap: {
    marginTop: 8,
    marginBottom: 4,
    alignItems: "center",
  },

  /* ---- Content pages ---- */
  page: {
    paddingTop: M.top - 12,
    paddingBottom: M.bottom + 16,
    paddingHorizontal: M.x,
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: C.body,
    lineHeight: 1.4,
  },
  runningHead: {
    fontSize: 8,
    fontFamily: "Times-Italic",
    color: C.soft,
    textAlign: "center",
    marginBottom: 6,
  },
  runningRule: {
    borderBottomWidth: 0.75,
    borderBottomColor: C.darkgreen,
    marginBottom: 14,
  },

  section: {
    marginTop: 14,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: C.darkgreen,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  sectionRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.darkgreen,
    marginBottom: 8,
    marginTop: -4,
    width: "40%",
  },

  summaryRow: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "flex-start",
  },
  summaryLabel: {
    width: "32%",
    fontSize: 9.5,
    fontFamily: "Times-Bold",
    color: C.ink,
  },
  summaryValue: {
    width: "68%",
    fontSize: 9.5,
    fontFamily: "Times-Roman",
    color: C.body,
  },

  hashLabel: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    color: C.ink,
    marginBottom: 3,
    marginTop: 6,
  },
  hashBox: {
    borderWidth: 0.75,
    borderColor: C.darkgreen,
    backgroundColor: C.hashBg,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  mono: {
    fontFamily: "Courier",
    fontSize: 7.5,
    color: C.ink,
  },
  integrityBanner: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 0.75,
    borderColor: C.rule,
  },
  integrityBannerText: {
    fontSize: 9.5,
    fontFamily: "Times-Bold",
    textAlign: "center",
  },

  tableTop: {
    borderTopWidth: 1.35,
    borderTopColor: C.rule,
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.85,
    borderBottomColor: C.rule,
    paddingVertical: 5,
    paddingHorizontal: 1,
    backgroundColor: C.hashBg,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.3,
    borderBottomColor: "#BBBBBB",
    paddingVertical: 4,
    paddingHorizontal: 1,
  },
  tableBottom: {
    borderBottomWidth: 1.35,
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
  colTime: { width: "14%" },
  colType: { width: "12%" },
  colHandlers: { width: "18%" },
  colLoc: { width: "13%" },
  colReason: { width: "17%" },
  colHash: { width: "18%" },
  colResult: { width: "8%" },

  notesBox: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: C.rule,
  },
  notesLabel: {
    fontSize: 9.5,
    fontFamily: "Times-Bold",
    color: C.ink,
    marginBottom: 4,
  },
  notesBody: {
    fontSize: 8.5,
    fontFamily: "Times-Italic",
    color: C.muted,
    textAlign: "justify",
    lineHeight: 1.45,
  },

  tocItem: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    marginBottom: 5,
    color: C.body,
  },
  tocNum: {
    fontFamily: "Times-Bold",
    color: C.darkgreen,
  },

  abstract: {
    marginTop: 10,
    marginBottom: 14,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: C.rule,
  },
  abstractLabel: {
    fontSize: 9.5,
    fontFamily: "Times-Bold",
    marginBottom: 4,
    color: C.darkgreen,
  },
  abstractBody: {
    fontSize: 9,
    fontFamily: "Times-Italic",
    color: C.muted,
    textAlign: "justify",
    lineHeight: 1.45,
  },

  itemHeading: {
    fontSize: 13,
    fontFamily: "Times-Bold",
    color: C.ink,
    marginBottom: 10,
    marginTop: 2,
  },

  sigSection: {
    marginTop: 32,
  },
  sigIntro: {
    fontSize: 8.5,
    fontFamily: "Times-Italic",
    color: C.muted,
    marginBottom: 6,
  },
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sigBlock: {
    width: "30%",
  },
  sigLine: {
    borderBottomWidth: 0.85,
    borderBottomColor: C.rule,
    marginTop: 28,
    marginBottom: 4,
  },
  sigLabel: {
    fontSize: 8,
    fontFamily: "Times-Roman",
    color: C.muted,
  },

  footer: {
    position: "absolute",
    bottom: 40,
    left: M.x,
    right: M.x,
  },
  footerRule: {
    borderTopWidth: 0.5,
    borderTopColor: C.rule,
    marginBottom: 4,
  },
  footerNote: {
    fontSize: 6.5,
    fontFamily: "Times-Italic",
    color: C.soft,
    textAlign: "justify",
    lineHeight: 1.35,
  },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    left: M.x,
    right: M.x,
    fontSize: 8,
    fontFamily: "Times-Roman",
    color: C.muted,
    textAlign: "center",
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

function hashesAgree(item: CustodyReportItem): boolean | null {
  const a = item.originalHash?.trim().toLowerCase();
  const b = item.currentHash?.trim().toLowerCase();
  if (!a || !b) return null;
  return a === b;
}

function EmsShieldMark() {
  return (
    <View style={styles.shieldWrap}>
      <Svg width={42} height={42} viewBox="0 0 32 32">
        <Path
          d="M16 2.5L27 7.5V15.2C27 21.4 22.6 27.1 16 29.5C9.4 27.1 5 21.4 5 15.2V7.5L16 2.5Z"
          fill={C.darkgreen}
        />
        <Path
          d="M11.2 16.2H20.8M11.2 13.4H20.8M13.5 11.5V21M18.5 11.5V21"
          stroke="#F4F6F5"
          strokeWidth={1.6}
        />
        <Circle cx={16} cy={16.2} r={1.4} fill="#C48A00" />
      </Svg>
    </View>
  );
}

function HRules() {
  return (
    <>
      <View style={styles.hRuleThick} />
      <View style={styles.hRuleThin} />
    </>
  );
}

function TitlePage({
  data,
  isCase,
}: {
  data: CustodyReportPayload;
  isCase: boolean;
}) {
  const first = data.items[0];
  const mainTitle = isCase
    ? "Combined Case Custody Report"
    : "Chain of Custody Report";
  const emph = isCase
    ? `Case ${data.caseNumber ?? first?.caseNumber ?? "—"} · ${data.items.length} exhibit(s)`
    : `${first?.evidenceId ?? "—"} · Case ${first?.caseNumber ?? "—"}`;

  return (
    <Page size="A4" style={styles.titlePage}>
      <Text style={styles.tpOrg}>
        {data.organisationName.replace(/\s*\(letterhead placeholder\)\s*/i, "") ||
          "NCERT Forensic Evidence Unit"}
      </Text>
      <Text style={styles.tpSubject}>Digital Forensics · Chain of Custody</Text>
      <Text style={styles.tpCourse}>Group 2 Internship Project</Text>

      <HRules />

      <Text style={styles.tpMainTitle}>{mainTitle}</Text>
      <Text style={styles.tpEmph}>{emph}</Text>

      <Text style={styles.tpAuthorsLabel}>Prepared by</Text>
      <Text style={styles.tpAuthor}>{data.generatedByName}</Text>
      <Text style={styles.tpAuthorEmail}>{data.generatedByEmail}</Text>
      <Text style={styles.tpDate}>{data.generatedAt}</Text>

      <View style={styles.tpFill} />

      <EmsShieldMark />
      <Text style={styles.tpBrand}>
        EMS · Evidence Management System with Chain of Custody
      </Text>
      <PageChrome generatedAt={data.generatedAt} />
    </Page>
  );
}

function RunningHeader({ organisationName }: { organisationName: string }) {
  return (
    <View fixed>
      <Text style={styles.runningHead}>
        {organisationName.replace(/\s*\(letterhead placeholder\)\s*/i, "")} —
        Chain of Custody Report
      </Text>
      <View style={styles.runningRule} />
    </View>
  );
}

function SectionHeading({ n, title }: { n?: string; title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {n ? `${n} ${title}` : title}
      </Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

function ExhibitParticulars({
  item,
  sectionNumber,
}: {
  item: CustodyReportItem;
  sectionNumber: string;
}) {
  const rows: { label: string; value: string }[] = [
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
    <View>
      <SectionHeading n={sectionNumber} title="Exhibit particulars" />
      {rows.map((row) => (
        <View key={row.label} style={styles.summaryRow} wrap={false}>
          <Text style={styles.summaryLabel}>{row.label}</Text>
          <Text style={styles.summaryValue}>{row.value}</Text>
        </View>
      ))}
      {item.description ? (
        <View style={[styles.summaryRow, { marginTop: 4 }]} wrap={false}>
          <Text style={styles.summaryLabel}>Description</Text>
          <Text style={styles.summaryValue}>{item.description}</Text>
        </View>
      ) : null}
    </View>
  );
}

function CryptographicIntegrity({
  item,
  sectionNumber,
}: {
  item: CustodyReportItem;
  sectionNumber: string;
}) {
  const agree = hashesAgree(item);
  const banner =
    agree === true
      ? "INTEGRITY STATUS: MATCH — original and current digests agree"
      : agree === false
        ? "INTEGRITY STATUS: MISMATCH — digests differ; escalate to supervisor"
        : "INTEGRITY STATUS: — digests unavailable for comparison";

  return (
    <View>
      <SectionHeading n={sectionNumber} title="Cryptographic integrity" />
      <Text style={styles.hashLabel}>Original hash (intake)</Text>
      <View style={styles.hashBox}>
        <Text style={styles.mono}>{item.originalHash}</Text>
      </View>
      <Text style={styles.hashLabel}>Current hash (as of report)</Text>
      <View style={styles.hashBox}>
        <Text style={styles.mono}>{item.currentHash}</Text>
      </View>
      <View
        style={[
          styles.integrityBanner,
          {
            borderColor:
              agree === true
                ? C.pass
                : agree === false
                  ? C.fail
                  : C.rule,
          },
        ]}
        wrap={false}
      >
        <Text
          style={[
            styles.integrityBannerText,
            {
              color:
                agree === true
                  ? C.pass
                  : agree === false
                    ? C.fail
                    : C.pending,
            },
          ]}
        >
          {banner}
        </Text>
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
    <View>
      <SectionHeading n={sectionNumber} title="Chain of custody" />
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
              marginVertical: 8,
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
                {ev.hashAtEvent.length > 16
                  ? `${ev.hashAtEvent.slice(0, 8)}…${ev.hashAtEvent.slice(-6)}`
                  : ev.hashAtEvent}
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

function NotesSection({ sectionNumber }: { sectionNumber: string }) {
  return (
    <View>
      <SectionHeading n={sectionNumber} title="Notes" />
      <View style={styles.notesBox}>
        <Text style={styles.notesLabel}>Integrity statement.</Text>
        <Text style={styles.notesBody}>
          Digests shown above are rendered in monospace for unambiguous comparison
          with external forensic tools (e.g. FTK Imager). Uploaded digital files
          are hashed server-side with SHA-256; externally supplied digests may be
          MD5 (32 hex) or SHA-256 (64 hex). This system-generated ledger reflects
          the append-only EMS audit trail at the time of generation and does not
          replace physical exhibit seals or institutional wet-ink custody forms.
        </Text>
      </View>
    </View>
  );
}

function SignatureBlock() {
  return (
    <View style={styles.sigSection} wrap={false}>
      <SectionHeading title="Attestation" />
      <Text style={styles.sigIntro}>
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
          <Text style={styles.sigLabel}>Custodian</Text>
        </View>
        <View style={styles.sigBlock}>
          <View style={styles.sigLine} />
          <Text style={styles.sigLabel}>Supervisor</Text>
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
          monospace for unambiguous comparison. This document does not replace
          physical exhibit seals or institutional wet-ink custody forms.
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
      <ExhibitParticulars item={item} sectionNumber="1." />
      <CryptographicIntegrity item={item} sectionNumber="2." />
      <CustodyTable item={item} sectionNumber="3." />
      <NotesSection sectionNumber="4." />
      <SignatureBlock />
    </View>
  );
}

export function CustodyReportDocument({ data }: { data: CustodyReportPayload }) {
  const isCase = data.reportKind === "case";
  const orgClean =
    data.organisationName.replace(/\s*\(letterhead placeholder\)\s*/i, "") ||
    "NCERT Forensic Evidence Unit";

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
      keywords="custody, forensic, SHA-256, NCERT, EMS"
    >
      <TitlePage data={{ ...data, organisationName: orgClean }} isCase={isCase} />

      {isCase ? (
        <Page size="A4" style={styles.page}>
          <RunningHeader organisationName={orgClean} />
          <Text style={styles.sectionTitle}>Contents</Text>
          <View style={styles.sectionRule} />
          <View style={styles.abstract}>
            <Text style={styles.abstractLabel}>Abstract.</Text>
            <Text style={styles.abstractBody}>
              This document concatenates the chain-of-custody records for every
              evidence item registered under case {data.caseNumber}. Each
              subsequent page presents one exhibit in the style of a formal
              forensic custody ledger, with cryptographic digests suitable for
              independent verification.
            </Text>
          </View>
          {data.items.map((item, i) => (
            <Text key={item.evidenceId} style={styles.tocItem}>
              <Text style={styles.tocNum}>{i + 1}. </Text>
              {item.evidenceId} — {item.title} ({item.status})
            </Text>
          ))}
          <PageChrome generatedAt={data.generatedAt} />
        </Page>
      ) : null}

      {data.items.map((item) => (
        <Page key={item.evidenceId} size="A4" style={styles.page} wrap>
          <RunningHeader organisationName={orgClean} />
          <ItemBody item={item} showExhibitHeading={isCase} />
          <PageChrome generatedAt={data.generatedAt} />
        </Page>
      ))}
    </Document>
  );
}
