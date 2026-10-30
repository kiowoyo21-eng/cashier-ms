# v9.26 Supplier Master Patch

Apply to **v9.25.0** of `cashier-ms`. Extract in the project root, overwriting matching files. Back up your project and browser-stored records first. This patch never intentionally clears localStorage or changes financial amounts and approvals.

The v9.26 module is a **frontend-local prototype**. CRM and Accounting integration and central supplier ID assignment are not live. On first run in the existing browser, previously recorded valid RFP expenses are linked to supplier and product-price references without reposting financial transactions.

Validate with `npm run check:components`, `npm run check:view-maps`, and `npm run test:suppliers`, then run `npm run build` (Vercel) before production use. This environment did not have cached Next.js dependencies for a full build.

## Included changes

- `README.md`
- `REVISION_STATUS_V9_26.md`
- `app/layout.tsx`
- `app/page.tsx`
- `app/suppliers.css`
- `components/SupplierWorkspace.tsx`
- `lib/data.ts`
- `lib/suppliers.ts`
- `package.json`
- `public/sw.js`
- `tests/v9.23-ui-spacing-smoke.cjs`
- `tests/v9.24-clean-ui-smoke.cjs`
- `tests/v9.26-supplier-master-smoke.cjs`
- `tests/v9.6-vercel-office-routes-smoke.cjs`
- `tests/v9.7-office-workspaces-smoke.cjs`
