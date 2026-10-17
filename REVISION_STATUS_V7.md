# Underchargers Fund Management PWA — v7 Revision Status

## Confirmed Business Rules and Frontend Changes

### Fund separation
- Revolving Fund (RF) has **four separate branch ledgers**: UC Quezon City, UC Mandaluyong, UC Las Piñas, and MM Mandaluyong. Starting balances are independently configurable in Admin Settings. No RF expense or replenishment affects a different branch's RF account.
- RFP is a **separate parts-only fund**, also branch-scoped; RFP and RF balances are never combined.
- Admin **All Branches** financial view now includes a branch-by-branch financial table and consolidated grand total, with an Admin-only print button.
- Individual branch printable requests show only their own branch's balance/expenses/replenishment, so Cashier/PB do not see other branches' figures.

### Disbursement permissions and money movements
- **Only an assigned Cashier can prepare a Revolving Fund disbursement/replenishment**.
- **Only an assigned PB can prepare an RFP disbursement/replenishment**.
- It is **one disbursement = one request to restore spent funds**; no separate manually entered Request Fund amount. Starting cash target, expenses and received replenishments determine the due amount.
- Preparing the request **does not credit funds**. The request records its original, branch-specific requested amount. Pending requests block another request for the same branch/fund.
- Preparer provides a **signature** when submitting the request. Printed requests show Prepared by (actual creator), Verified by: Accounting, and Approved by: President, with names/dates/statuses where genuinely available.
- The frontend includes **explicitly labeled simulated steps** for Accounting verification, President approval, and Confirm Fund Received. These are for browser-local testing ONLY and do **not** impersonate real external signatories or create a real external signature. A balance is credited only when the recorded fund receipt step is completed.
- Accounting System and Fund Management System will be **separate apps sharing the SAME Supabase database** during a later backend phase. No Supabase integration, cross-system signing, or authoritative server workflow has been implemented in this frontend ZIP.

### Printed reports
- Branch request reports have an embedded per-branch financial table, disbursement reference, payment/check information where supplied, and signatory slots.
- Admin consolidated reports show all four branches and a grand total (RF and RFP separately), latest request references/stages, and approval roles.
- A4 landscape layout prioritizes legibility. With 11 category subtotals, branch breakdown and the three sign-off areas, up to **18 expense rows fit on one final summary page** in the current print validation; intermediate detail pages can hold up to 30. This avoids overflowing an otherwise full sheet with signatures. Actual rendering was checked using WeasyPrint; different browsers/printers may still vary.
- Existing POS, parts, RF expense, receipt-later, cash count, sales turnover, and vehicle auto-matching features are retained from v6.

## Verification

- `npm run test:logic`: passed, including v7 independent branch balances, admin report, permission guard source, and disbursement receipt vs approval.
- Print fixtures rendered as A4 PDF: RF 10, 15, 18 records -> 1 page; 19, 30, 31 -> 2 pages; 60, 61 -> 3 pages. Test RFP report of 18 rows -> 1 page; four-branch consolidated report -> 1 page.
- TypeScript/TSX parser check: passed for edited sources.
- Full Next.js production build and end-to-end browser click-through: **not verified** in this environment due missing installable npm dependencies. Test on Vercel before treating this as production ready.
- Official Underchargers logo remains configurable in Admin Settings; no source-embedded official logo was provided.

## Local demo limitations

- App state and receipts are in browser `localStorage`, NOT synchronized between computers/devices, and demo credentials are not production security.
- Export a JSON backup before replacing a deployed version on the same domain. Same storage key preserved from earlier versions.
- Before production financial use: integrate Supabase Auth/RLS, atomic per-branch ledgers, verified Accounting/President signatory records in shared DB, receipt storage, server-side approval authorization, and durable audit history.
