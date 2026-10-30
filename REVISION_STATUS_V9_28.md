# CMS v9.28 — Supplier Type / Optional Opening Payable

**Base:** CMS v9.27. This release modifies supplier catalogue UI and supplier type/opening rules, not payment or financial account ledgers.

## Supplier types

1. **Ledger Only (default):** supplier profile, product catalogue, manual/reference prices, linked RFP purchase transactions and existing source receipt links. No opening payable section by default.
2. **With Opening Payable:** all Ledger Only features plus optional opening payable by UC or MM (Admin only). Amount, as-of date, source/reason and actor are recorded in `supplierOpeningHistory`. This is an *opening reference*, not automatically calculated debt, AP payment or a general ledger.

Admin may choose supplier type on creation or change it on the supplier profile. PB and Cashier may request a new supplier type; `Pending Admin Approval` continues unchanged. A nonzero opening payable must be corrected to zero with audited reason before downgrading to Ledger Only, preventing silent disappearance of liabilities. Supplier product prices and RFP purchases never post payables automatically.

## Backward compatibility

- No localStorage reset or key changes; `mode` is optional. An existing supplier with a nonzero legacy opening amount is shown as With Opening Payable; one with no opening amount defaults to Ledger Only. Old opening history remains available read-only if supplier is Ledger Only.
- Admin Financial Monitoring account starting balances are **not** supplier opening payables, and remain unchanged.
- Supplier permanent IDs, branches, products, historical prices, transaction receipt links, pending requests and audit history are retained. PB/Cashier permissions and Admin approval stay as v9.27.
- Existing demo supplier remains clearly labelled SAMPLE, Ledger Only, with no expenses, inventory or debt created.
- Shared Supplier Database / cross-device approvals remain future backend work (frontend localStorage only).

## Validation

- New `tests/v9.28-supplier-types-smoke.cjs`: PASS (default, type changes, Admin role, nonzero payable protection, history, legacy migration logic, PB/Cashier pending approvals, JS/TSX syntax).
- Existing v9.26 supplier and v9.27 account/supplier approval smoke tests: PASS (legacy v9.26 test updated to explicitly opt into payable tracking).
- v9.25 profitability and v9.24 UI checks: PASS; v9.23 spacing, v9.22/v9.21 disbursement, v9.20 PB, v9.19 requests, v9.17/v9.16 setup, v9.15 payment, v9.8 terminal, v9.13 draft tests: PASS.
- Strict `tsc` for supplier/financial library: PASS. Component import resolver: 110 local imports PASS. Navigation maps: 17/17 PASS.
- Full Next.js/React typecheck and production build **not verified locally** (npm dependencies not installed). Verify with `npm ci`/`npm install` and `npm run build` in Vercel before deployment.

**Deployment:** Apply patch to v9.27 only, back up browser data, do not clear localStorage; test with an Admin account. Prior nonzero opening amounts are preserved without overwriting them.
