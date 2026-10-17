# Underchargers CMS Frontend v9.0 — Scan First, Prices Later

## Implemented

- Admin can register **one** barcode or use **Bulk Scan**. Scanning never asks for unit cost or selling price.
- Each unique barcode needs its own product name and category. Repeated scans do not duplicate a product or increment physical quantity.
- Initial physical quantity is **1 by default**, with an explicit Multiple Units checkbox. Serialized units still require unique physical unit identifiers.
- Clicking **Submit Product / Submit All** creates a registered **Pending Stock** entry with price configuration required, instead of pretending it is ready for use.
- **Price Configuration** is a dedicated Admin section reachable from the Inventory module, dashboard quick action, and pending rows. Prices can be saved individually or with **Save All Prices**.
- After Admin confirms valid Unit Cost and Selling Price, the pending physically verified initial quantity is credited via a logged Stock In movement at the configured cost. Internal Shop Supplies may have zero selling price, but must have a valid positive unit cost.
- Unpriced products display **Pending Stock · Needs Pricing**, have **0 Available**, and cannot be issued through POS or scanned into other stock actions until configured.
- Cashier, PB cannot register/price products. Product histories and existing priced v8.9 data remain intact.
- Local browser persistence key is unchanged; only PWA shell cache version is updated.

## Validation

- Existing v8.9 logic regression tests pass (legacy APIs remain for compatible historical records).
- New `tests/v9-pending-pricing-smoke.cjs` verifies unauthorized attempts, duplicates, atomic registration, missing prices, batch pricing, Stock Out blocking/unblocking, branch isolation, and legacy records.
- Isolated `lib/data.ts` strict TypeScript check and TSX syntax transpilation pass.
- Full Next.js production build, interactive browser checks and device barcode scans **not verified**, since npm dependencies are unavailable offline.

## Notes

- Browser-local storage and demo permissions **are not production security**. Supabase shared backend and RLS are still pending.
- Existing products from prior releases retain their prices and posted quantities; there is no automatic rewrite or reset of test data.
