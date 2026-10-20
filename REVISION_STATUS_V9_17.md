# v9.17 — Parts Purchase Vehicle Details, Branch Scope, Clear App Local Storage

Based on v9.16.1. Frontend-only; no backend or shared cross-device data.

## Parts Purchase
- Visible **Branch (assigned account)** field in the Parts Buyer purchase form. The branch is initialized from the authenticated Parts Buyer and cannot be changed to a different unauthorized branch. The system validates this again on submit, rather than trusting the form value.
- Branch drives purchase number, available RFP balance, purchase line branch, and POS/COGS plate matching. Confirmation also displays the branch.
- **Brand & Model** and **Year** are optional; blank is valid. User-entered brands/models are allowed. If a year is provided, it must be a valid four-digit year from 1950 to next calendar year.
- Plate remains required because the current PB-to-POS association is based on normalized plate + branch.
- Existing purchase quantity, cost, supplier, signature, status, audit, receipt attachments, and financial flows remain unchanged.

## Browser Local Storage
- In Admin → Settings → Backup & Test Tools, **Clear App Local Storage** clears both the cashier database and local Docs/Sheets (`underchargers-fund-management-demo-v1` and `uc_report_studio_v1`) plus cashier session / report prompt session keys. It deliberately does not clear unrelated same-origin storage keys, nor any cloud data.
- Requires `CLEAR ALL` typed confirmation **and** a final confirmation dialog. Refreshes the page to first-time Admin setup after deletion.
- **Export Complete Local Backup** stores cashier data, local accounts, audit, and Docs/Sheets in a single private JSON archive. The existing Admin Restore JSON Backup now accepts both database-only and complete local backups. Archives contain passwords and sensitive records; handle securely.
- This browser-local reset itself cannot retain an audit trail after erasure. It is strictly a prototype/testing convenience, **not** a production-grade or centrally authorized reset.

## Validation
- `npm run test:logic` passed, including v9.17 branch/optional vehicle/clearing tests.
- `npm run check:components`: 77 imports resolved.
- `npm run check:view-maps`: 14/14 navigation labels and subtitles.
- TSX syntax parsed successfully; new TypeScript-only modules compiled with strict checking.
- Full `next build` was not runnable in this environment: npm dependency installation failed with EAI_AGAIN while contacting registry.npmjs.org. Verify on Vercel after deployment.
