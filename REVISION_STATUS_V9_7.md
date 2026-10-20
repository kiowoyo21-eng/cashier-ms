# Cashier System v9.7 — Expanded Docs & Sheets

## Intended use

The standalone `/docs` and `/sheets` routes are real editing workspaces in the same deployed Vercel app. Both remain linked to the Underchargers Cashier System, including the existing report-source picker, browser-local file library, file URLs, status / Admin review flow, and Delete Draft with confirmation.

## Expanded Sheets

- Multiple worksheets in a workbook (tabs: add, select, rename, delete).
- Virtualized scrolling grid, 80 initial rows, 16 columns, grows on scroll up to 1,000 rows and 52 columns per worksheet.
- Formula bar, cell navigation, formulas for arithmetic and `SUM`, `AVERAGE`, `COUNT`, `MIN`, `MAX`.
- Cell formatting: bold, italic, underline, alignment, text/fill colors, currency/percent.
- Selection-based formatting, clipboard paste of rectangular TSV, undo/redo, find/replace, row/column insertion, row deletion.
- Import CSV and XLSX as additional worksheets. Export all worksheets to actual XLSX with basic styles/formulas, and current worksheet to CSV.

## Expanded Docs

- A4-style full-page editing, zoom, word & character counter, headings/paragraphs, rich-text formatting, alignments, lists, hyperlink, table insertion, horizontal line, find/replace, undo/redo.
- Report / inventory incident / meeting minutes starter templates.
- Import DOCX/HTML/TXT and export real DOCX, HTML; print to PDF through the browser.
- Sanitization of imported/formatted HTML; prevents unsafe scripts, URLs, and unsupported CSS.

## Data and security rules

- Same storage key `uc_report_studio_v1` — old v9.3–9.6 report files remain readable.
- Editing a report copy never modifies POS or stock ledgers.
- Submitted/approved files remain locked; role-based display guards and reviewer checks unchanged.
- **Frontend only**: role guards, approval, local drafts, links and audit trails are not secure against a malicious browser user. Cloud sync, simultaneous collaboration, permission enforcement, and reliable cross-device files need a backend.
- Browser localStorage quota applies, and Office file import has file-size and ZIP-uncompressed-size limits.

## QA

- Existing logic tests and v9.7 smoke tests pass.
- Independent type-check of `lib/report-studio.ts`, `lib/office-export.ts`, `lib/office-import.ts`, `lib/office-html.ts` passes.
- `.xlsx` files verified with Python openpyxl (two sheets, formulas, font and cell fill, currency styles).
- `.docx` files verified with Python python-docx (styles and paragraphs).
- Full Next.js production build / browser interaction test **not run** because package registry DNS was unavailable in this environment. Run `npm ci` or `npm install`, then `npm run build` before deploying. If Vercel reports errors, use the build log.

## Deployment

Merge patch files over your existing v9.6.1 code in GitHub or use the full ZIP. Commit/push to the Vercel-connected branch. Your app uses same-domain `/docs` and `/sheets` URLs; no domain-specific hardcoding. The service worker cache version is bumped to `uc-fund-shell-v9-7` to replace previously cached JS/CSS after deployment.
