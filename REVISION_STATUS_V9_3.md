# v9.3 — Report Studio (Spreadsheet + Documents)

## Added

- New **Report Studio** sidebar page for Admin, Cashier and Parts Buyer, plus shortcut from Reports & Exports.
- Browser-local file library with names, search, saved editable drafts, duplication, and delete-draft action.
- **Spreadsheet**: editable grid and formula bar, add row and column, formulas (`+`, `-`, `*`, `/`, references and `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT` with cell ranges), formula result CSV export and browser print/PDF.
- **Documents**: rich text editor with headings, bold, italic, underline, numbered/bullet lists, editable data tables and Word-compatible `.doc` export/print/PDF.
- Convert an edited spreadsheet into a separate editable document.
- Source snapshots from Fund Transactions, POS & Sales, Cash Counts, Inventory Balance, Stock Movement Ledger, Parts Purchases, and Admin Audit Trail, restricted by role, branch and selected date period.
- Report lifecycle: owner draft → submit → separate Admin approve/lock or request changes → owner revises and resubmits. Approved reports can be duplicated to a new draft without changing the original.
- Data isolation: Report Studio writes only to a **separate localStorage key** `uc_report_studio_v1`, and never changes sales, inventory, financial or audit records. Imported data is a fixed, editable snapshot.
- CSV injection protection for exported cells; formula evaluation uses a restricted interpreter (no `eval`).

## Limits / production requirements

- This is **frontend-only**. All saves and approvals are local to one browser and are not secure, shared, or tamper-proof. Server authentication, row-level data permissions, append-only review records, backup/sync and signed report snapshots are required before using as trustworthy business reports.
- CSV is a spreadsheet interchange format; XLSX workbook export is not yet implemented. Word-compatible `.doc` is HTML-based, not native `.docx`.
- Spreadsheet caps: 250 rows × 26 columns per file. Imported source rows beyond the limit are truncated with an on-screen notice. Existing Reports CSV export remains available for full raw data.
- Reports from this workspace are marked as reporting copies; modifications never affect underlying transactions.
- `npm install` and full Next.js build could not be run here because npm registry DNS was unavailable. Source TS checks for the standalone business logic, JSX parse checks, existing smoke tests and v9.3 smoke tests pass.

## Verification

- `NODE_PATH=<typescript-global-path> npm run test:logic` — all v9.2 and v9.3 smoke tests passed on 2026-10-19.
- `tsc --noEmit --strict --target es2017 --lib es2022,dom,dom.iterable --skipLibCheck lib/report-studio.ts lib/data.ts` — passed.
- TSX transpilation diagnostics for `components/ReportStudio.tsx` and `app/page.tsx` — no parse errors.

## How to review

1. `npm install` (on a normal network), then `npm run dev`.
2. Log in using one of the demo roles, then choose **Report Studio** in the navigation.
3. Choose a source/dates, then **New Spreadsheet** or **New Document**. Or choose Blank template.
4. Edit the separate copy and submit it for review. Admin can open submitted staff reports and approve or request changes.
5. Download CSV / Word-compatible .doc, or print/save as PDF.
