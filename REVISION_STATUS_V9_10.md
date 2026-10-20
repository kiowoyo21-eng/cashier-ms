# Cashier System v9.10 — POS Item Entry UI/UX

Base: v9.9 Clean POS / Empty Business Seed. Frontend only; data remains browser-local.

## Changes
- The **New POS > Step 2** wizard and **Open POS Draft > Add Item** reuse a new `components/POSLineComposer.tsx` UI.
- Dedicated Service/Part selector, large item description, whole-unit quantity stepper, peso selling-price input, calculated line subtotal, and prominent Add item button.
- New POS wizard shows itemized entries with unit price, qty, subtotal, Edit/Remove actions, and running sale total before saving. Editing an item retains the existing row until Save changes.
- Saved POS shows customer selling price and total; sensitive cost details remain in the existing optional costing section.
- `lib/pos-line-entry.ts` enforces whole number quantities (1..9,999), positive selling prices in centavos, nonnegative optional manual cost, and normalizes descriptions. Both handlers validate serverlike logic independently of disabled buttons.
- Previously implemented stock restriction remains: registered items must go through Request Stock Release with Admin authorization; PB cost auto-linking and terminal payment tracking are unchanged.
- A `v9.10-pos-entry-smoke` test covers validation, rounding, both UI locations, and guardrails.
- Updated historical test assertions to accept the shared field component and two-digit minor versions.

## Deploy
- Complete ZIP: unpack contents to project/GitHub repository **root** and commit.
- Patch ZIP: apply on top of unmodified v9.9 repository. Keep existing `app/`, `components/`, `lib/`, `tests/` folders.
- Vercel routes `/docs` and `/sheets` preserved. No standalone URL changes.

## Validation
- PASS `npm run test:logic`
- PASS `npm run check:components` — all 51 local imports resolved
- PASS TSX parsing and `lib/pos-line-entry.ts` strict TypeScript compilation
- Full Next.js / browser build unverified: this environment lacks installed Next/React dependencies; `npm run typecheck` reports missing external modules.

## Existing limitations
- Browser-local state only, no real multi-user backend security.
- Manual POS item edits after saving remain intentionally restricted; already-posted stock and payments are not silently adjusted by this UI.
