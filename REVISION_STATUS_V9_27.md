# CMS v9.27 — Account Starting Balances + Supplier Review Queue

Base: v9.26.0 (frontend-only; browser-local). Applies only to the Cashier System, not ERP or a live Accounting integration.

## Financial Monitoring: Account Balances (Admin only)
- Separate Cash/Bank/Terminal/Other account master with UC or MM ownership; optional branch assignment. Each account starts at a verified Admin-entered amount and as-of date, requiring a reference.
- Current CMS book balance = opening balance + manual ledger inflows − manual ledger outflows. Admin may correct opening amounts with an audited entry (not a second inflow). Manual ledger postings require unique references within the account.
- Neither the account opening balance nor any manual account movement changes POS revenue, RF/RFP starting balance, supplier accounts payable, actual bank balance, or Accounting entries. Automatic source mapping and reconciliation remain future work.
- UC is one accounting entity across Mandaluyong, Las Piñas, Quezon City; MM is separate. RFP remains one shared consolidated fund: this new account ledger does not create independent branch RFP pools.

## Supplier roles & approval
- Admin can create suppliers and record supplier products/prices directly. PB and Cashier see the directory and may request supplier/product additions; requests stay Pending Admin Approval until Admin decides them. Rejections require a reason. Requests retain actor/date/decision in browser-local history.
- New PB Parts Purchases create original RFP expenses and submit supplier/product/price suggestions; the expense itself is not deferred by the supplier master queue. Known suppliers match by normalized name. Source ID links purchase-price requests to their original expense; approval adds a supplier price event without reposting expenses, stock, payable or COGS.
- Historical v9.26 supplier master and older purchases are grandfathered; v9.27 pending/rejected suggestions are excluded from historical automatic backfill on reload.
- Supplier Opening Payable is now only available as a legacy read-only historical record; it is not used as account starting balance.

## Sample supplier
- One explicitly fake supplier, `SAMPLE — Demo Auto Parts Supplier`, with sample catalog costs (PHP): Engine Oil 5W-30 480/L, Oil Filter 250/pc, Brake Pad Set 1,450/set, Air Filter 420/pc, Cabin Filter 380/pc.
- Auto-added only on a new/empty supplier catalogue with an active Admin and no RFP purchases. Existing populated accounts can choose `Load Sample Supplier & Prices` in Admin Suppliers. Idempotent and cannot silently overwrite actual supplier records. No transactions, stock quantities or payable amounts are created.

## Access & deployment
- Cashier is single-branch for financial operations, with supplier directory/request access. PB remains all-branch for parts procurement. Account Balances is Admin-only.
- Browser-local data are not shared across Admin/PB/Cashier devices. Production authorization needs server-side access control, shared supplier IDs and real approval audit records.
- No localStorage key reset. Backup existing records before applying patch to v9.26. New fields are optional and older backups remain readable.

## Validation performed
- `tests/v9.27-account-balances-supplier-approval-smoke.cjs`: PASS, strict library typecheck, role controls, accounting separation, pending/approve/reject, source-link and reload safeguards, sample data without financial postings, syntax.
- `tests/v9.26-supplier-master-smoke.cjs`: PASS.
- UI, profitability, PB/branch, disbursement, inventory, POS, Docs/Sheets and terminal regression scripts: PASS in separate batches.
- Component imports 109, navigation 17: PASS.
- **Not verified:** Complete Next.js production build and real browser visual QA, because Next/React dependencies are not installed in this environment. Deploy to a preview environment and confirm Vercel compilation before production use.
