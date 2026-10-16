# Underchargers CMS — browser-local rebuild

Clean Next.js 15 / React 19 / TypeScript application. Uses the browser's IndexedDB only, with no Supabase and no server database.

## Demo logins
- cashier / cashier12345
- admin / admin12345
- pbacc / pb12345

## Run
`npm install && npm run dev` or deploy to Vercel. Browser storage is per browser profile and origin. The login credentials are intentionally embedded in the client; use for prototyping only, not real funds or employee data.

## Scope
Functional local POS creation, quotation/payment/COGS, close and extensions; RFP parts-only transactions, one-to-one RFP-to-POS linking by plate; operating fund; PB-only RFP edit/branch correction requests with Admin approval; sales from closed POS; fund and POS reports with 30 transaction rows per print page; supplier management, cash count records, local activity audit, demo notifications, local JSON export. Legacy phone QR, cross-device collaboration, genuine signature authorization and production accounting reconciliation require a server and are not provided.

## Verification fixes for reviewed version
- PB may view POS references but may not create, modify, close or extend POS.
- RFP edit requests and approvals reject invalid quantities, costs, plate and branch.
- Print All from Reports renders consecutive 30-row groups with compact A4 landscape styles.
- Browser-local role/password checks are **not secure authorization**.
- Remaining original CMS features, including incident-gated BOD/EOD, supplier disbursement, phone QR proof and full reconciliation are **not implemented** in this prototype.
