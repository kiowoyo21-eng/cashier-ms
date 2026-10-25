# Tools changelog

## 2026-10-22 — Batch 04 verification / visual adjustment

- Reviewed `components/GroupedWorkspace.tsx` Tools tab wiring to **DriveWorkspace**, **SpreadsheetPageClient**, and Document Studio's **StudioIndex**.
- `app/globals.css`: minor embedded studio sizing to align Document Library inside the Tools tab.
- Existing standalone Drive (`/drive`), Spreadsheet (`/spreadsheets`), and Document Studio (`/studio`) URLs were retained, as were browser-local stores, reference links and editor-specific permissions.
- No import/export/upload/storage operation was invented or enabled. HRMS Drive is intentionally view-only in its current component; editors operate in their own workflows. Runtime open/edit/save/exports need browser QA.

## 2026-10-25 — Patch 22: Tools as files, not catalog cards

- Replaced Spreadsheet workbook launcher cards with a searchable file list, visible role-aware New Sheet and Upload XLSX controls, and linked working sheets.
- Displayed Documents/PDFs and generated copies as compact file rows with existing actions preserved.
- Changed Document Studio creation from a large embedded form into New Document modal and compact upload controls.
- Replaced the Form Builder wide register with file rows and existing action pop-up; Source Forms references likewise show file-list rows while retaining their not-uploaded status.
- Defaulted Drive to file List view and made its New menu discoverable with a clear Super Admin gate in the current demo.
- No images/logos used; no cloud storage, production permissions or live intake submission capability added.
- Syntax, import resolution, focused Tools/Form/PSA/Dashboard tests passed; browser and full Next.js build remain unverified.
