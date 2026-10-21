# CMS v9.22.1 — Requestor account name on disbursement paper

Base: v9.22 (automatic disbursement, paper-first). Frontend-only.

## Changes
- Disbursement Request review toolbar now clearly shows **Prepared by: [logged-in account full name]**, with role and fund scope separately.
- The paper header identifies the actual requestor by account full name, with PB/Cashier role shown underneath.
- The signature area uses the correct specific role label instead of generic `PB / Cashier`.
- PDF generation formats the requestor role consistently as `Parts Buyer` or `Cashier`.
- Draft previews use the signed-in account name. Existing requests continue displaying their **saved requestorName snapshot**, avoiding historical identity rewriting if a profile changes.
- No changes to request ID, approval states, fund/expense amounts, receipts, localStorage records, or cross-app integrations.

## Files changed
- `components/DisbursementWorkspace.tsx` — present account name + role/scope consistently
- `lib/disbursement-paper.ts` — human-readable user role on generated PDF
- `app/globals.css` — signature metadata appearance
- `package.json` — version and smoke test script
- `tests/v9.22.1-prepared-by-account-smoke.cjs` — requester identity and snapshot regression tests
- `REVISION_STATUS_V9_22_1.md` — documentation

## Validation
- New requester identity test: PASS.
- v9.22 automatic paper test: PASS.
- v9.21 generated disbursement test: PASS.
- Component import and view-map scripts: PASS.
- Full Next.js production build: NOT run (local Next/React dependencies absent).

## Deployment
Apply patch to CMS v9.22 and deploy to the existing Vercel cashier-ms project. This does not reset existing browser data. Historical records keep the preparer name stored when the request was created. Frontend-only account data remains non-production authentication.
