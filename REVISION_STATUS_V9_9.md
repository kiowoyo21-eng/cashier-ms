# v9.9 — Clean start and cashier POS simplification

- New installations: no seeded transactions, POS receipts, terminal entries, stock, counts, incidents or historical audit. Opening RF/RFP balances are zero.
- Existing localStorage data: exact legacy sample records removed only if unmodified and not referenced by legitimate business records. Never bulk-delete user-generated transactions.
- Demo identities retained for role-based frontend login until backend authentication.
- POS creation changed from 3-step to 2-step: Customer & Vehicle → Services & Parts, then draft payment screen.
- Optional internal costing and COGS sections are collapsed; payment and completion instructions are explicit.
- Registered inventory cannot be added as a manual part from initial POS wizard; separate Admin-approved stock release remains required.
- Terminal payment references, ledger, audit logs and approval safeguards remain.
- PWA cache updated for changed frontend assets.
- Regression suite includes new seed-removal and POS safety coverage.
- Full production Next.js build remains unverified without local npm packages.
