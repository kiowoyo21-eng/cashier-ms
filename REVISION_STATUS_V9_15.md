# Cashier System v9.15 — Downpayment-first POS Wizard

Frontend-only release; browser-local storage and local-only draft history are **not authoritative cross-device controls**.

## Workflow

**Standard sale (no advance):** Details → Quotation → COGS Review → Payment.

**With first downpayment:** Details → First Quotation → Downpayment (Cash, Card Terminal, QR / GCash, Bank Transfer). The original quote and first payment are saved under the same POS number with COGS intentionally unreviewed. Downpayment must be greater than ₱0 and **strictly less than** the quotation total. Partial advance is the only payment allowed before COGS.

**When same POS is reopened:** Details done → Downpayment recorded → Final Quotation (Continue First Draft or Create New Final Quotation) → COGS Review → Remaining/Full Payment. Both quote choices are **versions of the same POS**. The original quotation snapshot and all payments remain attached. Admin-only draft history records later revisions. A new final quote cannot be below the total already paid.

- No further payment can be recorded while first quote is awaiting final quotation and COGS review.
- Final payment requires each final line to have a valid cost source.
- Service/Labor can use `No direct cost`; parts with PB/Inventory source need approved purchase/posted stock before sale closure.
- No inventory stock release request can be initiated while a POS is awaiting final quotation.
- Paid POS drafts are nondeletable; cross-branch open-unit lock continues to apply.
- For Card/QR/bank, provider/terminal/trace reference and date are required, with duplicate trace protection.
- No cloud sync or real terminal integration; no production backend.

## Verification

- All existing logic tests plus `tests/v9.15-deposit-wizard-smoke.cjs` passed.
- Strict TypeScript compilation passed for payment, POS draft, and downpayment logic modules.
- Frontend TSX parse and local import checks passed.
- Complete Next.js production build/browser validation not available without installed dependencies. Validate in Vercel before using live.
