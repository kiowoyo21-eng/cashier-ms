# UC CMS Frontend v9.1 — Cost Only, Selling Prices Per POS

## Changed

- **Admin Product Registration:** Single Scan/Bulk Scan → Product Name → Submit All → Pending Stock. No cost or selling-price inputs during scanning.
- **Admin Cost Configuration:** Enter only **actual Unit Cost (COGS)** per product, with **Save Unit Cost** and **Save All Costs**. No master/catalog Selling Price input or requirement.
- **Verified Stock:** After Admin confirms the posted physical quantities and configures a positive Unit Cost, pending initial stock is credited to that branch's immutable Stock In ledger. Pending or unconfigured products cannot be consumed by POS.
- **POS Quotation:** The sale price continues to be entered **per POS line/per transaction**. Inventory Unit Cost is recorded in stock and COGS history separately; product catalog values do not dictate quotations.
- **Existing data:** Browser storage key unchanged. Existing Stock In/Out and COGS movements stay intact. Historical `sellPrice` values in older records remain for data compatibility but are **not shown, required, updated, or used** for new product management/POS pricing. The new product registration process does not save a fixed selling price.
- **UI:** Cost-only form now has compact 3-column row layout; Inventory labels, help text, button labels, and dashboard shortcut updated; PWA cache advanced to v9.1.

## Verified

- Existing fund, POS, and inventory regression tests passed.
- `tests/v9.1-cost-only-smoke.cjs` passed: no fixed selling price stored, cost-only registration and approval, logged COGS, branch stock, Cashier can't configure costs, independent POS selling price, legacy data compatibility.
- Isolated TypeScript data-model check and TSX syntax/transpilation check (source-only) passed.
- ZIP archive integrity verified.

## Not verified / outside this revision

- Full `next build`/Vercel deployment and interactive hardware scanner/browser E2E tests require installed Next.js and browser runtime.
- Supabase not connected; account role protections and approvals remain demo/local only.
- This is a targeted inventory pricing revision; it does not change unrelated POS workflow steps, financial reports, or receipt processes.
