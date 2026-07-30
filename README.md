# EMS · Chain of Custody (`ems-coc`)

Evidence Management System — digital evidence inventory with a tamper-evident chain-of-custody ledger.

**Current state:** all modules are live — evidence, custody, integrity, reports, audit, dashboard, admin user management, account settings, global search, and polish (toasts, responsive shell, empty/loading states).

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma
- NextAuth (Credentials + JWT) with role-based middleware
- Recharts for dashboard charts, `@react-pdf/renderer` for custody reports
- Node `crypto` SHA-256, computed server-side only
- File storage: local `/uploads` in dev, S3-compatible when `STORAGE_MODE=s3`

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres (Docker)
npm run db:up

# 3. Environment
cp .env.example .env
# Edit NEXTAUTH_SECRET to a long random string before any real deploy.

# 4. Migrate + seed demo users
npx prisma migrate dev
npm run db:seed

# 5. Dev server
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

### Environment variables (see `.env.example`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App origin (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `STORAGE_MODE` | `local` (default) or `s3` |
| `S3_*` | Bucket/credentials when `STORAGE_MODE=s3` |
| `ORGANIZATION_NAME` | Optional PDF letterhead text |

## Seeded accounts

Password for all: `Password123!`

| Role       | Name           | Email                 |
|------------|----------------|-----------------------|
| ADMIN      | Muhammad Ozair | admin@ems.local       |
| SUPERVISOR | Imran Qureshi  | supervisor@ems.local  |
| EXAMINER   | Sara Malik     | examiner1@ems.local   |
| EXAMINER   | Hassan Raza    | examiner2@ems.local   |
| CUSTODIAN  | Nadia Hussain  | custodian1@ems.local  |
| CUSTODIAN  | Bilal Ahmed    | custodian2@ems.local  |

## RBAC (route + server-action gating)

| Area | CUSTODIAN | EXAMINER | SUPERVISOR | ADMIN |
|------|-----------|----------|------------|-------|
| Dashboard / Evidence / Custody | Yes | Yes | Yes | Yes |
| Integrity (re-hash) | No | Yes | Yes | Yes |
| Integrity resolve | No | No | Yes | Yes |
| Reports | No | Yes | Yes | Yes |
| Audit trail | No | No | Yes | Yes |
| Admin users | No | No | No | Yes (only) |
| Account settings | Yes | Yes | Yes | Yes |

Every protected page re-checks `can()` server-side. Every mutation in `src/actions/*` calls `requirePermission(...)` independently.

## Smoke-test checklist (NCERT demo)

Run this manually before presenting. Tick each box only after you see the expected result.

1. **Register evidence** — Sign in as `examiner1@ems.local` → `/evidence` → Register New Evidence (upload a small file). Confirm emerald toast “Evidence registered” and a new `EVD-YYYY-NNNN` ID.
2. **Transfer custody #1** — Open the item → Log Custody Event → TRANSFER to `custodian1`. Confirm amber toast and timeline update.
3. **Transfer custody #2** — As the receiving custodian (or with supervisor override), transfer again to another active user. Confirm second timeline node.
4. **Deliberate hash mismatch** — For a file-backed item, alter the bytes under `uploads/`, then attempt another custody event. Confirm crimson hard warning, `INTEGRITY_FLAGGED` status, and toast about blocked transfer. The event must still appear in the ledger/audit trail.
5. **Blocked movement** — Confirm the item stays flagged and further normal handoffs require supervisor resolution.
6. **Resolve as supervisor** — Sign in as `supervisor@ems.local` → `/integrity` → Review & Resolve with a written note. Confirm status returns to `IN_CUSTODY` (or stays flagged if you chose keep-flagged) and an audit entry is written.
7. **Generate PDF** — Evidence detail → Reports tab → Generate Custody Report (PDF). Confirm violet toast and a downloadable PDF with monospace hashes (works on mobile viewport too).
8. **Audit trail order** — `/audit` as supervisor/admin. Confirm entries for create → transfers → mismatch → resolution → report appear in reverse-chronological order with expandable metadata.
9. **CUSTODIAN RBAC** — Sign in as `custodian1@ems.local`. Confirm `/admin/users` and `/audit` redirect to the dashboard with a forbidden banner; Admin / Audit nav items are hidden.
10. **Global search** — From the top bar, search an Evidence ID and a user name; confirm grouped Evidence / Users dropdown results.
11. **Responsive shell** — Shrink the viewport: under 1024px sidebar is icon-only; under 768px it becomes an off-canvas drawer opened via the menu button. Tables switch to stacked cards on narrow screens.

## Demo walkthrough (longer tour)

1. Sign in as an examiner — sidebar shows real name + role badge.
2. Register evidence with upload or externally computed hash (double-entry).
3. Move through custody; watch chain-integrity stepper.
4. Trigger mismatch; resolve as supervisor.
5. Generate report; inspect audit CSV export.
6. Compare dashboards (supervisor command centre vs custodian held-items view).
7. As admin, create a user (temp password shown once), change a role, soft-deactivate.
8. `/settings` — change your own password; review personal activity.

## Design tokens

| Module | Accent | Hex |
|--------|--------|-----|
| Dashboard / Overview | Graphite | `#3F4A5A` |
| Evidence Registry | Emerald | `#107C10` |
| Chain of Custody | Amber | `#D29200` |
| Integrity & Hash Verification | Crimson | `#D13438` |
| Reports | Violet | `#8764B8` |
| Audit Trail | Teal | `#00B7C3` |
| Admin / RBAC | Slate | `#5C6B7A` |

Sidebar `#0B0E14` · Canvas light `#F5F6F7` · Canvas dark `#14161C`.

Status / role pill text colours are darkened vs raw accents so crimson-on-white and amber-on-white meet WCAG AA for small text. Reports use a LaTeX / Overleaf–inspired PDF layout (Times serif body, Courier hashes, booktabs rules, numbered sections).
