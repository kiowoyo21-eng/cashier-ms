# CMS v9.26 — Supplier Master, Products & Price Ledger

Base: v9.25.0. Frontend-only / local browser demo. No ERP connection or live CRM/Accounting sync.

## Main features

- Admin and Parts Buyer access to Suppliers sidebar. Cashier excluded. Supplier list is searchable and each supplier opens a compact detail workspace.
- Supplier profile with permanent **local** supplier ID, name, contact person, phone, email, TIN, address, notes and applicable UC MD / LP / QC / MM branches.
- Supplier-specific product catalogue with unit, latest recorded unit cost, chronological purchase/manual price history.
- PB RFP Parts Purchase saves continue to create the original financial ledger records and ALSO link automatically to the supplier and product ledger. Existing suppliers are matched using Unicode-normalized, case-insensitive, whitespace-normalized names. Unknown suppliers and their products are created once. No extra RFP expense, inventory units, payable or COGS is posted by this link.
- Existing valid RFP purchases are backfilled to the supplier catalogue on first v9.26 CMS initialization. Idempotent by source FundEntry ID; rejected entries do not show as purchase transactions or current price. Original RFP proof/receipt stays in its source transaction and is accessible by opening that record.
- Admin can create/edit supplier details and manually record supplier product unit prices. PB can read Supplier Directory and auto-create through Parts Purchase, but does not edit master details/opening payable manually.
- Admin can record supplier opening **payable** separately for Underchargers (UC MD+LP+QC) and Mastermind Autoworks (MM), with as-of date, required reason, actor and append-only change history.
- Opening payable is a reference snapshot, **not** the shared RFP fund opening balance and not a calculated live Accounts Payable balance. RFP parts purchases are normally paid and must not be booked as additional unpaid invoices. A true AP ledger requires supplier credit bill/payment evidence and eventual Accounting integration.
- Source transaction references remain linked. Existing browser storage namespace, accounts, financial records and approval rules are unchanged.

## Future shared supplier master

The eventual CRM / Cashier / Accounting integration requires **one central supplier master with a persistent global supplier ID** and entity-specific payable subledger. The v9.26 supplier IDs are stable inside this browser profile and represent migration candidates, not proof of cross-app integration. ERP remains standalone.

## Validation

- `node tests/v9.26-supplier-master-smoke.cjs` — passes strict library compile, dedupe, auto-backfill, supplier ID linking, price history, entity opening balances, audit records, rejected source filtering, and JSX source syntax.
- `npm run check:components` — 103 local imports resolved.
- `npm run check:view-maps` — 17 view mappings complete.
- Existing regression checks passed through v9.13 when run in the legacy suite; the full combined suite can exceed the execution timeout, so do not claim an end-to-end pass without a completed run.
- Full Next.js production build and live-browser UI verification have **not** been run here; npm dependencies are not cached offline. Verify on Vercel before treating as production-ready.
