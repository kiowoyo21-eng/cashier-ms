# CMS v9.20 — Multi-Branch Parts Buyer

## Problem

The v9.19 Parts Buyer experience was restricted to the default account branch (often `UCM`), due to a single-branch header label, an assigned-branch-only Parts Purchase form, and same-branch validation in the new Disbursement Requests model.

## Changes

1. `app/page.tsx`
   - Provide PB with a selectable workspace branch (UCQC/UCM/UCLP/MMM), while leaving Cashier assigned-branch-only and Admin oversight untouched.
   - Use selected PB branch for dashboard, RFP balance, RFP replenishment, purchase defaults, filtered records and reports.
   - Allow any configured purchase branch in the Parts Purchase form; keep RFP debits and POS/COGS matching strictly scoped to the purchase branch.
   - Supply active branch to the Disbursement Requests workspace; Admin User Management now describes PB accounts as `All branches` with a default branch.
2. `components/DisbursementWorkspace.tsx`
   - New PB drafts default to selected workspace branch. PB can select the actual branch when creating a request, while Cashiers cannot.
   - PB may edit their own drafts/returned requests for any branch (subject to workflow status); previous request branches cannot be changed.
3. `lib/disbursement-requests.ts`
   - Authorize PB requests for any valid configured branch, without granting that ability to Cashiers or Admin request creation.
   - Preserve requestor ownership, immutable branch per request, histories, and external approval/payment restrictions.
4. `lib/parts-purchase.ts`
   - Role-aware PB cross-branch validation and configured-branch whitelist; non-PB assigned-branch restriction preserved.
5. `package.json`
   - Version 9.20.0; include new tests in full regression and disbursement-request scripts.
6. `tests/v9.20-pb-multibranch-smoke.cjs` (new)
   - All four PB branches, purchase validation, disbursement creation and IDs, ownership, Cashier restrictions, RFP branch scoping, no external impersonation, syntax.
7. `tests/v9.17-optional-parts-and-local-clear-smoke.cjs`
   - Update superseded single-branch UI expectation while retaining the existing backup/local reset and optional vehicle fields checks.
8. `README.md`
   - Document branch permissions and production integration limits.

## Results

- PASS — full `npm run test:logic` suite (including v9.20 and v9.19).
- PASS — `npm run check:components` (84 local imports).
- PASS — `npm run check:view-maps` (15 title/subtitle values).
- PASS — TypeScript compilation of the new/changed business-rule modules in strict mode and TSX syntax parsing.
- NOT VERIFIED — Next.js production build and complete React/Next typecheck: project dependencies are not installed in this environment. Vercel remains deployment authority.

## Preservation and limits

- No changes to existing user accounts, database contents, localStorage keys, demo login restoration, transactions, or RF/RFP fund balance calculations.
- No new Accounting/HRMS/ERP connectivity. PB still cannot perform external Accounting/Ms Kate approvals or record unauthorized payment releases.
- In production, enforce branch permissions against authenticated identities using the eventual shared database. CMS is frontend-only for now.
