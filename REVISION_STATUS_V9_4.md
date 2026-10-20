# v9.4 — Separate Spreadsheets & Documents Workspaces

## Changes
- Replaced the combined **Report Studio** main sidebar item with independent **Spreadsheets** and **Documents** primary navigation items for Admin, Cashier and Parts Buyer.
- Each workspace shows only its own files and its own new-file action. Both can import the existing date- and role-filtered reporting snapshots.
- Kept existing v9.3 `uc_report_studio_v1` localStorage data so previously created files remain available under their respective tabs.
- Added delete controls for the file listing and open editor, with an explicit permanent deletion warning.
- Only file owners can delete their **Draft** or **Changes Requested** reports. **Submitted** and **Approved** reports cannot be deleted, preserving the local review trail.
- Converted spreadsheets open the Documents workspace immediately.
- Existing Reports & Exports page links directly to each workspace.
- Original POS, inventory, and financial transactions are never changed by file deletion.

## Scope and limitations
Frontend only; browser localStorage permissions and historical approvals are *not* secure or tamper-resistant. Production requires server-side permissions, review logs, backups, and retention policies.

## Tests
`npm run test:studio` and `npm run test:logic` (requires TypeScript) cover the new navigation and deletion policy, plus prior reporting and inventory rules.
