# Universal UI Regression Checklist — V10 / V11

Check each on deployed desktop and narrow/mobile viewports; do not infer success from syntax parsing.

| Area | Scenario | Status |
|---|---|---|
| Audit Logs | Real browser actions visible, searchable, filterable, export matches filter | Targeted logic passed; browser pending |
| Notification bar | Single bell; no stale popup on branch switch; Escape restores focus | Source revised; browser pending |
| Roles | HR / Ms Kate module access, exclusive Ms Kate final approval, no Super Admin escalation | Matrix tests passed; browser pending |
| Employee 201 | Branch switch clears stale employee detail; unique rows; proper modal stacking | Needs V11 browser QA |
| Payroll | Batch/cutoff isolation, no duplicate releases, valid counts and dialogs | Needs V11 browser QA |
| Assets | Consistent branch totals and assigned custody, modal positioning | Needs V11 browser QA |
| Incidents | No duplicated note text, dialogs above overlays, scoped references | Needs V11 browser QA |
| Leave / Recruitment / Compliance | Dropdowns, portal modals, validation, multiple branches | Needs V11 browser QA |
| Docs / Sheets / PDF | New-tab routes, toolbar popovers, saved outputs and grants | Needs V11 browser QA |
| Responsive | No hidden actions, horizontal overflow or clipped dialogs | Needs V11 browser QA |

Do not label the HRMS production-ready until browser tests, Vercel build, and backend authorization/audit security are addressed.
