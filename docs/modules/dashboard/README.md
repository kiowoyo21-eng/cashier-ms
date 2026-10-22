# Dashboard module

Implementation: `app/page.tsx`, `components/DashboardOverview.tsx`, `components/DashboardOverview.module.css`, `components/DashboardExtras.tsx`, `components/ModuleAlerts.tsx`.

Data source: `lib/dashboardAnalytics.ts` (Employee 201/current branch, applied offboarding, browser-reviewed salary releases); `lib/moduleAlertViews.ts` for pending alerts, plus `lib/hrForms.ts` and `lib/incidentRecords.ts` for request summaries.

- Dashboard header follows the topbar's branch picker; period is the last completed month (Manila timezone).
- Cards report headcount, recorded gender, monthly hires and applied separations, and actual reviewed gross salary releases (no salary estimate).
- Workload/request counts are local to visible records and current role/branch.
- Pending Actions shows only actual published pending alerts for allowed modules; urgency is sourced from alert level, not inferred from headcount.
- Actions navigate through the app's existing module routing. Report summary selector is retained in a collapsible section to avoid duplicating primary metrics.

No production authentication, live Accounting releases, secure server storage or real-time alerts are implied.
