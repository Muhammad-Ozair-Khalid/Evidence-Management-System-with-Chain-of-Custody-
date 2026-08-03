#!/usr/bin/env python3
"""Generate 3 NCERT-style phase completion reports for EMS · Chain of Custody."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

OUT_DIR = Path(__file__).resolve().parent

# NCERT laboratory palette (aligned with sample cover / headers)
NCERT_GREEN = colors.HexColor("#0B3D2E")
NCERT_GREEN_MID = colors.HexColor("#145C43")
NCERT_ACCENT = colors.HexColor("#1A7A56")
HEADER_GRAY = colors.HexColor("#2C3E50")
RULE_GRAY = colors.HexColor("#B0B8C0")
TABLE_HEADER_BG = colors.HexColor("#0B3D2E")
TABLE_ALT = colors.HexColor("#F3F6F4")
NOTICE_BG = colors.HexColor("#EEF5F1")

GROUP_FOOTER = "Group 2 — Khalid·Qayyum·Fatima"
HEADER_LINE = "Digital Forensic Investigation Report  ·  Group 2 — NCERT"


def make_styles():
    base = getSampleStyleSheet()
    styles = {
        "cover_org": ParagraphStyle(
            "cover_org",
            fontName="Helvetica-Bold",
            fontSize=22,
            textColor=NCERT_GREEN,
            alignment=TA_CENTER,
            spaceAfter=2,
            leading=26,
        ),
        "cover_suborg": ParagraphStyle(
            "cover_suborg",
            fontName="Helvetica",
            fontSize=10,
            textColor=NCERT_GREEN_MID,
            alignment=TA_CENTER,
            spaceAfter=10,
            leading=13,
        ),
        "cover_banner": ParagraphStyle(
            "cover_banner",
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=colors.white,
            alignment=TA_CENTER,
            leading=15,
        ),
        "cover_title": ParagraphStyle(
            "cover_title",
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=HEADER_GRAY,
            alignment=TA_CENTER,
            spaceBefore=16,
            spaceAfter=6,
            leading=22,
        ),
        "cover_subtitle": ParagraphStyle(
            "cover_subtitle",
            fontName="Helvetica",
            fontSize=11,
            textColor=colors.HexColor("#445566"),
            alignment=TA_CENTER,
            spaceAfter=4,
            leading=15,
        ),
        "meta_label": ParagraphStyle(
            "meta_label",
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=NCERT_GREEN,
            leading=14,
        ),
        "meta_value": ParagraphStyle(
            "meta_value",
            fontName="Helvetica",
            fontSize=10,
            textColor=HEADER_GRAY,
            leading=14,
        ),
        "notice": ParagraphStyle(
            "notice",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=colors.HexColor("#333333"),
            alignment=TA_JUSTIFY,
            leading=12,
        ),
        "h1": ParagraphStyle(
            "h1",
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=NCERT_GREEN,
            spaceBefore=14,
            spaceAfter=6,
            leading=16,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=NCERT_GREEN_MID,
            spaceBefore=10,
            spaceAfter=4,
            leading=14,
        ),
        "body": ParagraphStyle(
            "body",
            fontName="Helvetica",
            fontSize=10,
            textColor=colors.HexColor("#222222"),
            alignment=TA_JUSTIFY,
            spaceAfter=6,
            leading=13.5,
            firstLineIndent=0,
        ),
        "abstract_title": ParagraphStyle(
            "abstract_title",
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=NCERT_GREEN,
            spaceBefore=4,
            spaceAfter=6,
            leading=14,
        ),
        "toc_title": ParagraphStyle(
            "toc_title",
            fontName="Helvetica-Bold",
            fontSize=14,
            textColor=NCERT_GREEN,
            spaceAfter=10,
            leading=18,
        ),
        "toc_entry": ParagraphStyle(
            "toc_entry",
            fontName="Helvetica",
            fontSize=10,
            textColor=HEADER_GRAY,
            leading=15,
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=colors.HexColor("#222222"),
            leading=11,
        ),
        "table_head": ParagraphStyle(
            "table_head",
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=colors.white,
            leading=11,
        ),
        "caption": ParagraphStyle(
            "caption",
            fontName="Helvetica-Oblique",
            fontSize=8.5,
            textColor=colors.HexColor("#445566"),
            spaceBefore=2,
            spaceAfter=8,
            leading=11,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            fontName="Helvetica",
            fontSize=10,
            textColor=colors.HexColor("#222222"),
            leading=13.5,
            leftIndent=8,
        ),
        "ref": ParagraphStyle(
            "ref",
            fontName="Helvetica",
            fontSize=9,
            textColor=colors.HexColor("#222222"),
            leading=12,
            leftIndent=14,
            firstLineIndent=-14,
            spaceAfter=4,
        ),
        "code": ParagraphStyle(
            "code",
            fontName="Courier",
            fontSize=8,
            textColor=colors.HexColor("#1a1a1a"),
            leading=11,
            backColor=colors.HexColor("#F5F6F7"),
        ),
    }
    return styles


def header_footer(canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    if page > 1:
        canvas.setStrokeColor(RULE_GRAY)
        canvas.setLineWidth(0.6)
        canvas.line(2 * cm, A4[1] - 1.4 * cm, A4[0] - 2 * cm, A4[1] - 1.4 * cm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(HEADER_GRAY)
        canvas.drawString(2 * cm, A4[1] - 1.2 * cm, HEADER_LINE)
        canvas.line(2 * cm, 1.5 * cm, A4[0] - 2 * cm, 1.5 * cm)
        canvas.drawString(2 * cm, 1.1 * cm, GROUP_FOOTER)
        canvas.drawRightString(A4[0] - 2 * cm, 1.1 * cm, f"Page {page - 1}")
    canvas.restoreState()


def cover_page(styles, meta: dict):
    story = []
    story.append(Spacer(1, 1.2 * cm))
    story.append(Paragraph("NCERT", styles["cover_org"]))
    story.append(
        Paragraph("National Cyber Emergency Response Team", styles["cover_suborg"])
    )

    banner = Table(
        [[Paragraph("DIGITAL FORENSICS LABORATORY — GROUP PROJECT REPORT", styles["cover_banner"])]],
        colWidths=[16.5 * cm],
    )
    banner.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), NCERT_GREEN),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ]
        )
    )
    story.append(banner)
    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph(meta["title"], styles["cover_title"]))
    for line in meta["subtitle_lines"]:
        story.append(Paragraph(line, styles["cover_subtitle"]))

    story.append(Spacer(1, 0.8 * cm))

    rows = []
    for label, value in [
        ("Group:", meta["group"]),
        ("Members:", meta["members"][0]),
        ("", meta["members"][1]),
        ("", meta["members"][2]),
        ("Instructor:", meta["instructor"]),
        ("Course:", meta["course"]),
        ("Platform:", meta["platform"]),
        ("Submission:", meta["submission"]),
        ("Progress:", meta["progress"]),
    ]:
        rows.append(
            [
                Paragraph(label, styles["meta_label"]),
                Paragraph(value, styles["meta_value"]),
            ]
        )

    meta_table = Table(rows, colWidths=[3.2 * cm, 13.3 * cm])
    meta_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("LINEBELOW", (0, 0), (-1, -2), 0.3, RULE_GRAY),
            ]
        )
    )
    story.append(meta_table)
    story.append(Spacer(1, 1.0 * cm))

    notice = Table(
        [
            [
                Paragraph(
                    f"<b>Academic Integrity Notice:</b> {meta['integrity']}",
                    styles["notice"],
                )
            ]
        ],
        colWidths=[16.5 * cm],
    )
    notice.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), NOTICE_BG),
                ("BOX", (0, 0), (-1, -1), 0.8, NCERT_ACCENT),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    story.append(notice)
    story.append(PageBreak())
    return story


def toc_block(styles, entries: list[tuple[str, str]]):
    story = [Paragraph("Contents", styles["toc_title"])]
    data = []
    for title, page in entries:
        data.append(
            [
                Paragraph(title, styles["toc_entry"]),
                Paragraph(page, styles["toc_entry"]),
            ]
        )
    t = Table(data, colWidths=[14.5 * cm, 2 * cm])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("LINEBELOW", (0, 0), (-1, -1), 0.25, RULE_GRAY),
            ]
        )
    )
    story.append(t)
    story.append(PageBreak())
    return story


def p(styles, text: str):
    return Paragraph(text, styles["body"])


def h1(styles, text: str):
    return Paragraph(text, styles["h1"])


def h2(styles, text: str):
    return Paragraph(text, styles["h2"])


def bullets(styles, items: list[str]):
    return ListFlowable(
        [ListItem(Paragraph(i, styles["bullet"]), leftIndent=12, bulletColor=NCERT_GREEN) for i in items],
        bulletType="1",
        start="1",
        leftIndent=18,
        spaceBefore=2,
        spaceAfter=6,
    )


def simple_bullets(styles, items: list[str]):
    return ListFlowable(
        [ListItem(Paragraph(i, styles["bullet"]), leftIndent=10, bulletColor=NCERT_GREEN) for i in items],
        bulletType="bullet",
        bulletFontSize=8,
        leftIndent=16,
        spaceBefore=2,
        spaceAfter=6,
    )


def make_table(styles, caption: str, headers: list[str], rows: list[list[str]], col_widths=None):
    head = [Paragraph(h, styles["table_head"]) for h in headers]
    body = [[Paragraph(c, styles["table_cell"]) for c in row] for row in rows]
    data = [head] + body
    if col_widths is None:
        w = 16.5 * cm / len(headers)
        col_widths = [w] * len(headers)
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#9AA5AE")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style_cmds.append(("BACKGROUND", (0, i), (-1, i), TABLE_ALT))
    t.setStyle(TableStyle(style_cmds))
    return KeepTogether([t, Paragraph(caption, styles["caption"])])


def build_doc(filename: str, meta: dict, build_body):
    styles = make_styles()
    path = OUT_DIR / filename
    doc = BaseDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm,
        title=meta["title"],
        author="Group 2 — NCERT Digital Forensics Internship",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates(
        [PageTemplate(id="main", frames=frame, onPage=header_footer)]
    )

    story = []
    story.extend(cover_page(styles, meta))
    story.extend(build_body(styles))
    doc.build(story)
    return path


# ---------------------------------------------------------------------------
# PHASE 1 — 25% Research & Foundation
# ---------------------------------------------------------------------------

def phase1_body(styles):
    story = []
    story.extend(
        toc_block(
            styles,
            [
                ("Abstract", "2"),
                ("1 Introduction", "2"),
                ("1.1 Objectives", "2"),
                ("1.2 Scope", "2"),
                ("1.3 Tools and Environment", "3"),
                ("2 Problem Statement and Project Brief", "3"),
                ("3 Research and Literature Review", "4"),
                ("3.1 Chain of Custody in Digital Evidence", "4"),
                ("3.2 Cryptographic Integrity (SHA-256)", "5"),
                ("3.3 Role-Based Access Control in Forensic Labs", "5"),
                ("3.4 Relevance to Pakistani Cyber-Forensic Practice", "6"),
                ("4 Requirements Analysis", "6"),
                ("5 System Architecture and Technology Selection", "7"),
                ("6 Data Model and Security Design", "8"),
                ("7 Phase-1 Deliverables and Progress (25%)", "9"),
                ("8 Results Summary", "10"),
                ("9 Conclusion", "10"),
                ("References", "11"),
                ("A Phase Plan Overview", "11"),
            ],
        )
    )

    story.append(Paragraph("Abstract", styles["abstract_title"]))
    story.append(
        p(
            styles,
            "This report documents <b>Phase 1 (25% completion)</b> of Group 2’s internship "
            "project <i>Evidence Management System (with Chain of Custody)</i>, undertaken "
            "under the <b>National Cyber Emergency Response Team (NCERT)</b> Digital "
            "Forensics Internship and supervised by <b>Sir Umar Javaid</b>. Phase 1 "
            "concentrates on research, requirements analysis, and foundational design "
            "rather than full module implementation. The team studied peer-reviewed and "
            "practitioner guidance on digital chain of custody, SHA-256 integrity "
            "verification, role-based access control (custodian, examiner, supervisor), "
            "and forensic audit trails; mapped these findings to the official project "
            "brief; and produced a concrete architecture, database schema, and "
            "implementation roadmap for subsequent phases.",
        )
    )

    story.append(h1(styles, "1 Introduction"))
    story.append(
        p(
            styles,
            "Digital evidence loses courtroom value when custody history is incomplete or "
            "when file integrity cannot be proven. Traditional paper logs do not scale for "
            "high-volume digital exhibits. Group 2’s assigned deliverable is a web-based "
            "Evidence Management System that registers uniquely identified digital items, "
            "computes SHA-256 hashes at ingest, records every custody event, re-hashes on "
            "handoff to detect tampering, and enforces role-based access with a full "
            "audit trail. Phase 1 establishes the research foundation and engineering "
            "blueprint required before coding the operational modules.",
        )
    )

    story.append(h2(styles, "1.1 Objectives"))
    story.append(
        bullets(
            styles,
            [
                "Interpret the official NCERT project brief and define measurable success criteria.",
                "Review literature and practice on digital chain of custody and hash-based integrity.",
                "Elicit functional and non-functional requirements for all four brief scope items.",
                "Select a modern, maintainable technology stack suitable for a forensic lab demo.",
                "Design the logical architecture, RBAC matrix, and relational data model.",
                "Produce a phased implementation plan covering the remaining 75% of the work.",
            ],
        )
    )

    story.append(h2(styles, "1.2 Scope"))
    story.append(
        p(
            styles,
            "Phase 1 is limited to research, requirements, architecture, and design "
            "artefacts. Working application modules (evidence registration UI, live "
            "custody ledger, integrity queue, PDF reports) are deferred to Phases 2 and 3. "
            "Physical evidence seizure and hardware imaging remain out of scope; the "
            "system manages <i>already acquired</i> digital exhibits and their custody metadata.",
        )
    )

    story.append(h2(styles, "1.3 Tools and Environment"))
    story.append(
        make_table(
            styles,
            "Table 1: Investigation / development tools and environment (Phase 1).",
            ["Component", "Details"],
            [
                ["Host OS", "Windows 10/11 development workstation"],
                ["Primary stack (planned)", "Next.js 14, TypeScript, Prisma, PostgreSQL"],
                ["Authentication (planned)", "NextAuth.js (Credentials + JWT)"],
                ["Integrity algorithm", "SHA-256 (Node.js crypto, server-side only)"],
                ["Design artefacts", "ER diagrams, RBAC matrix, module roadmap"],
                ["Reference brief", "Project 1 — Evidence Management System (with CoC)"],
                ["Version control", "Git repository (local project workspace)"],
            ],
            col_widths=[4.5 * cm, 12 * cm],
        )
    )

    story.append(h1(styles, "2 Problem Statement and Project Brief"))
    story.append(
        p(
            styles,
            "The official brief describes the system as <i>“the flagship evidence-tracking "
            "platform — inventory meets custody ledger.”</i> It must register digital "
            "evidence as uniquely identified items while maintaining a tamper-evident "
            "chain-of-custody log, and double as an inventory of who held an exhibit, "
            "when, and why. The deliverable type is an <b>Evidence / inventory management "
            "system</b> within the forensic domain of evidence / case workflow.",
        )
    )
    story.append(
        make_table(
            styles,
            "Table 2: Official project scope mapped to Phase-1 research questions.",
            ["#", "Brief requirement", "Phase-1 research focus"],
            [
                [
                    "1",
                    "Register items with unique IDs, intake details, SHA-256 at ingest",
                    "ID schemes, hash-at-ingest patterns, intake metadata fields",
                ],
                [
                    "2",
                    "Record seizure / transfer / examination / return with handler, time, location, reason",
                    "Custody event taxonomy, append-only ledger design",
                ],
                [
                    "3",
                    "Re-hash on handoff; flag mismatches; printable custody report",
                    "Integrity workflows, report content for court packaging",
                ],
                [
                    "4",
                    "RBAC (custodian, examiner, supervisor) + full audit trail",
                    "Permission matrices, audit append-only semantics",
                ],
            ],
            col_widths=[1.0 * cm, 7.5 * cm, 8.0 * cm],
        )
    )

    story.append(h1(styles, "3 Research and Literature Review"))
    story.append(h2(styles, "3.1 Chain of Custody in Digital Evidence"))
    story.append(
        p(
            styles,
            "Chain of custody (CoC) is the chronological documentation of seizure, "
            "custody, control, transfer, analysis, and disposition of evidence. In "
            "digital forensics, CoC must also prove that the bits examined are the bits "
            "seized. Carrier’s foundational treatment of file-system forensics emphasises "
            "that documentation and integrity hashing are inseparable from technical "
            "acquisition [1]. Practitioners therefore treat every movement of an exhibit "
            "as an auditable event with actor, timestamp, location, and stated reason.",
        )
    )
    story.append(
        p(
            styles,
            "Paper ledgers remain common in some labs but are error-prone and hard to "
            "search. Electronic CoC systems reduce omission risk when they enforce "
            "mandatory fields, bind events to authenticated users, and prevent silent "
            "rewrites of historical records. Phase 1 therefore adopts an "
            "<b>append-only custody ledger</b> as a first-class design constraint.",
        )
    )

    story.append(h2(styles, "3.2 Cryptographic Integrity (SHA-256)"))
    story.append(
        p(
            styles,
            "Cryptographic hashing provides a compact fingerprint of exhibit bytes. "
            "SHA-256 is widely accepted in forensic practice for imaging and file "
            "verification [2]. Computing the digest at ingest establishes a baseline; "
            "recomputing it on each handoff detects accidental corruption or intentional "
            "tampering. A mismatch must never be silently overwritten: the correct "
            "operational response is to flag the item, block further routine movement, "
            "and require supervisory resolution with a written note.",
        )
    )

    story.append(h2(styles, "3.3 Role-Based Access Control in Forensic Labs"))
    story.append(
        p(
            styles,
            "Forensic organisations separate duties so that no single actor can "
            "unilaterally alter evidence status without oversight. The project brief "
            "names three operational roles—<b>custodian</b>, <b>examiner</b>, and "
            "<b>supervisor</b>. Phase 1 extends this with an <b>admin</b> role for "
            "user lifecycle management, consistent with least-privilege practice. "
            "Permissions must be enforced both at the route layer and inside every "
            "server-side mutation, not only in the user interface [3].",
        )
    )

    story.append(h2(styles, "3.4 Relevance to Pakistani Cyber-Forensic Practice"))
    story.append(
        p(
            styles,
            "Haque et al. document gaps in Pakistan’s cyber-forensic investigation "
            "readiness spanning policy, skill, organisation, and tooling [4]. A "
            "lightweight, open-stack evidence inventory with cryptographic CoC directly "
            "supports training objectives at NCERT: trainees practise intake hashing, "
            "documented handoffs, integrity flags, and printable reports without "
            "depending on expensive commercial case-management suites. Group 2’s "
            "system is therefore both a software deliverable and a pedagogical platform.",
        )
    )

    story.append(h1(styles, "4 Requirements Analysis"))
    story.append(
        make_table(
            styles,
            "Table 3: Consolidated functional requirements (elicited in Phase 1).",
            ["ID", "Requirement", "Priority"],
            [
                ["FR-01", "Unique evidence IDs (e.g., EVD-YYYY-NNNN) at registration", "Must"],
                ["FR-02", "Capture intake metadata (case ref, type, location, notes)", "Must"],
                ["FR-03", "Compute/store SHA-256 at ingest (upload or double-entry hash)", "Must"],
                ["FR-04", "Custody events: SEIZURE, TRANSFER, EXAMINATION, RETURN", "Must"],
                ["FR-05", "Record handler, timestamp, location, reason on every event", "Must"],
                ["FR-06", "Re-hash on handoff; flag INTEGRITY_FLAGGED on mismatch", "Must"],
                ["FR-07", "Supervisor resolution workflow for flagged items", "Must"],
                ["FR-08", "Printable / downloadable custody report (PDF) per item", "Must"],
                ["FR-09", "RBAC for custodian, examiner, supervisor (+ admin)", "Must"],
                ["FR-10", "Append-only system audit trail with export", "Must"],
                ["NFR-01", "Server-side permission checks on all mutations", "Must"],
                ["NFR-02", "Responsive UI suitable for lab demo / internship review", "Should"],
            ],
            col_widths=[2.0 * cm, 12.0 * cm, 2.5 * cm],
        )
    )

    story.append(h1(styles, "5 System Architecture and Technology Selection"))
    story.append(
        p(
            styles,
            "After comparing monolithic desktop tools with a web application, Group 2 "
            "selected a <b>Next.js App Router</b> architecture: server components for "
            "secure data access, server actions for mutations, and PostgreSQL via Prisma "
            "for durable storage. This stack supports typed models, role-aware "
            "middleware, and PDF generation while remaining deployable for demonstration.",
        )
    )
    story.append(
        make_table(
            styles,
            "Table 4: Technology decisions and rationale.",
            ["Layer", "Choice", "Rationale"],
            [
                ["UI / App", "Next.js 14 + TypeScript + Tailwind", "SSR security, typed routes, fast UI"],
                ["Auth", "NextAuth Credentials + JWT", "Role claims in session; lab-friendly demos"],
                ["Database", "PostgreSQL + Prisma", "Relational integrity; migrations; seed data"],
                ["Hashing", "Node crypto SHA-256", "Server-only; no client-trusted digests"],
                ["Reports", "@react-pdf/renderer", "Printable custody packages"],
                ["Charts", "Recharts", "Dashboard custody / integrity overview"],
            ],
            col_widths=[3.2 * cm, 5.5 * cm, 7.8 * cm],
        )
    )

    story.append(h1(styles, "6 Data Model and Security Design"))
    story.append(
        p(
            styles,
            "The logical model centres on <b>User</b>, <b>EvidenceItem</b>, "
            "<b>CustodyEvent</b>, <b>IntegrityCheck</b>, and <b>AuditLogEntry</b>. "
            "Evidence items store the baseline SHA-256 and current custodian; custody "
            "events form an ordered ledger; integrity checks record recomputed digests "
            "and mismatch outcomes; audit entries capture security-relevant actions "
            "without update/delete APIs.",
        )
    )
    story.append(
        make_table(
            styles,
            "Table 5: Draft RBAC permission matrix (design baseline for Phases 2–3).",
            ["Capability", "Custodian", "Examiner", "Supervisor", "Admin"],
            [
                ["View dashboard / evidence / custody", "Yes", "Yes", "Yes", "Yes"],
                ["Register evidence", "Limited", "Yes", "Yes", "Yes"],
                ["Log custody events", "Yes", "Yes", "Yes", "Yes"],
                ["Integrity re-hash / review", "No", "Yes", "Yes", "Yes"],
                ["Resolve integrity flags", "No", "No", "Yes", "Yes"],
                ["Generate custody PDF", "No", "Yes", "Yes", "Yes"],
                ["View full audit trail", "No", "No", "Yes", "Yes"],
                ["Manage users / roles", "No", "No", "No", "Yes"],
            ],
            col_widths=[5.5 * cm, 2.75 * cm, 2.75 * cm, 2.75 * cm, 2.75 * cm],
        )
    )

    story.append(h1(styles, "7 Phase-1 Deliverables and Progress (25%)"))
    story.append(
        make_table(
            styles,
            "Table 6: Phase 1 completion checklist (25% of total project).",
            ["#", "Deliverable", "Status"],
            [
                ["1", "Project brief interpretation & problem statement", "Completed"],
                ["2", "Literature / practice review (CoC, hashing, RBAC)", "Completed"],
                ["3", "Functional & non-functional requirements (Table 3)", "Completed"],
                ["4", "Technology stack selection with rationale", "Completed"],
                ["5", "High-level architecture & module boundaries", "Completed"],
                ["6", "Draft ER / data model & RBAC matrix", "Completed"],
                ["7", "Phased implementation roadmap (25 / 50 / 100%)", "Completed"],
                ["8", "Runnable evidence / custody UI modules", "Deferred → Phase 2"],
                ["9", "Integrity, reports, audit, admin completion", "Deferred → Phase 3"],
            ],
            col_widths=[1.2 * cm, 11.8 * cm, 3.5 * cm],
        )
    )

    story.append(h1(styles, "8 Results Summary"))
    story.append(
        p(
            styles,
            "Phase 1 achieved its intended 25% milestone: the team can articulate "
            "exactly what the system must do, why each brief requirement matters "
            "forensically, which stack will implement it, and how roles and hashes "
            "will be enforced. No production evidence was processed; all work was "
            "design- and research-oriented on authorised internship resources.",
        )
    )
    story.append(
        make_table(
            styles,
            "Table 7: Phase 1 results against internship expectations.",
            ["Expectation", "Outcome", "Evidence"],
            [
                ["Clear problem framing", "Met", "§2; Table 2"],
                ["Research depth", "Met", "§3; References"],
                ["Requirements baseline", "Met", "Table 3"],
                ["Architecture readiness", "Met", "§5–§6; Tables 4–5"],
                ["Honest progress claim (25%)", "Met", "Table 6"],
            ],
            col_widths=[5.0 * cm, 3.0 * cm, 8.5 * cm],
        )
    )

    story.append(h1(styles, "9 Conclusion"))
    story.append(
        p(
            styles,
            "Phase 1 established a defensible foundation for the Evidence Management "
            "System with Chain of Custody. Research confirmed that unique IDs, "
            "ingest-time SHA-256, append-only custody events, handoff re-hashing, "
            "RBAC, and audit logging are the minimum set needed to satisfy the NCERT "
            "brief. With architecture and requirements locked, Group 2 proceeds to "
            "Phase 2 to implement authentication, evidence registration, and the "
            "custody ledger—the first operational half of the platform.",
        )
    )

    story.append(h1(styles, "References"))
    refs = [
        "[1] B. Carrier, <i>File System Forensic Analysis</i>. Addison-Wesley.",
        "[2] NIST, “Secure Hash Standard (SHS),” FIPS PUB 180-4.",
        "[3] R. S. Sandhu et al., “Role-based access control models,” <i>IEEE Computer</i>, 1996.",
        "[4] E. U. Haque et al., “Cyber forensic investigation infrastructure of Pakistan,” <i>IEEE Access</i>, vol. 11, 2023.",
        "[5] NCERT Digital Forensics Internship — Project 1 brief: Evidence Management System (with Chain of Custody).",
        "[6] Group 2 Week 3 laboratory report style reference — File-System Forensics and Data Recovery (NCERT format).",
        "[7] SWGDE, “Best Practices for Computer Forensics,” current revision.",
        "[8] ISO/IEC 27037, Guidelines for identification, collection, acquisition and preservation of digital evidence.",
    ]
    for r in refs:
        story.append(Paragraph(r, styles["ref"]))

    story.append(h1(styles, "A Phase Plan Overview"))
    story.append(
        make_table(
            styles,
            "Table 8: Three-phase completion plan for the EMS internship project.",
            ["Phase", "Weight", "Focus"],
            [
                ["Phase 1 (this report)", "25%", "Research, requirements, architecture, data/RBAC design"],
                ["Phase 2", "25% (→ 50%)", "Auth, evidence ingest + SHA-256, custody events, dashboard core"],
                ["Phase 3", "50% (→ 100%)", "Integrity, PDF reports, audit, admin, polish, verification"],
            ],
            col_widths=[4.0 * cm, 3.5 * cm, 9.0 * cm],
        )
    )
    return story


# ---------------------------------------------------------------------------
# PHASE 2 — 50% Core Modules
# ---------------------------------------------------------------------------

def phase2_body(styles):
    story = []
    story.extend(
        toc_block(
            styles,
            [
                ("Abstract", "2"),
                ("1 Introduction", "2"),
                ("1.1 Objectives", "2"),
                ("1.2 Scope", "3"),
                ("1.3 Tools and Environment", "3"),
                ("2 Continuity from Phase 1", "3"),
                ("3 Methodology — Implementation Approach", "4"),
                ("4 Module Implementation", "4"),
                ("4.1 Authentication and Session Security", "4"),
                ("4.2 Evidence Registration with SHA-256", "5"),
                ("4.3 Custody Event Ledger", "6"),
                ("4.4 Dashboard and Navigation Shell", "7"),
                ("4.5 Account Settings Foundation", "7"),
                ("5 Database Migrations and Seed Data", "8"),
                ("6 Verification Performed in Phase 2", "8"),
                ("7 Progress Accounting (50%)", "9"),
                ("8 Results Summary", "10"),
                ("9 Conclusion", "10"),
                ("References", "11"),
                ("A Module File Inventory", "11"),
            ],
        )
    )

    story.append(Paragraph("Abstract", styles["abstract_title"]))
    story.append(
        p(
            styles,
            "This report documents <b>Phase 2</b> of Group 2’s NCERT Digital Forensics "
            "Internship project <i>Evidence Management System (with Chain of Custody)</i>, "
            "supervised by <b>Sir Umar Javaid</b>. Building on Phase-1 research and "
            "architecture, Phase 2 implements the first operational half of the platform "
            "and advances overall completion from 25% to <b>50%</b>. Delivered modules "
            "include Credentials authentication with role claims, evidence registration "
            "with unique IDs and ingest-time SHA-256 hashing, custody event recording "
            "(seizure, transfer, examination, return), a role-aware dashboard shell, and "
            "baseline account settings. Integrity mismatch workflows, printable PDF "
            "reports, full audit analytics, and admin user management remain scheduled "
            "for Phase 3.",
        )
    )

    story.append(h1(styles, "1 Introduction"))
    story.append(
        p(
            styles,
            "Phase 1 produced requirements and a design blueprint. Phase 2 converts "
            "that blueprint into running software that a trainee can sign into and use "
            "to register exhibits and move them through a custody ledger. The emphasis "
            "is forensic correctness of the core loop—<b>hash at ingest, authenticate "
            "actors, append custody events</b>—rather than cosmetic completeness.",
        )
    )

    story.append(h2(styles, "1.1 Objectives"))
    story.append(
        bullets(
            styles,
            [
                "Stand up the Next.js application with PostgreSQL, Prisma, and migrations.",
                "Implement NextAuth login with custodian / examiner / supervisor / admin roles.",
                "Deliver evidence registration with unique IDs and server-side SHA-256.",
                "Implement custody events capturing handler, timestamp, location, and reason.",
                "Provide a dashboard shell with module navigation gated by permissions.",
                "Seed demo accounts for instructor walkthroughs.",
                "Verify the Phase-2 modules with build checks and guided manual tests.",
            ],
        )
    )

    story.append(h2(styles, "1.2 Scope"))
    story.append(
        p(
            styles,
            "In scope: authentication, evidence CRUD/list/detail (registration focus), "
            "custody logging, dashboard overview, and settings password/profile basics. "
            "Out of scope for Phase 2 (reserved for Phase 3): integrity re-hash queue and "
            "supervisor resolution, custody PDF generation, full audit trail UI/export, "
            "admin user lifecycle screens, and marketing/landing polish.",
        )
    )

    story.append(h2(styles, "1.3 Tools and Environment"))
    story.append(
        make_table(
            styles,
            "Table 1: Tools and environment used during Phase 2 implementation.",
            ["Component", "Details"],
            [
                ["Framework", "Next.js 14 (App Router) + TypeScript strict"],
                ["UI", "Tailwind CSS + shadcn/ui primitives"],
                ["ORM / DB", "Prisma 5 + PostgreSQL (Docker Compose)"],
                ["Auth", "NextAuth.js v4 — Credentials provider, JWT sessions"],
                ["Hashing", "Node.js crypto.createHash('sha256')"],
                ["Dev tooling", "ESLint, tsc --noEmit, npm scripts"],
                ["Seed accounts", "admin / supervisor / examiner / custodian demos"],
            ],
            col_widths=[4.0 * cm, 12.5 * cm],
        )
    )

    story.append(h1(styles, "2 Continuity from Phase 1"))
    story.append(
        p(
            styles,
            "Every Phase-2 module traces to a Phase-1 requirement ID. FR-01–FR-05 and "
            "FR-09 (partial) are the primary targets. The RBAC matrix from Phase 1 is "
            "enforced through middleware route permissions and server-action "
            "<font face='Courier'>requirePermission()</font> guards so that hiding a "
            "menu item is never the only control.",
        )
    )
    story.append(
        make_table(
            styles,
            "Table 2: Traceability from Phase-1 requirements to Phase-2 modules.",
            ["Req.", "Module delivered in Phase 2", "Status"],
            [
                ["FR-01/02/03", "Evidence registration + SHA-256 ingest", "Implemented"],
                ["FR-04/05", "Custody event ledger + evidence timeline", "Implemented"],
                ["FR-09", "Login + role-gated navigation / actions", "Implemented (core)"],
                ["NFR-01", "Server-side permission checks on mutations", "Implemented"],
                ["FR-06/07/08/10", "Integrity, PDF, audit UI, admin users", "Phase 3"],
            ],
            col_widths=[3.0 * cm, 9.5 * cm, 4.0 * cm],
        )
    )

    story.append(h1(styles, "3 Methodology — Implementation Approach"))
    story.append(
        simple_bullets(
            styles,
            [
                "<b>Schema-first:</b> Prisma models for User, EvidenceItem, CustodyEvent; migrate; seed.",
                "<b>Secure-by-default routes:</b> middleware maps paths to permissions; pages re-check <font face='Courier'>can()</font>.",
                "<b>Server actions:</b> create evidence / log custody only after authz; hash computed on server.",
                "<b>Demo realism:</b> seed users with Password123! for instructor review without exposing production secrets.",
                "<b>Incremental verification:</b> typecheck + lint + smoke of routes after each module slice.",
            ],
        )
    )

    story.append(h1(styles, "4 Module Implementation"))
    story.append(h2(styles, "4.1 Authentication and Session Security"))
    story.append(
        p(
            styles,
            "Users authenticate with email/password. Passwords are stored as bcrypt "
            "hashes. Successful login issues a JWT session embedding user id, name, "
            "email, and role. Unauthenticated requests to dashboard routes redirect to "
            "<font face='Courier'>/login</font>. Role pills in the shell surface the "
            "active duty function during demos.",
        )
    )

    story.append(h2(styles, "4.2 Evidence Registration with SHA-256"))
    story.append(
        p(
            styles,
            "Examiners (and permitted roles) register exhibits via "
            "<font face='Courier'>/evidence/new</font>. The system allocates a unique "
            "human-readable ID, stores intake fields, and computes SHA-256 over the "
            "uploaded buffer (or accepts a double-entered external hash). The digest is "
            "persisted as the immutable baseline for later handoff checks.",
        )
    )
    story.append(
        make_table(
            styles,
            "Table 3: Evidence registration fields captured at ingest.",
            ["Field", "Purpose"],
            [
                ["Evidence ID", "Unique registry key (EVD-YYYY-NNNN pattern)"],
                ["Title / type / case reference", "Inventory and case linkage"],
                ["Intake location & notes", "Context for later custody reporting"],
                ["SHA-256 digest", "Integrity baseline for handoff re-hash"],
                ["Current custodian", "Inventory ownership pointer"],
                ["Status", "e.g., IN_CUSTODY after successful registration"],
            ],
            col_widths=[5.5 * cm, 11.0 * cm],
        )
    )

    story.append(h2(styles, "4.3 Custody Event Ledger"))
    story.append(
        p(
            styles,
            "Each movement is recorded as a custody event with type "
            "(SEIZURE, TRANSFER, EXAMINATION, RETURN), acting user, timestamp, "
            "location, and mandatory reason. The evidence detail page presents a "
            "timeline; the custody module provides a ledger-oriented view. Events are "
            "append-only: correcting history requires a new compensating event, never "
            "silent edits—matching forensic CoC expectations from Phase 1 research.",
        )
    )
    story.append(
        make_table(
            styles,
            "Table 4: Custody event types implemented in Phase 2.",
            ["Event type", "Typical actor", "Effect on inventory"],
            [
                ["SEIZURE", "Custodian / examiner", "Initial intake into system custody"],
                ["TRANSFER", "Current custodian", "Updates current custodian pointer"],
                ["EXAMINATION", "Examiner", "Marks under-examination workflow"],
                ["RETURN", "Examiner / custodian", "Returns item to holding custody"],
            ],
            col_widths=[3.5 * cm, 4.5 * cm, 8.5 * cm],
        )
    )

    story.append(h2(styles, "4.4 Dashboard and Navigation Shell"))
    story.append(
        p(
            styles,
            "The authenticated shell provides sidebar navigation, breadcrumbs, and "
            "overview statistics (counts of evidence, custody activity). Module accents "
            "differentiate Evidence (emerald) and Custody (amber) for rapid orientation "
            "during instructor demos. Routes the user’s role cannot access are hidden "
            "and server-denied.",
        )
    )

    story.append(h2(styles, "4.5 Account Settings Foundation"))
    story.append(
        p(
            styles,
            "Users can view profile attributes and change their own password under "
            "<font face='Courier'>/settings</font>. This supports safe demo hygiene "
            "(rotating the seeded password on shared lab machines) without waiting for "
            "the Phase-3 admin console.",
        )
    )

    story.append(h1(styles, "5 Database Migrations and Seed Data"))
    story.append(
        p(
            styles,
            "Prisma migrations create the relational schema. Seed scripts insert "
            "Group-demo users spanning all four roles so Sir Umar Javaid and peer "
            "reviewers can exercise RBAC without manual user creation.",
        )
    )
    story.append(
        make_table(
            styles,
            "Table 5: Seeded demo accounts (password for all: Password123!).",
            ["Role", "Name", "Email"],
            [
                ["ADMIN", "Muhammad Ozair", "admin@ems.local"],
                ["SUPERVISOR", "Imran Qureshi", "supervisor@ems.local"],
                ["EXAMINER", "Sara Malik", "examiner1@ems.local"],
                ["CUSTODIAN", "Nadia Hussain", "custodian1@ems.local"],
            ],
            col_widths=[3.5 * cm, 5.5 * cm, 7.5 * cm],
        )
    )

    story.append(h1(styles, "6 Verification Performed in Phase 2"))
    story.append(
        make_table(
            styles,
            "Table 6: Phase-2 verification checklist.",
            ["#", "Check", "Result"],
            [
                ["1", "PostgreSQL up; Prisma migrate + seed", "Pass"],
                ["2", "Login as examiner / custodian / supervisor", "Pass"],
                ["3", "Register evidence; SHA-256 stored", "Pass"],
                ["4", "Log TRANSFER with reason; timeline updates", "Pass"],
                ["5", "Custodian cannot open admin-only paths", "Pass"],
                ["6", "TypeScript check (tsc --noEmit)", "Pass"],
                ["7", "Production build of Phase-2 codebase", "Pass"],
            ],
            col_widths=[1.2 * cm, 11.8 * cm, 3.5 * cm],
        )
    )

    story.append(h1(styles, "7 Progress Accounting (50%)"))
    story.append(
        make_table(
            styles,
            "Table 7: Cumulative completion after Phase 2.",
            ["Workstream", "Phase 1", "Phase 2", "Remaining (Phase 3)"],
            [
                ["Research & design", "Done", "—", "—"],
                ["Auth + RBAC core", "Designed", "Done", "Admin UI hardening"],
                ["Evidence + SHA-256", "Specified", "Done", "List polish / filters"],
                ["Custody ledger", "Specified", "Done", "Velocity analytics"],
                ["Integrity re-hash", "Specified", "Not yet", "Full module"],
                ["PDF custody report", "Specified", "Not yet", "Full module"],
                ["Audit trail UI", "Specified", "Partial hooks", "Full module + export"],
                ["Overall project", "25%", "50%", "50%"],
            ],
            col_widths=[4.0 * cm, 3.5 * cm, 4.0 * cm, 5.0 * cm],
        )
    )

    story.append(h1(styles, "8 Results Summary"))
    story.append(
        p(
            styles,
            "Group 2 now has a working laboratory application that satisfies the first "
            "two bullets of the official brief (registration with hashes; custody event "
            "recording) and partially satisfies RBAC. The remaining brief items—"
            "handoff re-hash with printable reports, and full audit depth—are "
            "explicitly reserved for Phase 3 so that progress claims stay honest.",
        )
    )

    story.append(h1(styles, "9 Conclusion"))
    story.append(
        p(
            styles,
            "Phase 2 successfully advanced the Evidence Management System from design "
            "to an operable 50% system. Authentication, SHA-256 ingest, and the custody "
            "ledger form the forensic spine of the product. Phase 3 will complete the "
            "integrity verification loop, custody PDF packaging, audit trail, "
            "administration, and end-to-end verification against the Project 1 brief.",
        )
    )

    story.append(h1(styles, "References"))
    for r in [
        "[1] Group 2 — Phase 1 Report: Evidence Management System (Research & Foundation), NCERT Internship.",
        "[2] NCERT Project 1 brief: Evidence Management System (with Chain of Custody).",
        "[3] Next.js Documentation — App Router & Server Actions.",
        "[4] NextAuth.js Documentation — Credentials provider.",
        "[5] Prisma Documentation — Schema, Migrate, Seed.",
        "[6] NIST FIPS 180-4 — Secure Hash Standard (SHA-256).",
        "[7] B. Carrier, <i>File System Forensic Analysis</i>. Addison-Wesley.",
        "[8] Group 2 Week 3 NCERT laboratory report — formatting reference.",
    ]:
        story.append(Paragraph(r, styles["ref"]))

    story.append(h1(styles, "A Module File Inventory"))
    story.append(
        make_table(
            styles,
            "Table 8: Representative Phase-2 source locations.",
            ["Area", "Path / artefact"],
            [
                ["Login", "src/app/login/page.tsx"],
                ["Dashboard", "src/app/(dashboard)/dashboard/page.tsx"],
                ["Evidence list / new / detail", "src/app/(dashboard)/evidence/**"],
                ["Custody", "src/app/(dashboard)/custody/page.tsx"],
                ["Settings", "src/app/(dashboard)/settings/page.tsx"],
                ["Actions", "src/actions/evidence.ts, custody.ts, account.ts"],
                ["Auth / RBAC", "src/lib/auth*, src/lib/permissions*, middleware"],
                ["Schema", "prisma/schema.prisma + migrations + seed"],
            ],
            col_widths=[5.0 * cm, 11.5 * cm],
        )
    )
    return story


# ---------------------------------------------------------------------------
# PHASE 3 — 100% Completion
# ---------------------------------------------------------------------------

def phase3_body(styles):
    story = []
    story.extend(
        toc_block(
            styles,
            [
                ("Abstract", "2"),
                ("1 Introduction", "2"),
                ("1.1 Objectives", "2"),
                ("1.2 Scope", "3"),
                ("1.3 Tools and Environment", "3"),
                ("2 Continuity from Phases 1–2", "3"),
                ("3 Module Implementation — Remaining 50%", "4"),
                ("3.1 Integrity Re-Hash and Flag Resolution", "4"),
                ("3.2 Printable Custody Reports (PDF)", "5"),
                ("3.3 Full Audit Trail", "5"),
                ("3.4 Admin User Management", "6"),
                ("3.5 Landing, Login Polish, and UX Hardening", "6"),
                ("4 End-to-End Verification", "7"),
                ("5 Brief Compliance Matrix (100%)", "8"),
                ("6 Results Summary", "9"),
                ("7 Conclusion", "9"),
                ("References", "10"),
                ("A Smoke / Demo Checklist", "10"),
                ("B Role Permission Matrix (Final)", "11"),
            ],
        )
    )

    story.append(Paragraph("Abstract", styles["abstract_title"]))
    story.append(
        p(
            styles,
            "This report documents <b>Phase 3 — final completion (100%)</b> of Group 2’s "
            "NCERT Digital Forensics Internship project <i>Evidence Management System "
            "(with Chain of Custody)</i>, supervised by <b>Sir Umar Javaid</b>. Phase 3 "
            "delivers the remaining half of the platform: handoff re-hashing with "
            "integrity flags and supervisor resolution, printable custody PDF reports, "
            "a full filterable audit trail with export, admin user management, and "
            "presentation-ready landing/login surfaces. Automated smoke verification, "
            "TypeScript checks, and role-permission tests confirm that all four bullets "
            "of the official Project 1 brief are satisfied. The system is ready for "
            "internship demonstration and submission.",
        )
    )

    story.append(h1(styles, "1 Introduction"))
    story.append(
        p(
            styles,
            "Phases 1 and 2 produced research, architecture, authentication, evidence "
            "ingest with SHA-256, and a custody ledger. Phase 3 closes the forensic "
            "loop: <b>prove integrity on movement</b>, <b>package custody history for "
            "printing</b>, <b>retain a system-wide audit trail</b>, and "
            "<b>administer users under least privilege</b>. Completion is claimed only "
            "after verification against the Project 1 brief.",
        )
    )

    story.append(h2(styles, "1.1 Objectives"))
    story.append(
        bullets(
            styles,
            [
                "Implement re-hash on custody handoff with mismatch flagging and movement blocks.",
                "Provide supervisor resolution of integrity flags with written notes.",
                "Generate printable per-item custody reports (PDF) including hashes.",
                "Expose a full audit trail UI with filters and CSV export.",
                "Deliver admin user create / role change / soft-deactivate flows.",
                "Polish public landing and login for NCERT demonstration quality.",
                "Run smoke, typecheck, build, and role-matrix verification; map results to the brief.",
            ],
        )
    )

    story.append(h2(styles, "1.2 Scope"))
    story.append(
        p(
            styles,
            "Phase 3 covers all remaining functional brief items and final verification. "
            "Hardware acquisition, mobile device imaging, and national case-management "
            "integration remain outside the internship deliverable, consistent with the "
            "original “digital evidence inventory + custody ledger” framing.",
        )
    )

    story.append(h2(styles, "1.3 Tools and Environment"))
    story.append(
        make_table(
            styles,
            "Table 1: Final toolchain for Phase 3 completion and verification.",
            ["Component", "Details"],
            [
                ["Application", "Next.js 14 + TypeScript + Tailwind + shadcn/ui"],
                ["Data", "PostgreSQL + Prisma (migrate, seed)"],
                ["Auth / RBAC", "NextAuth JWT + can()/requirePermission()"],
                ["Integrity", "Server-side SHA-256 recompute on handoff"],
                ["Reports", "@react-pdf/renderer custody package"],
                ["Verification", "npm run smoke, tsc --noEmit, lint, build"],
                ["Demo URL", "http://localhost:3000 (lab environment)"],
            ],
            col_widths=[4.0 * cm, 12.5 * cm],
        )
    )

    story.append(h1(styles, "2 Continuity from Phases 1–2"))
    story.append(
        make_table(
            styles,
            "Table 2: How Phase 3 closes open requirements from earlier phases.",
            ["Open item after Phase 2", "Phase 3 delivery"],
            [
                ["FR-06 Re-hash on handoff / flag mismatches", "Integrity module + custody gate"],
                ["FR-07 Supervisor resolution", "/integrity resolve workflow"],
                ["FR-08 Printable custody report", "PDF generate + download"],
                ["FR-10 Full audit trail", "/audit table, filters, CSV export"],
                ["Admin user lifecycle", "/admin/users"],
                ["Demo surface polish", "Landing page + upgraded login"],
            ],
            col_widths=[8.0 * cm, 8.5 * cm],
        )
    )

    story.append(h1(styles, "3 Module Implementation — Remaining 50%"))
    story.append(h2(styles, "3.1 Integrity Re-Hash and Flag Resolution"))
    story.append(
        p(
            styles,
            "On custody handoffs involving file-backed exhibits, the server recomputes "
            "SHA-256 and compares it to the baseline digest. A mismatch sets status "
            "<font face='Courier'>INTEGRITY_FLAGGED</font>, records the check, surfaces "
            "a hard warning, and blocks routine further transfers until a supervisor "
            "(or admin) records a written resolution. This implements the brief’s "
            "“re-hash on each handoff to flag data mismatches” requirement without "
            "ever silently replacing the original hash.",
        )
    )

    story.append(h2(styles, "3.2 Printable Custody Reports (PDF)"))
    story.append(
        p(
            styles,
            "From the reports workflow (and evidence detail), authorised roles generate "
            "a custody report PDF containing exhibit identity, baseline hash "
            "(monospace), chronological custody events, and integrity outcomes. The "
            "layout follows a formal laboratory style suitable for packaging with case "
            "materials during internship demonstration.",
        )
    )

    story.append(h2(styles, "3.3 Full Audit Trail"))
    story.append(
        p(
            styles,
            "Security-relevant actions—login, evidence create, custody events, integrity "
            "flags/resolutions, report generation, user administration—append to "
            "<font face='Courier'>AuditLogEntry</font>. The <font face='Courier'>/audit</font> "
            "module provides filtering, expandable metadata, and CSV export. There is "
            "no update/delete API for audit rows, preserving append-only semantics "
            "argued in Phase 1.",
        )
    )

    story.append(h2(styles, "3.4 Admin User Management"))
    story.append(
        p(
            styles,
            "Administrators manage the user directory: create accounts (temporary "
            "password shown once), change roles, and soft-deactivate users. This "
            "supports sustainable lab use beyond the four seeded personas and "
            "completes organisational control around the three brief-named roles plus "
            "admin.",
        )
    )

    story.append(h2(styles, "3.5 Landing, Login Polish, and UX Hardening"))
    story.append(
        p(
            styles,
            "A public landing page explains the platform’s forensic value (hashing, "
            "custody, RBAC, audit) for NCERT audiences. The login experience includes "
            "demo account affordances for rapid role switching during viva-style "
            "walkthroughs. Loading skeletons, empty states, and module accents improve "
            "clarity without changing security behaviour.",
        )
    )

    story.append(h1(styles, "4 End-to-End Verification"))
    story.append(
        make_table(
            styles,
            "Table 3: Automated and manual verification results at completion.",
            ["#", "Verification", "Result"],
            [
                ["1", "npm run smoke (routes, RBAC matrix, PDF render, actions)", "PASSED"],
                ["2", "npx tsc --noEmit", "PASSED"],
                ["3", "npm run lint", "PASSED"],
                ["4", "npm run build", "PASSED"],
                ["5", "Register → transfer → mismatch → resolve → PDF → audit", "PASSED (manual)"],
                ["6", "Custodian denied /admin and /audit", "PASSED"],
                ["7", "Public / and /login HTTP 200; protected routes gated", "PASSED"],
            ],
            col_widths=[1.2 * cm, 11.8 * cm, 3.5 * cm],
        )
    )

    story.append(h1(styles, "5 Brief Compliance Matrix (100%)"))
    story.append(
        make_table(
            styles,
            "Table 4: Official Project 1 scope versus final system (complete).",
            ["Brief requirement", "System fulfilment", "Primary modules"],
            [
                [
                    "Register items with unique IDs, intake, SHA-256 at ingest",
                    "Complete",
                    "/evidence, /evidence/new",
                ],
                [
                    "Record seizure/transfer/examination/return with handler, time, location, reason",
                    "Complete",
                    "/custody + evidence timeline",
                ],
                [
                    "Re-hash on handoff; flag mismatches; printable custody report",
                    "Complete",
                    "/integrity + PDF reports",
                ],
                [
                    "RBAC (custodian, examiner, supervisor) + full audit trail",
                    "Complete (+ admin)",
                    "middleware, /audit, /admin/users",
                ],
            ],
            col_widths=[5.8 * cm, 2.7 * cm, 8.0 * cm],
        )
    )

    story.append(
        make_table(
            styles,
            "Table 5: Cumulative phase progress to 100%.",
            ["Phase", "Weight", "Outcome"],
            [
                ["Phase 1", "25%", "Research, requirements, architecture, RBAC/data design"],
                ["Phase 2", "25% → 50%", "Auth, evidence+SHA-256, custody ledger, dashboard core"],
                ["Phase 3", "50% → 100%", "Integrity, PDF, audit, admin, polish, verification"],
                ["Project status", "100%", "Ready for NCERT internship submission / demo"],
            ],
            col_widths=[3.5 * cm, 3.5 * cm, 9.5 * cm],
        )
    )

    story.append(h1(styles, "6 Results Summary"))
    story.append(
        p(
            styles,
            "The completed system is a working Evidence / inventory management "
            "application: exhibits receive unique IDs and SHA-256 baselines; every "
            "custody event is attributed and timed; handoffs re-hash and flag "
            "mismatches; supervisors resolve flags; printable reports package the "
            "ledger; and roles plus audit logging protect and explain system activity. "
            "Automated smoke verification and manual scenario testing support the "
            "100% completion claim.",
        )
    )

    story.append(h1(styles, "7 Conclusion"))
    story.append(
        p(
            styles,
            "Across three phases, Group 2 researched, built, and verified an Evidence "
            "Management System with Chain of Custody aligned to the NCERT Project 1 "
            "brief. Phase 1 justified the forensic controls; Phase 2 implemented the "
            "operational spine; Phase 3 closed integrity, reporting, audit, and "
            "administration. Under the supervision of Sir Umar Javaid, the team "
            "submits this Phase-3 report as the formal completion record of the "
            "internship software deliverable.",
        )
    )

    story.append(h1(styles, "References"))
    for r in [
        "[1] Group 2 — Phase 1 Report: Research & Foundation (25%), NCERT Digital Forensics Internship.",
        "[2] Group 2 — Phase 2 Report: Core Modules (50%), NCERT Digital Forensics Internship.",
        "[3] NCERT Project 1 brief: Evidence Management System (with Chain of Custody).",
        "[4] NIST FIPS 180-4 — Secure Hash Standard.",
        "[5] E. U. Haque et al., “Cyber forensic investigation infrastructure of Pakistan,” <i>IEEE Access</i>, 2023.",
        "[6] Next.js / NextAuth / Prisma / @react-pdf/renderer official documentation.",
        "[7] SWGDE Best Practices for Computer Forensics.",
        "[8] Group 2 Week 3 NCERT laboratory report — Digital Forensic Investigation Report format reference.",
    ]:
        story.append(Paragraph(r, styles["ref"]))

    story.append(h1(styles, "A Smoke / Demo Checklist"))
    story.append(
        make_table(
            styles,
            "Table 6: Recommended instructor demonstration sequence.",
            ["Step", "Action", "Expected result"],
            [
                ["1", "Login as examiner1@ems.local", "Dashboard accessible"],
                ["2", "Register evidence with file upload", "EVD-ID + SHA-256 stored"],
                ["3", "Log TRANSFER to custodian", "Timeline + toast confirmation"],
                ["4", "Alter bytes; attempt handoff", "Integrity flag; movement blocked"],
                ["5", "Login as supervisor; resolve flag", "Written resolution; audit entry"],
                ["6", "Generate custody PDF", "Downloadable report with hashes"],
                ["7", "Open /audit as supervisor", "Ordered activity including mismatch"],
                ["8", "Login as custodian; hit /admin", "Denied / redirected"],
            ],
            col_widths=[1.2 * cm, 7.3 * cm, 8.0 * cm],
        )
    )

    story.append(h1(styles, "B Role Permission Matrix (Final)"))
    story.append(
        make_table(
            styles,
            "Table 7: Final RBAC matrix verified by smoke tests.",
            ["Area", "Custodian", "Examiner", "Supervisor", "Admin"],
            [
                ["Dashboard / Evidence / Custody", "Yes", "Yes", "Yes", "Yes"],
                ["Integrity re-hash", "No", "Yes", "Yes", "Yes"],
                ["Integrity resolve", "No", "No", "Yes", "Yes"],
                ["Reports (PDF)", "No", "Yes", "Yes", "Yes"],
                ["Audit trail", "No", "No", "Yes", "Yes"],
                ["Admin users", "No", "No", "No", "Yes"],
                ["Account settings", "Yes", "Yes", "Yes", "Yes"],
            ],
            col_widths=[5.5 * cm, 2.75 * cm, 2.75 * cm, 2.75 * cm, 2.75 * cm],
        )
    )
    return story


def main():
    common_members = [
        "Muhammad Ozair Khalid",
        "Zakia Qayyum",
        "Uniba Fatima",
    ]
    integrity = (
        "All design, implementation, and verification activities were performed on an "
        "isolated, instructor-authorized laboratory / development system for the NCERT "
        "Digital Forensics Internship. No production case systems or third-party "
        "operational evidence stores were accessed at any stage of this project."
    )

    p1 = {
        "title": "Evidence Management System<br/>(with Chain of Custody)",
        "subtitle_lines": [
            "Phase 1 Report — Research, Requirements, and System Foundation",
            "25% Project Completion",
        ],
        "group": "Group 2",
        "members": common_members,
        "instructor": "Sir Umar Javaid",
        "course": "Digital Forensics Internship — Project Completion Phase 1",
        "platform": "Research & Design · Next.js / PostgreSQL architecture planning",
        "submission": "July 2026",
        "progress": "25% Complete (Foundation)",
        "integrity": integrity,
    }
    p2 = {
        "title": "Evidence Management System<br/>(with Chain of Custody)",
        "subtitle_lines": [
            "Phase 2 Report — Core Operational Modules",
            "50% Project Completion",
        ],
        "group": "Group 2",
        "members": common_members,
        "instructor": "Sir Umar Javaid",
        "course": "Digital Forensics Internship — Project Completion Phase 2",
        "platform": "Next.js 14 · PostgreSQL · Prisma · NextAuth · SHA-256",
        "submission": "July 2026",
        "progress": "50% Complete (Core Modules)",
        "integrity": integrity,
    }
    p3 = {
        "title": "Evidence Management System<br/>(with Chain of Custody)",
        "subtitle_lines": [
            "Phase 3 Report — Final Modules, Verification, and Project Completion",
            "100% Project Completion",
        ],
        "group": "Group 2",
        "members": common_members,
        "instructor": "Sir Umar Javaid",
        "course": "Digital Forensics Internship — Project Completion Phase 3",
        "platform": "Next.js 14 · PostgreSQL · Prisma · NextAuth · SHA-256 · PDF Reports",
        "submission": "July 2026",
        "progress": "100% Complete (Submitted Deliverable)",
        "integrity": integrity,
    }

    paths = [
        build_doc("Group2_EMS_Phase1_25pct.pdf", p1, phase1_body),
        build_doc("Group2_EMS_Phase2_50pct.pdf", p2, phase2_body),
        build_doc("Group2_EMS_Phase3_100pct.pdf", p3, phase3_body),
    ]
    for path in paths:
        print(f"Wrote {path}")


if __name__ == "__main__":
    main()
