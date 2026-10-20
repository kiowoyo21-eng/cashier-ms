# v9.12 — One-unit-one-open-POS & Inline Receipt Quotation

## Implemented
- Receipt-style quotation **single inline grid**: Service / Product, Quantity, Selling Total, and `+ Add row`. Each row is independently editable; service/part classification, remove, exact line-total accounting, and a live Sale Total.
- Selling Total is **the total for that line**, not a unit price; saved `POSLine.lineTotal` is authoritative for reporting, terminal payments, and printing. Legacy POS `qty × price` continues to work when lineTotal is absent.
- Same normalized plate number **across the current datastore** may have no more than one `Pending` POS globally across branches. Branch B is blocked if Branch A is open. Re-entry elsewhere allowed only after prior POS is explicitly `Closed`.
- Same unit and branch with an open **unpaid, unconsumed** POS: reopen its quotation and save changes to the SAME ID / POS no.; do not create a second POS. If payment, stock issuance, or other locks exist, open existing POS view rather than overwrite it.
- Detailed per-POS immutable *revision snapshots* saved locally with version, actor, Philippine time, operation, and before/after line and COGS values (existing legacy drafts keep the initial state on first revision). Separate admin audit messages preserved.
- Stock-consumption auto-POS and linked-transaction creation honor the global unit lock, preventing bypass through alternate flows. Existing duplicate open unit records are flagged for manual reconciliation, not silently deleted.
- `/docs`, `/sheets`, terminal/QR payments, COGS review per line, inventory release, and old sale records remain supported.

## Frontend security limitation
This is enforced in the **currently loaded local browser database only**. Because Vercel hosts the frontend but records are localStorage-based, different devices/browsers can still create independent conflicting data. True cross-branch enforcement requires one authoritative server database, a normalized-plate active-visit unique constraint, authenticated role checks, transactions, and server-side write validation. Do **not** treat frontend check as tamper-proof or globally enforced across devices.

## Validation
- Existing `npm run test:logic` tests plus new v9.12 draft control tests.
- `scripts/check-components.cjs` and `check-view-maps.cjs`.
- New library files compiled in isolation under strict TypeScript settings; new TSX source parsed for syntax.
- Full Next.js production build **not confirmed** (npm packages not installed; offline npm cache incomplete).
