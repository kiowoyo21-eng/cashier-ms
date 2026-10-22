# HRMS UI Layout Recovery V1 — Changelog

**Baseline:** User's `hrms-prot-main (1).zip` plus `hrms-premium-dashboard-employee201-add-filter-combined-patch-only.zip` (already delivered). Prepared October 21, 2026.

## Changes

1. `app/layout.tsx` — load new route-wide `layout-recovery.css` **after** the existing global and universal UI styles. No changes to metadata, components, or HRMS state.
2. `app/layout-recovery.css` — repair previously unstyled `employee-full-*` fields; restore three/two/one-column responsive cards, clear label/value separation, edit input sizing, section spacing, compensation hints, and mobile styles. Restore the browser-only report spreadsheet (`rs-*` toolbar, tabs, cells, horizontal scrolling, sticky headers, and pagination); Leave add-request portal dialog (`uc-modal-*`); attendance controls and summary stats (`uc-attendance-*`); workbook cards; Studio document merge preview; applicant upload area; and a few previously missing supporting UI classes. Added safe flex/grid min-width and table-scroll safeguards without hiding overflowing content or changing records.
3. `components/ReportsLanding.tsx` — add **Table preview / Worksheet view** switch for a selected government sample report. Both the existing paginated table and worksheet remain available, but are no longer simultaneously rendered with duplicate data. Switching reports defaults to Table preview. Export, print, and official-reference sections remain available.

## Preserved

No change to Employee 201 fields or records, salary math, Payroll batches, Ms Kate's inherited HR permissions/exclusive final-approval permission, request approvals, localStorage keys, notification data, backend setup, or external integrations. CMS/Accounting are not connected; ERP remains fully standalone.

## Limitations

Fixes confirmed missing-style cases and one duplicate report UI; it is **not** proof every module or control is bug-free. Full Next.js build could not be run because offline npm cache lacks TipTap dependencies. See `QA_REPORT.md` and `WHOLE_SITE_UI_AUDIT.md` for verification levels.
