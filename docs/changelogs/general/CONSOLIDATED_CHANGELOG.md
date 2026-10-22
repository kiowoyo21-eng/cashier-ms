# Consolidated HRMS Change Log - 2026-10-20

**Base:** latest user uploaded `hrms-prot-main(1).zip` (whole project).

**Included changes over that base:**

- **Navigation:** Add missing `HardDrive`, `FileSpreadsheet`, `FilePenLine` icon mappings to `app/page.tsx`.
- **Spreadsheet routing:** Fix legacy workbook ID type narrowing in `components/SpreadsheetPageClient.tsx`.
- **Payroll:** Add `lib/payrollBatches.ts` and modify `lib/payrollConfig.ts`, `lib/hrState.tsx`, `lib/reportSheetData.ts`, `lib/workbookRegistry.ts`, `components/PayrollOperationsHub.tsx`, `components/SpreadsheetPageClient.tsx`, `components/SpreadsheetWorkspace.tsx` for separate payroll batch IDs, draft/release grouping, and batch-focused worksheets.

The project also retains all functionality already in the latest base archive, including demo role click-to-fill cards, dedicated Docs routes, Drive viewer, PDF forms, audit helpers, and module-specific workbooks.

Source-level validation and full Next.js build status are listed in `CONSOLIDATED_QA.md`.
