# Version 3 — Reports-First CMS Frontend

**Latest update:** Added specialized printable A4 landscape reports, date-range ledger balances, Closed-date Sales, RFP-linked COGS, denomination cash-count sheets, separate Friday Sales/Funds Turnovers and configurable print logo/signatories. See `REVISION_STATUS_V3.md` for details and remaining limitations. **Supabase is not yet connected.**

**Report previews:** Log in → Reports → choose report type → select branch (Admin must pick one) and date range → Preview Selected Report → Print / Save as PDF. To upload your official logo and signatory names, use Admin → Settings.

**Very important:** Frontend is an insecure *local demo*. Export JSON before upgrades. Existing v2 browser data is preserved under the same localStorage key. PDF originals are not merged into the image-receipts printable report. Full production build remains unverified until dependencies are installed.

---

# Underchargers Fund Management System — PWA Frontend (v3.0)

**Frontend-first prototype** for Underchargers / Mastermind, covering **Cashier**, **PB (Parts Buyer)**, and **Admin** across UC Quezon City, UC Mandaluyong, UC Las Piñas and MM Mandaluyong.

This is a **Next.js 15 + React 19 + TypeScript + Tailwind CSS** installable Progressive Web App. The visual system uses white, yellow, neutral grays and compact, responsive layouts. **Supabase is planned but NOT connected.** Everything currently runs in browser-local demo mode.

## Run locally

1. Install **Node.js 20.9+** (Node 22 recommended).
2. Open a terminal in this folder.
3. Run `npm install` (requires access to npm registry).
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

For a deployable build run `npm run build` then `npm run start`, or upload this project to GitHub and import it in Vercel as a Next.js project. PWA/service workers require **HTTPS or localhost**.

### Demo accounts

| Role | Username | Password |
|---|---|---|
| Cashier | `cashier` | `cashier12345` |
| Parts Buyer | `pbacc` | `pb12345` |
| Admin | `admin` | `admin12345` |

Use the login page account shortcut buttons to fill credentials. These are **insecure demo accounts only**; never use these credentials or this local login system for real funds.

## Working frontend features

**Cashier:** Dashboard; POS quotations → add services/parts/COGS → multi-method payment → close; additional linked POS transaction for completed sales; read-only completed Sales; Revolving Fund expense with auto transaction numbers, VAT/Non-VAT, payee, voucher, receipt number, TIN, category, description, notes, receipt upload, signature pad; immediate RF deduction while Pending; replenishment request (balance credited only after Admin approval); Opening/Closing cash counts; 9 AM late-opening mandatory report; 4 PM closing alert; following-login missed-closing report; discrepancies; mandatory report lock; Friday turnover; CSV/printable reports.

**PB:** Parts-only RFP purchases with a plate per part entry, quantity/unit cost/receipt; one-time match to a POS in the same branch with exactly matching normalized plate; replenishment requests; edit requests and branch change requests, subject to Admin review; RFP and POS reference reports. No RF expense creation or POS edits.

**Admin:** Consolidated dashboard; four-branch selector; RF/RFP/POS/cash count monitoring; fund approvals, rejection with audit/history-based reversal, required expense explanations; RFP correction and branch change request decisions; incident review; exports and audit trail; create/activate/deactivate demo users; configure RF category list and illustrative starting fund balances; backup and reset local data.

### Important business rules

- RF expenses: **deduct as soon as saved**, status **Pending** until Admin approves or requires an explanation. A rejected expense remains in history and reverses the provisional balance deduction.
- Replenishment: pending requests **do not increase balances**. Approved additions increase the balance.
- RFP: *parts only*. Prototype treats pending parts expenses as reserved/deducted funds; confirm final RFP accounting behavior before backend migration.
- A missing BOD after **9 AM** creates a required report; missing EOD on the prior active date creates a report on the **next login**. A discrepancy also creates a required report. A **Required** report prevents new financial entry until it is submitted.
- EOD reminder begins **4 PM**; EOD deadline is **6 PM**. Official time zone is `Asia/Manila`.
- Opening Cash Count uses the previous recorded EOD as expected amount. First-ever BOD is a baseline; EOD estimate uses opening count + today's POS cash payments - recorded turnover. **These are provisional formulas pending confirmation**, not certified cash-accounting logic.
- One purchased RFP part entry may link to **only one** matching POS. Linked entries cannot change branch or plate through standard corrections.
- Generated RF format: `UCM-Rotating Fund-00000001` (literal name as requested; formal naming can be confirmed before production). POS/RFP follow `UCM-POS-00000001` and `UCM-RFP-00000001`.

## Responsive/PWA notes

- Full navigation on wide desktop; compact slide-out navigation on tablet; bottom navigation and full-screen-friendly forms on mobile.
- Installable manifest and 192/512 PNG icons; lightweight service worker caches visited pages and static scripts/styles. **Offline availability is best-effort for previously visited screens** (not a guarantee after first visit); do not treat offline submissions as synchronized records.
- Touch signature pad and standard mobile file picker (camera options depend on browser/device).
- Includes print styles and CSV export.

## Prototype limitations — read before using financial data

- All changes are saved using `localStorage` in the **current browser profile only**. They are **NOT shared** between multiple devices or branches and may be lost on browser cleanup. Export JSON backups for test data.
- No real authentication, trusted role enforcement, server timestamps, server-side unique-number generation, background server notifications, or data recovery. Frontend permission checks are **not a security boundary**.
- Receipt and signature data stored inline in browser storage; image/PDF uploads are limited to **1.6 MB** to reduce quota issues. For production, use private Supabase Storage and upload policies.
- Initial RF ₱50,000 and RFP ₱120,000 per branch are **ILLUSTRATIVE TEST DATA, not official approved starting amounts**. The 11 Revolving Fund categories were approved and included in v2.
- POS cash-accountability settlement, denomination-based cash count, VAT/BIR details, final Friday turnover deadlines, and reconciliation treatment need final finance approval.
- Installable PWA is not a substitute for proper multi-user sync. Backend migration must implement Supabase Auth, PostgreSQL, RLS, transactional ledger writes, immutable audit and correction events, managed receipts/signatures, scheduled deadline jobs/alerts, and robust concurrency handling.

## Test walkthrough

1. Sign in as Cashier. If it is after 9 AM, first submit the auto-created **Missed Opening** explanation (mandatory lock demonstration).
2. Open Cash Accountability and enter BOD. Use Opening again to verify duplicate entry is blocked.
3. Open Revolving Fund → **Record Expense**, choose category, amount, upload an image/PDF under 1.6 MB, sign, and save. Balance decreases immediately and the entry shows **Pending**.
4. Logout; Admin → Approvals & Exceptions → open that record → Approve or Require Report. Required expense reports block Cashier until submitted.
5. Cashier → POS & Sales → New POS → Add service/part with unit COGS → Add Cash/GCash payment → Close POS → check Sales. Create linked transaction for additional work.
6. PB → RFP → Record Parts using the same plate as a POS → open entry → select and link matching POS once → verify it cannot be linked again.
7. PB → Request Edit / Branch Change → Admin → Approve/Reject with audit trail.
8. Try the user management/category settings and reports. Refresh to verify browser-local persistence; export JSON before resetting data.
9. Test in Chrome responsive mode (375px, 768px, 1024px and wide desktop), and install from HTTPS or localhost.

## Visual preview without installation

Open `design-preview.html` locally to see a **static, non-interactive** desktop/mobile dashboard layout. The working app is the Next.js PWA started with `npm run dev`. The preview does not substitute for actual role/workflow testing.

## Files

- `app/page.tsx` — all role-based UI/screens and event handlers.
- `app/globals.css` — white/yellow visual system, compact forms, responsive layouts, printing.
- `components/Ui.tsx` — reusable inputs, status, modals, file upload, signature pad.
- `lib/data.ts` — typed domain model, 11 approved RF categories, sample records, local persistence, balances, numbering.
- `lib/print.ts` — A4 landscape 30-row/page disbursement preview and separate supporting-receipt print view.
- `public/manifest.webmanifest`, `public/sw.js`, `public/icons/` — PWA support.
- `tests/logic-smoke.cjs` — simple financial ledger and numbering checks (run `npm run test:logic` after installing packages).

## Next phase

Finalize UX and unanswered policy decisions, then swap local repositories with Supabase adapters without changing the screen structure. Do not use this demo for actual bank, payroll or legal bookkeeping transactions.

## Frontend revision v2 — 2026-10-16

- Updated 11 **approved** RF expense categories: Gasoline / Fuel, Transportation, Parking / Toll Fees, Food / Grocery, Office Supplies, Cleaning Supplies, Repairs & Maintenance, Utilities, Miscellaneous, Staff Welfare, Client Expense. Prior record labels are retained for audit.
- Category expense breakdown, category filter, compact disbursement summary per branch (beginning, expenses, deposits, remaining, requested amount).
- PB RFP form: reusable supplier suggestions, automatically identified matching POS records by plate/branch, date/customer selection for repeat transactions, and Parts Buyer signature. Existing one-time POS pinning remains enforced.
- RFP corrections now request part description, quantity, unit cost, total, supplier, plate and linked POS (or a separate branch change); Admin sees original/requested field values, with audit detail. Linked/pinned POS and plate cannot be changed through edit.
- POS details now display linked transaction history across related extensions; new payments/COGS entry remains available while Pending.
- Required explanation popup on cashier login, 9AM BOD and 4PM EOD alerts, discrepancy confirmation. Existing task-locking remains in effect until report submitted.
- Friday Turnover requires Friday and signature; weekly amount is accumulated from closed cash sales since previous turnover; still subject to finance-team validation of final cut-off rules.
- Branch disbursement print preview uses **A4 landscape, up to 30 transactions per printed page** and includes category breakdown for RF. Receipts use a **separate print-ready view**. In the browser print dialog choose **Save as PDF** for independent files. Browser-based print previews are not server-generated PDFs. Images print directly; **original uploaded PDF receipts must be opened/printed separately** (not merged into the receipt packet). Signature lines are placeholders on generated reports and are not digitally routed for approval yet.
- Admin fund approvals now offer a status filter; dashboard financial summaries open relevant modules, role-specific financial cards avoid cross-role RF/PB access.
- Demo account password change, JSON backup/restore, sample-data reset, category editing, and branch fund baseline controls.
- Corrected desktop login screen grid so the dark branding pane no longer occupies a misplaced second row. Responsive refinements for tablet and mobile.

**Unimplemented or awaiting confirmation:** automatic downloadable PDF combining PDF receipt attachments, true 30-row pagination on every report subtype, production background deadline alerts when the app isn't open, backend-enforced audit/access controls, approval signatures on printed forms, bank/check settlement rules. Supabase remains intentionally **disconnected**.

**Do not use browser-local prototype for actual financial processing.**
