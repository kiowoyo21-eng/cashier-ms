# v9.27 Patch (from CMS v9.26 ONLY)

Extract all files in this patch to the ROOT of your existing `cashier-ms` v9.26 repo, keeping folder structure, then commit and push for Vercel preview. Do NOT combine with an earlier v9.25 patch.

Changed/new paths:
- `app/page.tsx`
- `app/suppliers.css`
- `components/SupplierWorkspace.tsx`
- `components/AccountBalances.tsx` (new)
- `lib/data.ts`
- `lib/suppliers.ts`
- `lib/financial-accounts.ts` (new)
- `package.json`
- `public/sw.js`
- `README.md`
- `REVISION_STATUS_V9_27.md`
- `PATCH_MANIFEST_V9_27.md`
- `tests/v9.27-account-balances-supplier-approval-smoke.cjs` (new)
- `tests/v9.23-ui-spacing-smoke.cjs` and `tests/v9.24-clean-ui-smoke.cjs` (version compatibility assertions updated)

After applying patch: `npm ci` (if lockfile present, otherwise `npm install`), `npm run build`, `npm run test:accounts-suppliers`. **Browser data is local:** Do not delete saved localStorage or reset accounts. No migrations that remove existing business records are included.
