# Reports & Analytics, including Demographics

The main sidebar's **Reports & Analytics** groups two separate internal tabs (from Batch 01): Reports & Analytics and Demographics. Entry point: `components/GroupedWorkspace.tsx`. All legacy `filters` and `demographics` module navigation paths are retained.

- Reports: `components/ReportsLanding.tsx`, `ReportsWorkspace.tsx`, `ReportSpreadsheet.tsx`. Government reports are fictional preparation samples. Existing agency, period, search, branch, CSV, print/PDF and workbook actions remain.
- Demographics: `components/EmployeeDemographicsWorkspace.tsx`, `lib/employeeDemographics.ts`. Reads current branch-scoped Employee 201 data with effective-dated wage references; preserves classification editing for permitted HR users and CSV exports.
- Changes in Batch 02 are primarily compact, purpose-sized layout modifications in `app/globals.css` and `components/HROperationsExtras.module.css`.

No demographic or payroll calculation is fabricated and no wage-order reference has been updated as part of Batch 02 (that belongs to Batch 03).
