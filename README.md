# Underchargers Fund Management System — v8 Frontend

> **Important:** v8 adds browser-local barcode inventory, locked Stock Out with Admin-reviewed return requests, and split POS Draft COGS. Production Supabase security is not yet connected. [Read V8 status](REVISION_STATUS_V8.md).

# Version 7 Update — Separate Branch Revolving Funds & Disbursement Sign-off

See [REVISION_STATUS_V7.md](REVISION_STATUS_V7.md) for approved rules, changes, print testing and integration limitations. The Cashier prepares its own branch RF replenishment and PB prepares its own branch RFP replenishment. Each of four branches has independent cash balances and the Admin report shows four per-branch totals. Prepared by / Verified by Accounting / Approved by President form the intended signatory workflow; browser-local approvals are explicitly simulated until both applications share Supabase.

---

# Version 6 — Guided Cashier POS & Auto PB Parts Matching

**Current frontend update (Supabase intentionally disconnected):**

- Cashier creates sale in three steps: **1. Plate + vehicle + customer (search/auto-fill)** → **2. Manual services/parts** → **3. Review COGS, with matching PB parts shown**. Save creates Pending POS, links unassigned PB parts by exact normalized uppercase plate and branch, then opens payments.
- PB now records multiple parts/suppliers under **one purchase transaction number and total payment**; individual lines remain available for COGS and reports. Missing receipts can be added later in saved transaction details without rewriting expense amounts.
- PB manual POS-link action removed. Already-linked parts are never linked again. Historical visits with same plate can populate customer/vehicle suggestions, but unassigned parts are linked to the **newly created** Cashier POS rather than to a random old visit.
- BOD directs Cashier to count at 8:30 AM if incomplete, due by 9 AM; EOD count opens at 4 PM. **EOD and Daily Sales Turnover are due at 6 PM**. Sales only; no Funds Turnover. Missing required reports block entry.
- Compatible with existing `underchargers-fund-management-demo-v1` browser-local records. **Always export JSON before deployment.**

**Prototype limits:** Multi-user cross-device sync and secure role enforcement require Supabase in a later phase. Production build/browser E2E test may remain unverified until dependencies are installed.

---

# Underchargers Fund Management System PWA — Version 5 (Frontend Only)

**Latest approved revisions (17 October 2026):**

- **Daily turnover is for SALES ONLY.** Funds Turnover has been removed from user-facing workflows and printable report choices. Prior local demo history is preserved for reference.
- **Cashier BOD:** From **8:30 AM Philippine time**, if the day's BOD has not been submitted and no mandatory incident report is outstanding, the PWA automatically directs the Cashier to the Opening Cash Count modal. The cashier must complete BOD before new entries. The **9:00 AM deadline**, missed-BOD mandatory report, **4:00 PM closing alert**, **6:00 PM closing deadline**, and next-login missed-closing incident behavior remain.
- **Literal cash count:** Cashier inputs ONLY quantities by denomination. Total counted cash is computed automatically. No editable separate Actual Amount field and no Expected Balance / variance shown during entry. Expected and variance remain behind the scenes for audit and mandatory discrepancy reporting after submission.
- **POS and PB vehicle:** Exactly **two vehicle entry controls** — searchable **Brand & Model** (select e.g. Toyota Vios by searching `Vios`) plus a separate **Year**. The local reference currently includes commonly used car models for frontend testing; it is not a complete automotive catalogue. The saved POS vehicle or PB parts-purchase Car is, for example, `Toyota Vios 2020`. If a POS with a single matching plate exists, the PB form automatically fills the car from that POS; for repeat visits the PB selects the exact POS. There is no separate Vehicle Master in the Cashier navigation.
- **Reports:** **Monthly Parts Expenses** tab sits beside **Fund Transactions** and **POS & Sales**. Access is limited to PB/Admin. Monthly (current month automatically) and Custom Date Range are available. Table and printable format include Date, Part, Supplier, Plate Number, **Car**, **Branch**, Qty, Unit Cost, Total Amount, Linked POS, Receipt and Status. The report retains its RFP transaction reference number in printable form.
- **PB Disbursement/Replenishment:** Separate printable report covering **eligible parts expenses created after the last approved disbursement request was submitted**, so items purchased while that request was awaiting approval are not skipped. There is no manual requested-fund amount. Replenishment documents put the details and summary/signatures together on the final printable sheet when space allows. Note: server-controlled completion/settlement confirmation will be required later in Supabase production.

**Deployment:** Install dependencies (`npm install`), run `npm run dev`, and visit localhost:3000; import into GitHub/Vercel for review. PWA manifest and service worker retained, with responsive white-and-yellow design for mobile/tablet/desktop.

**Data:** Supabase is still disconnected; data remains in existing browser `localStorage` key, so v4 demo records should persist on the same browser/origin. Back up data with Admin → Settings → JSON Export before replacing deployments, because storage can be cleared and test credentials are not secure.

**Tests:** `npm run test:logic` includes the v5 logic and TSX syntax smoke tests; financial calculation and preview-HTML test fixtures pass. A full `next build`, UI end-to-end test and real PDF page-count verification for all new v5 templates are **NOT verified here** because npm registry dependency downloads were unreachable and headless printing timed out. Do not treat this as production-ready financial software.

---

# Version 4 — Combined Disbursement and Fund Replenishment

The Disbursement form IS the request for reimbursement of spent fund money. It is **not a separate new-fund request** and there is **no user-entered request amount**. The request is automatically calculated as the difference between the authorized fund target and current cash on hand, less any already approved replenishments, with rejected expenses reversed. RF and RFP are calculated separately for each branch.

**One printable report:** The expense/voucher table and the replenishment computation, deposit/reference details, category subtotals (RF) and prepared/checked/approved signatories now share the same report. A4 landscape is designed to hold **up to 30 expenses plus summary and signatures on one sheet** when content fits, otherwise the table paginates and the combined summary appears on the last detail page. Actual Chromium-generated PDFs for 30/31/60/61 fixtures were examined and page-count tested. Very long content, unusual custom logos, or many deposits can require extra pages.

**Date filters:** Opening balance includes earlier transactions; selected-period expenses and approved deposits are separately totaled; the closing balance and amount still to replenish reflect any unreplenished cash carried forward. That carryover is explicitly disclosed so it is not confused with only the selected-period expenses.

**Workflow:** Navigate to Cashier → Revolving Fund or PB → Parts Fund, choose Prepare Disbursement, view the automatic replenishment amount, preview the combined printable report, and submit for Admin approval. The cash balance does not increase until approval. The system blocks duplicate pending replenishment requests per fund and branch. Financial records are still stored in the current browser for testing (not production-safe), and Supabase remains disconnected.

**Testing limitation:** Financial function smoke tests and print-preview PDF tests are separate from full Next.js production build / multi-device E2E validation. Run `npm install && npm run build` in an environment with package-registry access before production deployment. The existing localStorage key remains unchanged; export your JSON backup before testing upgrades.

---

# Version 3 — Reports-First CMS Frontend

**Latest update:** Added specialized printable A4 landscape reports, date-range ledger balances, Closed-date Sales, RFP-linked COGS, denomination cash-count sheets, Daily Sales Turnover only (Funds Turnover removed) and configurable print logo/signatories. See `REVISION_STATUS_V3.md` for details and remaining limitations. **Supabase is not yet connected.**

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

**Cashier:** Dashboard; POS quotations → add services/parts/COGS → multi-method payment → close; additional linked POS transaction for completed sales; read-only completed Sales; Revolving Fund expense with auto transaction numbers, VAT/Non-VAT, payee, voucher, receipt number, TIN, category, description, notes, receipt upload, signature pad; immediate RF deduction while Pending; replenishment request (balance credited only after Admin approval); Opening/Closing cash counts; 9 AM late-opening mandatory report; 4 PM closing alert; following-login missed-closing report; discrepancies; mandatory report lock; daily Sales-only turnover; CSV/printable reports.

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
- POS cash-accountability settlement, denomination-based cash count, VAT/BIR details, daily Sales Turnover deadlines, and reconciliation treatment need final finance approval.
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
- Daily Sales Turnover opens with EOD at 4 PM and is due by 6 PM every operating day; requires signature. Expected cash is based on Closed POS cash payments for the day.
- Branch disbursement print preview uses **A4 landscape, up to 30 transactions per printed page** and includes category breakdown for RF. Receipts use a **separate print-ready view**. In the browser print dialog choose **Save as PDF** for independent files. Browser-based print previews are not server-generated PDFs. Images print directly; **original uploaded PDF receipts must be opened/printed separately** (not merged into the receipt packet). Signature lines are placeholders on generated reports and are not digitally routed for approval yet.
- Admin fund approvals now offer a status filter; dashboard financial summaries open relevant modules, role-specific financial cards avoid cross-role RF/PB access.
- Demo account password change, JSON backup/restore, sample-data reset, category editing, and branch fund baseline controls.
- Corrected desktop login screen grid so the dark branding pane no longer occupies a misplaced second row. Responsive refinements for tablet and mobile.

**Unimplemented or awaiting confirmation:** automatic downloadable PDF combining PDF receipt attachments, true 30-row pagination on every report subtype, production background deadline alerts when the app isn't open, backend-enforced audit/access controls, approval signatures on printed forms, bank/check settlement rules. Supabase remains intentionally **disconnected**.

**Do not use browser-local prototype for actual financial processing.**
