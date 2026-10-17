# Underchargers Fund Management System — v6 Frontend Revision

## Requested features implemented in source

**Cashier POS (guided flow)**
1. Plate input first. Uppercase alphanumeric normalization; no spaces or punctuation stored. Suggestions combine historical branch POS and PB RFP purchases. Selecting e.g. `214UWI` prefills the car from unlinked PB `Toyota Vios 2020`, and historic customer/phone details from previous POS if present.
2. Manual sale transaction lines entered in Step 2 (services or parts, quantity, selling unit price, manual unit COGS, optional supplier).
3. COGS review shows available matching PB parts **before saving the POS**, along with combined itemized COGS totals. On sale creation, matching *unlinked* RFP part-lines are pinned to the **new POS only**, branch- and plate-scoped. Part cost replaces equivalent manually entered POS cost, even for partial quantities, and each part can only be linked once. After saving, Cashier can collect payment(s) and close POS.

**Parts Buyer**
- Repeatable multi-item RFP purchase under one transaction number / total payment, with supplier, quantity, unit cost per part. Each part remains its own expense ledger line (sharing `purchaseId` and display `no`) for the existing reports and fund computation.
- No PB manual parts-to-POS linking button. If a single existing Pending matching POS is found while PB saves a purchase, association is automatic. When multiple Pending visits exist, it is left unlinked for the next explicit Cashier sale; no automatic selection of one of the ambiguous old visits.
- A missing receipt does not prevent purchase recording. PB/Admin can attach or replace proof later in Transaction Details. Upload is audit-logged and applies to all lines of that purchase; expenses/amounts are unchanged.

**Cashier closing**
- BOD auto-opens at 8:30 AM when unfinished; opening report required if 9 AM missed.
- EOD input is cash-count denomination quantities only and **locked until 4 PM**. No expected cash or manual duplicate total input.
- **Sales Turnover daily**, never Funds Turnover; due 6 PM alongside EOD. At 4 PM it becomes eligible for submission. Missed actions create mandatory explanations and block transaction entry.

## Preservation and build conditions
- Existing app modules, white/yellow responsive CSS, print templates, 11 RF categories, user login options, local backup/restore and browser-local storage key retained.
- Backend intentionally not connected. Supabase is reserved for later phase.
- Tests: existing logic/print smoke test suite plus `tests/v6-automatic-link-smoke.cjs` (including `214UWI`, once-only linking, two suppliers, cross-branch, rejected parts, exact/partial COGS replacement) and TypeScript transpiler parser checks.
- **Not verified:** Next.js production build, multi-browser E2E clicks, live notifications at wall-clock boundaries, real device responsive layout, print pagination in an actual browser with current v6 changes. Run `npm install`, `npm run typecheck`, `npm run build`, and browser testing where dependencies are accessible.
- Demo account passwords are only for local prototype. **Do not use these local credentials as production authentication**.

## Important business limitation
Without Supabase, new purchases and sales only synchronize in the same browser profile and storage origin. Export a JSON backup before deploying v6 over an older release.
