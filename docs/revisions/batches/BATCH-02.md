# Batch 02 — Dashboard, Reports, Analytics & Demographics

Source: **Batch 01 updated ZIP**, not the pre-Batch-01 original.
Status: **implemented; full build and browser QA pending**, depending on available dependencies.

## Source mapping

| Scope | Actual source paths | Result |
|---|---|---|
| Top-level dashboard context | `app/page.tsx` | Removed duplicated standalone "All branches · N employees" label; global branch selector remains |
| Dashboard cards/panels | `components/DashboardOverview.tsx`, `.module.css` | Removed oversized hero, spanning totals/salary, blank-height panels; compact, uniformly icon-labeled KPI cards; retained month, live derived metrics, workflow links |
| Quick Actions/other report overview | `components/DashboardExtras.tsx`, `app/globals.css` | Shortened Quick Actions; redundant report summaries are a collapsible advanced section, retaining their filters and links |
| Pending actions | `components/ModuleAlerts.tsx`, `app/globals.css` | Display actual published alerts, counts and urgent chips; prioritise urgency, fixed-intent card widths, functional module navigation. No total record counts substituted |
| Reports | `components/ReportsLanding.tsx`, `app/globals.css` | Constrained and compact catalog/stat cards, removed hard-coded 2026 stat; preserved report filters, CSV, print, spreadsheets |
| Demographics | `components/EmployeeDemographicsWorkspace.tsx`, `components/HROperationsExtras.module.css` | Independent tab from Batch 01 retained, denser icon-led metrics and breakdowns, compact filters; CSV and Employee 201 classification remain present |

## Validation and limitations

See [Batch 02 verification](../ui-qa/BATCH-02-VERIFICATION.md) for actual command results, exact blockers, and browser QA checklist.

- Dashboard totals: `dashboardEmployeeSummary` reads `data.people` and *applied* offboarding cases; reviewed salary releases exclude sample records.
- Requests: `dashboardRequestSummary` uses visible forms and incidents; dashboard reflects last completed month and current branch.
- Pending-action counts: `dashboardAlertGroups` uses `visibleAlerts` (deduped, branch-scoped) rather than totals of all employee records.
- Government report cards remain **fictional preparation worksheets**, not approved submissions; no backend changes or new records were added.
- Role-based front-end routing and existing local-storage keys remain unchanged.
- **Type-check and browser QA must be re-run in an environment with Next.js/React dependencies installed.** Record measured results in a separate verification note; do not mark browser QA passed without running it.
