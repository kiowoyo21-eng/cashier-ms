# v8.6 — Cashier Single/Bulk Scan + Hybrid Stock Receiving

Frontend-only revision from v8.5. Supabase remains disconnected.

## Implemented

- Exactly 3 roles: Admin, Cashier, PB.
- Only Admin registers/edits product master and barcodes; Admin product registration defaults to **0 stock**, including Bulk Scan registration.
- Admin chooses barcode tracking type per product: **Quantity Count** (normal consumables) or **Serialized** (unique barcode for each physical unit).
- Cashier Inventory provides clear **Add Stock · Single / Bulk Scan** and **Consume / Use · Single / Bulk Scan** actions; USB/Bluetooth keyboard-wedge scan and compatible camera scanning supported.
- Repeated product scans do **not** raise quantity in receiving or consumption queues. Cashier enters actual quantity; one row per product.
- Stock In requires registered branch product, delivery reference and uploaded proof; submits **Pending**, does not change available stock.
- Admin approval requires explicit confirmation of independent physical count. Approval produces append-only Stock In movement(s); rejection changes no stock. Review and audit history are visible.
- High-value serialized products require per-unit unique codes matching quantity; duplicate codes are rejected globally, including while receipts are pending. Issued serials cannot be issued twice. Stock Out reversal restores approved serialized codes.
- Consumed products can be collected one or many, assigned to an existing POS Draft; if none is active, create a Draft for the plate and copy prior available vehicle/customer info. When multiple active visits match, Cashier must select the correct one.
- Confirmed Stock Out posts all queued items atomically; locked movements adjust branch stock and COGS immediately. Original locked movements remain unchanged; return requires Admin-approved correction.
- Previous financial, POS/PB and reporting features retained. Existing browser data loader adds `stockReceipts` automatically; no product samples reintroduced.

## Verification performed

- Source syntax parser passed for TypeScript and TSX source.
- Isolated `lib/data.ts` type check passed with global TypeScript.
- All existing smoke tests (updated for new pending-stock workflow), plus new v8.6 hybrid receiving and consumption smoke tests passed.
- ZIP integrity check required during packaging.

## Not production-verified / limitations

- Full Next.js production build and responsive browser end-to-end tests unavailable in this environment without the Next/React/npm dependencies. Deploy v8.6 to a staging URL and test before live use.
- USB/Bluetooth scanner and mobile camera must be tested on your actual devices. Browser `BarcodeDetector` support varies; manual scanner input is a fallback.
- Cashier/Admin demo data remains in browser localStorage, *not* shared among branches/devices. Real authorization, independent approvals, reliable clocks, anti-tampering, attachment storage and atomic ledger posting require the later shared Supabase backend and RLS/server functions.
- The Stock In verification button is a simulation of a physical check; it does not independently prove that someone actually counted the delivery.
- Missing-source COGS exception/photo verification and the revised four-step POS quotation wizard discussed separately are **not** part of this targeted v8.6 stock-scanning revision.
