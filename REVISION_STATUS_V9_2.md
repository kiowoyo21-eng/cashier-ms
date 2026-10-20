# v9.2 — Controlled Barcode Inventory / Frontend Prototype

## Added

- Controlled Stock In receipt submission (Pending for both Cashier and Admin); duplicate reference guard per branch.
- Separate Admin physical-count review panel: independent master-barcode rescans, quantity comparison, optional serial rescans, verification evidence, reviewer notes and refusal on mismatch.
- Stock release authorization requests linked to existing customer/plate POS; require a work reason; no automatic POS creation in the v9.2 UI.
- Pending issue reservations to prevent concurrent over-request of available units.
- Admin stock release review panel; only independent Admin approval creates append-only Stock Out with request/POS linkage and locked historical COGS.
- Stock release status in POS, Pending Out in Inventory, pending-issue Admin queue, additional audit entries.
- New product registration is zero-stock until a separately reviewed physical receipt.
- Guards against POS close while stock issues remain pending and against manually adding an exact registered inventory item as a POS part to bypass the release flow.
- v9.2 automated logic tests for receipt, issue, duplicate, branch, reservation and authorization transitions.

## Preserved / Compatibility

- Existing financial, PB, report and POS logic, barcode camera option, serialized unit support and original movement ledger.
- Historical data and legacy helper functions remain for compatibility; some older test assertions were updated for the intentional change in v9.2 UI flow.
- All records remain local to browser. No Supabase changes.

## Known limitations

- This is not tamper-proof authorization. Browser localStorage, demo passwords and JavaScript role checks are **not security boundaries**.
- Independent review requires distinct user accounts. An Admin-submitted receipt cannot be approved by the same Admin; create a separate Admin user or have Cashier prepare the receipt.
- Old pending-initial stock created by the prior workflow can still post via legacy cost configuration; move migration and approvals server-side before live use.
- No authenticated server-side document storage, cycle-count variance alert system, cross-device transaction locking, or actual camera/hardware QA in this environment.
- Full Next.js production build was not possible here because npm package dependencies were not installed; source parsing, TypeScript business-layer checking, and smoke tests pass.
