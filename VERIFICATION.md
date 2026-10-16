# Verification Report — Underchargers CMS Browser Local Rebuild v1 (reviewed)

Date: 2026-10-16

## Checks performed

- **PASS** ZIP archive integrity (unzip -t).
- **PASS** TypeScript / TSX parsing with TypeScript transpileModule (layout, page, database).
- **PASS, limited** strict `tsc` source audit with local React/JSX/Lucide *type substitutes*. This does not substitute for the genuine Next.js production build.
- **PASS** POS math, payments, COGS, plate normalization in Node source tests.
- **PASS, limited** 30-row sample report rendered using the project's print CSS in headless Chromium. Sample print page content measured about 529 CSS px tall (less than approx. 718px A4 landscape printable height); does not guarantee all real-world long text fits.
- **PASS** No Supabase imports, SQL migrations or Supabase runtime code in the source.
- **FIXED** PB was able to create/edit POS records. PB is now read-only for POS write operations.
- **FIXED** RFP edit approvals now check positive finite quantities and costs, required part fields, and valid destination branch.
- **FIXED** Report print output now renders all batches of up to 30 rows, instead of only the current on-screen page.

## Not verified / blockers

- **NOT VERIFIED** Actual `next build` in this environment: npm installation fails with `EAI_AGAIN` (DNS to registry.npmjs.org inaccessible). This is not a successful production-build certification.
- **NOT VERIFIED** Full in-browser IndexedDB save/refresh in Chromium. The sandbox browser blocks navigations to local/HTTP URLs, and IndexedDB is unavailable on opaque about:blank pages. Persistence implementation was inspected but an end-to-end browser run is outstanding.
- **NOT IMPLEMENTED** Complete production-compatible original CMS workflows: BOD/EOD incident enforcement and lockouts, real signed receipt/proof upload & QR phone capture, weekly turnover, full RFP disbursement approvals, dual BM approvals, full reconciliation and secure cross-device authorization.
- **NOT SECURE** Demo username/password checks are embedded in client code. Only use on test data.

## Deploy checklist

1. On your computer with npm access, run `npm install`, then `npm run typecheck` and `npm run build`.
2. Deploy to Vercel only after successful build.
3. In a single browser profile, log in as cashier, admin, and pbacc to test workflow.
4. Save POS, RF, RFP, and request/approval records; refresh; verify persistence.
5. Print test reports with 30, 31, and 60 transactions, especially long descriptions.
6. Do not enter real financial data or treat this build as production ready.
