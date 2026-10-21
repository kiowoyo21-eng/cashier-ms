# CMS v9.22 — Document-centered Disbursement Review + Automatic Expense Coverage

Baseline: v9.21.1. Frontend-only; no cross-system integrations, Accounts/HRMS/ERP changes, or localStorage wipes.

## Functional changes

- Removed manual transaction picker, select-all and clear-selection controls. The RF/RFP ledger automatically supplies **all** eligible expense rows in the current cycle.
- One active generated cycle per RFP fund (PB across all four branches) or per RF Cashier branch. Existing cycles are opened/revised instead of creating competing requests. Historical legacy requests remain readable.
- Calculation uses base expense + online payment charge, with original receipts linked by expense ID. No re-entry or duplication of receipt bytes.
- Generated drafts must be refreshed if new eligible rows appear before submission; a submitted request keeps a frozen snapshot.
- Coverage uses last recorded actual `Released / Paid` or `Reconciled` disbursement release. Older Approved replenishment records serve solely as a **labeled legacy boundary** when no verified later release exists. A late/unclaimed expense is carried forward after a released cycle, rather than silently skipped.
- Clear document-style A4 preview containing transaction rows, **Total per Branch**, fund/expense/remaining/request amounts, and a signatory block. Receipt preview is accessible contextually from a row. Saved requests keep Print A4 and Download Paper + Receipts PDF.
- Simplified requests list and approval/history details. No fake approval or release controls in CMS.
- Existing v9.19 request records and user accounts are left intact; same browser storage key; no migrations or deletions.

## Files changed

- `components/DisbursementWorkspace.tsx` — redesigned consolidated paper-first UI with automatic generation
- `lib/disbursement-requests.ts` — automatic-cycle selection, stable coverage boundaries, carry-forward protection and snapshot fields
- `lib/disbursement-paper.ts` — cycle snapshot metadata in printable/combined PDF
- `app/globals.css` — compact document-centered, mobile-responsive and A4 portrait-print styling
- `package.json` — version/test script
- `tests/v9.21-generated-disbursement-smoke.cjs`, `tests/v9.19-disbursement-requests-smoke.cjs` — legacy markup assertions updated to current UI
- `tests/v9.22-automatic-paper-smoke.cjs` — regression coverage of automatic inclusion, locked prior requests, branch segregation, receipt references, and released-cycle rollover
- `README.md`, `DISBURSEMENT_SHARED_DATABASE_CONTRACT_V1.md`, this revision note

## Approval authority

CMS staff can only save, submit, and revise returned requests. Accounting review, Ms Kate mandatory final approval, payment release and reconciliation remain external future-authority operations. A printed "President" signatory is a label, not a live third approver or authorization.

## Verification

- `npm run test:logic` (baseline full logic suite) — passed.
- `node tests/v9.22-automatic-paper-smoke.cjs` — passed.
- `npm run check:components` — passed (87 local imports).
- `npm run check:view-maps` — passed (15 views).
- TS and TSX source parse checks — passed.
- Full Next.js typecheck/build and live browser rendering — **not verified**: npm packages missing from archive and npm offline cache does not contain required modules.

## Open integration requirements

Implement genuine financial-ledger payments and immutable approval transitions in a shared database with server-based authorization, release/reconciliation verification, receipt immutability, and historical reconciliation of approved legacy replenishments. Current browser-local state cannot enforce cross-device exclusivity. ERP is completely independent.
