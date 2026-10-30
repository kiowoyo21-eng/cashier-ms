# v9.28 Supplier Type Patch — from v9.27 only

Extract at repository root to overwrite matching files. Do not stack this on v9.26 or earlier. This patch does not alter account balance logic, POS, RF/RFP expenses, or disbursement state.

Changed or new files:
- `lib/suppliers.ts`
- `components/SupplierWorkspace.tsx`
- `app/suppliers.css`
- `package.json`
- `public/sw.js`
- `tests/v9.28-supplier-types-smoke.cjs` (new)
- `tests/v9.26-supplier-master-smoke.cjs` (adapted to opt-in payable mode)
- `tests/v9.24-clean-ui-smoke.cjs` (version compatibility)
- `tests/v9.23-ui-spacing-smoke.cjs` (version compatibility)
- `README.md`
- `REVISION_STATUS_V9_28.md` (new)
- `PATCH_MANIFEST_V9_28.md` (new)

Run `npm run test:supplier-types`, `npm run test:suppliers`, `npm run test:accounts-suppliers` and `npm run build` after installing npm dependencies.

No localStorage reset. Supplier opening payable records from earlier versions are retained. Supplier payables are separate from Admin Financial Monitoring Account Balances.
