# CMS v9.25 — Admin Profitability Analytics

Source base: v9.24.0. **No alterations to sales/expense/approval ledgers or localStorage keys.**

## Added
- Administrator-only Profitability Analytics link in sidebar; non-admin navigation guard and read-only dashboard.
- Period and branch filters, with Underchargers consolidated and Mastermind separate.
- Closed POS sales, POS COGS (Manual / Parts Buyer / Inventory source mix), gross profit, RF operating expenses, RFP online charges and estimated earnings.
- Six-month sales versus estimated-earnings trend derived from recorded transactions (no synthetic fixture data).
- Company/branch breakdown, expense category summary, recorded collections (not revenue), CSV export, source record detail links.
- Exceptions: unallocated RFP expenses (not expensed as COGS), pending/unverified expenses, zero-COGS POS, terminal refunds and missing Accounting overhead.
- Regression test for double-counting, deposits, refund flags, company scope, rejected rows and replenishment exclusion.

## Calculation limitations
- This is a **management estimate** from available CMS records, not audited profit nor full accounting net income. Overhead, payroll, taxes, accruals, refunds/bank settlement and any COGS source overlap require Accounting reconciliation.
- Existing POS COGS matching logic is reused; new calculations do not alter recorded costs or post entries.
- POS revenue is recognised when POS is Closed. Payments are separate cash-flow information; deposits for open POS do not become revenue.
- Unlinked RFP purchase principal is disclosed rather than immediately expensed to prevent double counting when inventory is consumed.
- RFP remains one consolidated central fund; reporting expenses allocated to branches does not create independent branch balances.
- Current browser-local data and frontend role restrictions are not suitable as production financial security; require backend row policies.

## Verification
- `node tests/v9.25-profitability-analytics-smoke.cjs` PASS.
- `npm run check:components` and `npm run check:view-maps` PASS.
- Full Next.js production build **not verified**: npm registry DNS access unavailable in the build container.
