# Revision v9.2 — Consumed-stock POS accountability

## Implemented in the inventory domain

- Added `hasConsumedStock(db, posId)` to identify POS records with a StockOut ledger movement.
- Added `pendingConsumedStockPOS(db, branch?)` to keep all stock-consumed POS records in the pending set until POS status changes from Pending; records are not filtered by age.
- Added `pendingConsumedStockReminder(db, branch?, asOf?)` to provide daily reminder rows and age-in-days data for pending consumed-stock POS records, including records that are multiple days old.
- Added `assertPOSCanCloseAfterStockConsumption(db, posId)` to reject closing when a StockOut exists but required client, plate, vehicle, or POS item details remain incomplete.
- Added `tests/v9.2-consumed-stock-pending-smoke.cjs` covering multi-day reminders, close guard, and reminder removal after resolution.

## Important integration gap

The current active `app/page.tsx` uses `lib/store.ts` and Supabase `pos_accounts`. The inventory subsystem (`lib/data.ts`, `StockScanPanel.tsx`) is not imported into the active page and uses a separate browser-local data model. Therefore this revision adds and tests the domain rules, but does **not** yet wire the inventory-consumption event into the active POS wizard or the live `NotificationBell`.

To complete the end-to-end production behavior, inventory movements and POS draft metadata must be persisted in the same Supabase-backed workflow, with a migration/RPC that creates or updates a pending POS draft on Stock Out, opens the normal POS wizard at Step 1, and supplies branch-scoped pending-stock reminders. Do not treat the browser-local inventory model as the production ledger.
