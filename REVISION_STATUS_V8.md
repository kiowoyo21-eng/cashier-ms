# V8 Frontend — Barcode Inventory, POS Draft & Locked Stock Out

## Included

- New **Inventory** sidebar for Cashier and Admin (none for PB), white/yellow compact responsive design.
- **Automotive Parts & Products** and **Shop Supplies**; separate inventory per branch (UCQC, UCM, UCLP, MMM). Product registration includes barcode, product name, category, unit, cost, selling price, low-stock threshold. Cashier or Admin can Stock In authorized quantities. Admin chooses a branch before registering.
- Barcode lookup via ordinary field (compatible with keyboard-style USB/Bluetooth scanners), searchable suggestions, and optional **camera scan** using the browser's `BarcodeDetector` API where available. Camera requires HTTPS, permission and browser support. Fallback manual entry always available.
- **Save Draft Now** on Step 1 of Cashier POS: customer/vehicle/plate information is sufficient to save a Draft with no sale items. Existing internal `Pending` status retained for compatibility with v7 test records.
- In open POS Draft, **Scan Stock Out → Review quantity/cost → Confirm & Lock**. Confirmed stock movement deducts **immediately**, not on POS closure; does not overwrite inventory product balances or a historical movement.
- One POS contains 3 distinct COGS sources: **From Inventory**, **PB / RFP Purchases**, and **Other / Manual POS COGS**. Manual entered part costs replaced for quantities matched by inventory movements or PB purchases to prevent duplicate COGS. PB purchases and inventory stock are separate; PB never manually links inventory products.
- **Stock Out is append-only**. Cashier cannot edit/delete posted issuance. Cashier may submit a **Request Return** (reason, whole-number quantity, partial returns allowed). Pending return requests do not restore stock. Only Admin may approve or reject. Approved return appends a new positive StockReturn movement to the **same branch**, restores physical quantity, reduces linked POS Inventory COGS, and retains original locked StockOut and audit history. Duplicate/over-return blocked.
- Admin **Inventory Stock Out Correction Requests** queue includes action, POS, item, quantity, reason and status. All decisions audited.
- Branch isolation, old v7 Revolving Fund, Parts Fund, Sales, cash accountability and disbursement logic kept. Existing v7 localStorage key retained; legacy data is migrated in-memory to empty inventory/stock movement/requests arrays (no existing records intentionally discarded). Fresh reset creates sample stock by branch.
- New POS creation avoids silently auto-linking PB parts if a *different* open POS exists for the same plate; Cashier must resolve ambiguous visits instead of guessing.
- POS printable cost table uses clearly separate subtotals for Inventory, PB/RFP, and Manual COGS.

## Validation performed

- `tsc --noEmit --strict --target es2022 --module esnext --lib es2022,dom lib/data.ts lib/print.ts`: passed.
- TypeScript transpilation/syntax of `app/page.tsx` and `components/BarcodeCamera.tsx`: passed.
- `npm run test:logic`: passed including v8 inventory/stock out scenarios and previous v1–v7 regression checks.
- ZIP file integrity check performed.
- **Full `next build` and interactive browser/device tests are NOT verified**. npm package registry installation was unavailable/timed out in this environment. Review the app on Vercel before live use.

## Known limits / Next backend phase

- Browser localStorage is NOT appropriate for live financial or stock records across multiple devices. It can be cleared, and there is no authenticated server permission enforcement. Export backup before deploying. Sample stock data only appears for fresh/reset demos; previously saved v7 sessions show an empty inventory until products are registered.
- Barcode camera support varies between browsers; USB/Bluetooth scanner acting as keyboard and search entry are the dependable paths. Browser camera scanning requires compatible HTTPS browser and permission.
- Internal stock usage outside a POS, inter-branch stock transfers, receiving paperwork and centralized Stock In approval rules require separate requirements approval. Current stock-out flow is intentionally **POS-linked**.
- Supabase integration later must use database transactions, per-branch RLS, item ownership, audit/immutable ledger policies, unique/atomic idempotency keys for scans, and concurrent stock decrements to prevent races and duplicate real-world transactions.
- No production Accounting/President approvals or secure signatures; v7's demo simulation remains demo-only.

## Quick testing walkthrough

1. Run `npm install && npm run dev`, sign in with existing demo Cashier credentials.
2. Go to **Inventory**. Demo sample items appear after Reset Demo or on a fresh local install. Scan/type barcode (e.g. `UCM10002`) or search `Oil Filter`.
3. Go to **POS & Sales → New POS**, enter normalized plate (`214UWI`), a valid Brand & Model and Year and Customer; click **Save Draft Now**.
4. Open the saved Draft, click **Scan Stock Out**, scan/search `UCM10002`, select quantity 2 and **Confirm & Lock Stock Out**. Verify UCM stock decreases by 2 and POS Inventory COGS increases by 2 × captured unit cost.
5. Click **Request Return** for that locked issue, request 1 unit and enter reason. Verify stock does NOT change while request is Pending.
6. Log in as Admin → **Approvals & Exceptions** → approve Stock Out return. Verify UCM stock restored +1, POS Inventory COGS decreased accordingly, original issuance remains in movement history; other branches unchanged.
7. Test a PB part purchase linked to the same plate and verify it appears in **PB / RFP Purchases**, NOT under Inventory COGS. Printable POS report has separate breakdowns.
