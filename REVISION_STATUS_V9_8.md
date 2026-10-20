# Cashier System v9.8 — Terminal Transaction Tracking

## Frontend scope

A separate **Terminal Transactions** top-level sidebar page for Cashier and **Terminal Oversight** for Admin. Neither is embedded inside the POS dialog; they are main Cashier System views. The existing `/docs` and `/sheets` standalone routes remain unchanged.

### POS payment controls

- Cash is recorded as a standard POS payment.
- Card, GCash, and Bank Transfer POS payments now require **provider, terminal/device ID, unique transaction reference/trace, amount, and date**.
- Each successful digital POS payment is saved together with one matching terminal ledger event. The branch/provider reference cannot be reused, and payment cannot exceed the remaining POS balance.
- Older digital POS payments without a recorded terminal slip are **flagged as untracked**; nothing is silently invented or backfilled.

### Independent terminal ledger

- Cashier can record **approved but unmatched payments, declined/failed attempts, voids, and refunds** using the original receipt information. Events are retained and auditable in this UI; no Delete option.
- Void and refund events must reference a recorded original payment and cannot exceed the unreversed amount. They do **not** silently reverse the POS payment or sales: financial corrections need a separate authorized sales/accounting process.
- An unmatched approved terminal event may be linked to an **open POS**, creating the POS payment against the existing terminal receipt, or to a **matching older POS payment**, without double-counting POS revenue.
- Legacy POS payments may instead be linked to an original printed terminal receipt without changing the sales total.

### Daily terminal settlement and oversight

- Cashier submits a device/provider/day batch reference, printed settled total and notes. System compares against the captured payments less logged refunds/voids. Declines do not affect captured funds.
- Admin may **Verify** a clean batch after an independent check or **Flag** it for investigation. Verification is blocked for mismatched amounts, unmatched terminal payments, unresolved exceptions, missing same-day legacy digital receipts, or post-submission data changes.
- Flagged batches may be **superseded by a new submission**, preserving the rejected batch's audit trail; pending/verified batches are immutable.
- Search by date/reference/device, filter transaction kinds, and export ledger CSV.

### Linked Docs & Sheets reporting

The Report Studio source picker now includes **Terminal Transaction Ledger** and **Terminal Settlement Reconciliation** for Admin/Cashier. The exports are snapshots: editing those files does not modify transaction records. Parts Buyer access is excluded.

## Database migration

New browser-local fields: `terminalEvents` and `terminalSettlements` on Database, and optional terminal receipt fields on POSPayment. `loadDB()` normalizes these arrays while preserving v9.7 records. The underlying storage key is unchanged.

## Testing / limitations

- All existing v9.7 and v9.8 logic tests pass. New smoke test covers role guards, duplicate references, overpayment, unmatched linking, refunds and voids, settlement review/revision, legacy matching, and Report Studio role scope.
- Independent strict type check passed for `lib/data.ts`, `lib/terminal.ts`, `lib/report-studio.ts`. React TSX parsing passed for the modified UI.
- **Full Next.js production build NOT confirmed locally.** This environment does not contain npm dependencies; offline npm install returned `ENOTCACHED`. Run `npm install` then `npm run build`, or inspect Vercel build log on deploy.
- **Frontend-only demo:** these are manual terminal receipt entries, NOT actual live bank/GCash/Maya/BDO transaction feeds. This cannot detect terminal transactions the Cashier never enters, prevent an attacker from modifying browser storage, or reconcile multiple employees/devices. For real controls, implement authenticated server APIs, append-only ledger, bank/acquirer statement import, reconciliation and real access permissions.

## Deployment

Merge complete v9.8 project or patch files over v9.7, commit to the GitHub branch connected to Vercel, and redeploy. PWA cache version is bumped to `uc-fund-shell-v9-8`.
