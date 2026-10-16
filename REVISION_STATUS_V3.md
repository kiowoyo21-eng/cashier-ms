# Version 3 — Reports-First Frontend Revision Status

This source is a **browser-local UI prototype**. Supabase remains **not connected**, by instruction.

## Implemented in v3 source

| Area | What changed |
|---|---|
| RF/RFP Disbursement | Selected-date-range opening (carryforward), expenses, approved deposits, closing, request = configured target minus closing; voucher/reference numbers, bank/check deposits, named signature placeholders for unset roles. Expenses appear on detail pages; deposits only in deposit section. |
| RFP Parts Expenses | Dedicated printable report with part, supplier, plate, quantity, unit cost, reference, linked POS, receipt name and status. |
| Closed Sales | Dedicated report for **Closed POS only** using actual `closedAt` date, gross sales, payments, POS+RFP COGS and gross profit. |
| Friday Turnovers | Separate Sales and Funds workflows, actual vs expected input, variance, signature capture, printable reports; Friday only. Funds turnover does not automatically debit/replenish RF. |
| RF | All 11 approved categories retained; print opening/replenishments/expenses/closing/category subtotals. Added pre-submit confirmation including amount in words, category, purpose and branch. |
| POS | Printable transaction/quotation with customer, vehicle, lines, payments and itemized COGS; supplier/receipt info can be entered with POS line. |
| Cash Counts | Denomination fields with count/amount check, signature, variance, printable per-count sheets. BOD/EOD incident lock preserved. |
| Daily Reconciliation | New printable branch/date-specific cash sales, RF movements, turnover and count variance report. |
| Receipts | Date-range-aware printable image receipts side-by-side; index flags missing attachments and links PDF originals. |
| Audit | Printable period history showing actor, action, detail and separated OLD/NEW audit values when available. |
| Report Header | White/yellow A4 layout; upload actual official logo through Admin → Settings; Admin can configure checked/approved signatory names. |
| RFP/POS | A part auto-pins when exactly one matching POS exists; repeat visits require explicit selection. Pending duplicate correction requests blocked. Link indicator displayed. RFP cost added to POS COGS, replacing manually encoded part cost **when part description and quantity exactly normalize/match**. |
| Mobile UI | Compact report selector, responsive denomination grid, compact forms. |

## Print-layout verification

Real headless Chromium rendering to A4 landscape PDF showed:

| Detail records | Actual pages | Expected (details + one separate summary) |
|---|---:|---:|
| 30 | 2 | 2 |
| 31 | 3 | 3 |
| 60 | 3 | 3 |
| 61 | 4 | 4 |

30 rows fit per *detail page*; descriptions are clipped in PDF tables to preserve row heights. Reports with many category groups or nonstandard printer margin overrides should still be manually reviewed in the browser.

## Known limitations / remaining work

1. **Full Next.js production build and interactive browser regression are NOT verified** here — npm install timed out due registry connectivity. Next test: `npm install`, `npm run build`, then multi-viewport manual testing in Vercel.
2. **Uploaded multi-page PDF receipts are NOT merged** automatically into the receipt print PDF. Original PDFs remain available via receipt attachment index. Image receipts are included.
3. Admin/President **signature images and final signing/approval workflow are not implemented**; names can be entered, recorded Cashier signatures print where captured. Never silently fabricate an approver signature.
4. Official logo file was **not provided as a standalone artwork**; upload in Admin → Settings to include the correct image. Header falls back to wordmark.
5. **COGS matching is deterministic but not fully foolproof** when the name/quantity differ between manually encoded POS part and RFP purchase. A future exact POS-line mapping and supervised reconciliation would eliminate remaining ambiguity.
6. Dedicated *independent* RF/RFP physical cash-count entry screens, a final Friday Funds settlement policy and full bank reconciliation still require workflow agreement.
7. Storage remains `localStorage` with v2 key preserved. Moving attachments to IndexedDB, production auth/RLS, centralized audit, multi-device sync and background delivery are deferred until backend phase.
8. The additional POS quote sheet with unusually large items/payments and receipt attachments may need additional print-pagination refinement. Core fund report 30-row pagination is verified.
9. Page/branch permissions are client-only demo protections, not security boundaries. **Do not enter real client financial or personal data.**

## Project verification

- `lib/data.ts` and `lib/print.ts`: strict TypeScript typecheck passed.
- TSX/TS syntax parse checks passed.
- `tests/logic-smoke.cjs`, `tests/revisions-smoke.cjs`, and `tests/v3-print-fixtures.cjs` passed.
- Headless Chromium rendered 30, 31, 60 and 61 record fixtures to real PDFs; counts verified.

## Local data migration

The original localStorage key `underchargers-fund-management-demo-v1` is intentionally unchanged so existing v2 demo records can load. Newly introduced fields are optional and old Turnover records are treated as Sales. Always export your local JSON backup before updating the deployed frontend.
