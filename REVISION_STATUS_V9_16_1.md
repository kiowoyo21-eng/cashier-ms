# Cashier System v9.16.1 — Vercel TS18048 hotfix

## Fixed

- `app/page.tsx`, `renderPosList()`: replace `user.role` and `user.branch` with null-safe `user?.role` and `user?.branch` in POS Draft Delete button visibility condition. Resolves Vercel TypeScript error `TS18048: user is possibly undefined` at line 508.
- Updated application version to `9.16.1` in `package.json`.

## Unchanged

- v9.16 zero-seed defaults and first-time Admin setup
- POS quotation/downpayment/COGS/payment workflow, draft history and deletion rules
- Inventory approval, fund/RFP, terminal transaction workflows, and standalone Docs/Sheets

## Validation

- `npm run check:components`: passed (74 imports).
- `npm run check:view-maps`: passed (14 view values).
- `npm run test:logic`: passed.
- TypeScript TSX parser: passed for modified `app/page.tsx`.
- **Not verified:** full `npm run typecheck` / `npm run build`, because npm registry could not be reached from the testing environment (EAI_AGAIN). The next Vercel deployment will validate the complete build.

## Deploy

Apply the hotfix from repository root, then commit and push to `kiowoyo21-eng/cashier-ms` main. The two patched files are `app/page.tsx` and `package.json`. Do not delete any live browser data to apply this source-level correction.
