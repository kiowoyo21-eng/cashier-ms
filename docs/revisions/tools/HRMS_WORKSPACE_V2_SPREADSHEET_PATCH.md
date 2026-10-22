# HRMS Workspace V2 — spreadsheet improvements (incremental patch)

## Apply
- **Requires the V1 cumulative patch installed first.** This ZIP includes only V2 additions/changed files; do not apply it to the original October 15 source without V1.
- Extract on top of the existing project root, preserving `components/`, `lib/`, `app/`, and `docs/` directories. Review and commit your existing local changes first.
- Run `npm install` after extracting: new dependency `exceljs@^4.4.0`, dynamically loaded when using Excel tools.
- Run `npm run build` and test in browser. Build and browser E2E weren't verified in the patch-building environment.

## New features
- Excel .xlsx **import preview**: choose source tab, inspect warnings and cell sample, import into an approved `Working Sheet` or custom worksheet only. No import into HRMS report worksheets.
- Drive `.xlsx` uploads open a separate Spreadsheet workspace with a source-tab preview. The original Drive upload stays untouched; it can still be downloaded with its own action.
- Excel .xlsx export of active worksheet or all workbook tabs, with raw formulas and basic style support. CSV/print tools retained.
- Shift+click / Shift+arrow multi-cell range selection; Ctrl/Cmd+C and Ctrl/Cmd+V TSV ranges; Clear range, Fill Down, Fill Right with relative and `$` absolute references.
- Existing admin request → approve → 60-minute edit access → revoke/expire flow enforced in the data layer for imports and edits. The new import replaces *only* the selected sheet's local working-copy cells after confirmation; approved payroll and Employee 201 records remain unchanged.
- Batch edit audit records are consolidated instead of creating thousands of individual entries.

## Important compatibility and security details
- Browser-only storage/auth/approvals are not secure, cross-device, or production-grade. Do not enter live government identifiers or confidential documents until a secure backend is integrated.
- XLSX import is limited to **3 MB, 20 worksheets, 4,000 rows, 52 columns, 2,000 populated cells per source tab**, and 1,500 characters per cell. Export supports up to 35,000 populated/styled cells per sheet. Limits keep browser-based loading bounded.
- Only currently supported safe formulas are imported as executable formulas; unsupported or external-link formulas are imported as literal text to prevent external execution. Macros (.xlsm), legacy .xls, pivot tables, complex merges, charts, chartsheets, cross-sheet formulas and complete Google/Excel fidelity are not supported yet.
- Supported formatting for import/export: bold/italic/underline, simple font/fill colors, alignment. Data validation, conditional formats and layout-rich Excel features aren't reproduced.
- XLSX workbooks uploaded to the browser-local Drive can be opened in the Spreadsheet import preview. It does not sync across browsers, or change the uploaded source in Drive.
- Downloaded XLSX can contain formula cells but its results depend on the opening spreadsheet application recalculating them.

## Validation performed on the patch authoring side
- 94 TypeScript/TSX files parsed without syntax errors; all TypeScript relative imports in the project resolve.
- Node focused tests passed for rectangular selections, copied formulas with relative/absolute references, formula parsing, batch import, approved/denied/revoked permissions and cross-module sheet protection.
- **Not verified:** full Next.js/ExcelJS install, `.xlsx` browser round-trip, browser E2E, or Vercel build. The environment could not complete npm install.
