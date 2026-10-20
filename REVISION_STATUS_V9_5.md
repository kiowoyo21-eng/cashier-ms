# v9.5 — Standalone Office Workspaces

## User requirement
The Spreadsheets and Documents editors must resemble independent Google Docs/Sheets-style pages, each with its **own real URL**, while the Cashier System must retain direct links to created files. The v9.4 embedded mini-tab experience was not acceptable.

## Implemented
- Moved spreadsheet/document rendering completely outside `app/page.tsx` (Cashier System dashboard).
- Added independent Next.js routes `/spreadsheets`, `/spreadsheets/[fileId]`, `/documents`, and `/documents/[fileId]` with dedicated browser-page editors.
- Main-role navigation for Admin, Cashier, and Parts Buyer is now real anchor navigation, with no embedded `ReportStudio` component on the home page.
- Added Office-style responsive top navigation, a files library, recent items, searchable file list, full-page spreadsheet grid/formula bar and document canvas/formatting bar.
- Retained formulas, CSV, Word-compatible `.doc`, Print/PDF, copy/convert, snapshot imports, Delete, and Admin Submit/Review/Lock workflow.
- Added copy-local-link action and safe post-login return to the same file URL.
- Added Connected Spreadsheets & Documents file links directly on the existing Reports page.
- Preserved browser-local key `uc_report_studio_v1`, role-limited file visibility, and original source-ledger isolation.
- Added multi-cell TSV paste and keyboard Enter movement in spreadsheet, added cross-tab storage-event refresh.
- Updated PWA cache version to force refresh of revised app shell.

## Validation
- `npm run test:logic`: passed after initial new route refactor; new deep-link validation rechecked in focused tests.
- `node tests/v9.3-report-studio-smoke.cjs`: passed including safe deep-link allowlist and formula/source/role checks.
- `node tests/v9.4-separate-workspaces-smoke.cjs`: passed, updated to assert standalone navigation instead of prior mini-tabs.
- `node tests/v9.5-standalone-office-smoke.cjs`: passed (route files, syntax, storage compatibility and new UX behavior).
- Full Next.js build not tested: dependencies are absent and offline `npm install` fails with `ENOTCACHED`.

## Explicit limitations
Prototype-only localStorage and sessionStorage. No secure backend, shared files across devices, live multiuser editing, or Google-native file formats. Approval and access checks are frontend demo behavior, not tamper-proof security.
