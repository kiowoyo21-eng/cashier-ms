# Version 4 - Disbursement/Replenishment Integration

- Combined Cash Disbursement and Replenishment into a single A4 landscape printable document; no separate summary-only page when the data fits.
- Disbursement workflow calculates request amount from unreplenished spent balance; manual request amount removed.
- Date-range carryover and approved deposits disclosed in the reconciliation.
- Added direct print preview inside the Submit Replenishment Disbursement dialog; retained its separate approval status.
- Expense details, categories, check/deposit references and prepared/checked/approved signatories included in same report.
- Tested 30/31/60/61 expense fixtures for page counts in Chromium.
- No Supabase. Frontend browser-local prototype only; real secure production environment needed for fund approvals.
- Known limitations: PDF receipts are not automatically merged, uploaded/custom logos may change page fit, approval roles/signatures remain demo placeholders until configured, build/E2E depend on npm access.
