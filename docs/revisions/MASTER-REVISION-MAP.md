# HRMS master revision map

Status follows **actual code changes**, not intention. `implemented` does not imply browser QA verification. The current source is a frontend-only demo.

| ID | Scope | Batch | Status | Affected paths / reason |
|---|---|---|---|---|
| NAV-01 | Request and Reports grouped nav | 01 | implemented | lib/mock.ts; components/GroupedWorkspace.tsx; app/page.tsx |
| NAV-02 | Reports and Demographics grouped nav | 01 | implemented | lib/mock.ts; components/GroupedWorkspace.tsx; app/page.tsx |
| NAV-03 | Tools grouped nav with existing editors | 01 | implemented | lib/mock.ts; components/GroupedWorkspace.tsx; app/page.tsx |
| NAV-04 | Payroll / Leave grouping | 01 | deferred | No consolidation: separate complex operational workflows; preserve existing modules |
| NAV-05 | Recruitment before Employee 201 | 01 | implemented | lib/mock.ts |
| RBAC-01 | Audit Log for Super Admin only | 01 | implemented | lib/mock.ts; app/page.tsx; components/AuditLogWorkspace.tsx |
| RBAC-02 | Ms Kate HR access plus special final approval | 01 | implemented | lib/mock.ts; components/studio/StudioGate.tsx (existing HR-like gate) |
| UI-01 | Universal grouped tabs, controlled widths and responsive positioning | 01 | implemented | components/GroupedWorkspace.tsx; app/universal-ui.css |
| UI-02 | Entire-app card, popover and modal QA | 01+04 | partial; browser QA outstanding | app/globals.css; app/universal-ui.css; components/LeaveManagementWorkspace.tsx; components/IncidentWorkspace.tsx; page-by-page screenshot check still required |
| DOC-01 | Subject-based Markdown organization | 01 | implemented | docs/INDEX.md; docs/readme/; docs/revisions/; docs/architecture/; docs/workflows/; docs/changelogs/ |
| DASH-01 | Dashboard and pending-action redesign | 02 | implemented (browser QA pending) | app/page.tsx; components/DashboardOverview.tsx; components/DashboardOverview.module.css; components/DashboardExtras.tsx; components/ModuleAlerts.tsx; app/globals.css |
| REP-01 | Analytics and Demographics details | 02 | implemented (browser QA pending) | components/ReportsLanding.tsx; components/EmployeeDemographicsWorkspace.tsx; components/HROperationsExtras.module.css; app/globals.css |
| EMP-01 | Employee 201 parent + 4 cards + history | 03 | implemented (browser QA pending) | components/EmployeeWorkspace.tsx; components/workspace/EmployeeFullRecord.tsx; app/globals.css |
| HIRE-01 | Hiring calendar positioning | 03 | implemented (browser QA pending) | components/RecruitmentInterviewCalendar.tsx; components/RecruitmentWorkspace.tsx; app/globals.css |
| PAY-01 | NCR 755 reference in pay-rate view | 03 | implemented (browser QA pending) | components/PayrollOperationsHub.tsx; app/globals.css; underlying payroll library left unchanged |
| LEAVE-01 | Leave and incentive approval layout | 04 | implemented (browser QA pending) | components/LeaveManagementWorkspace.tsx; app/globals.css |
| RQ-01 | Request/incident feature polish and validation | 04 | implemented (browser QA pending) | components/HRFormsRequestsWorkspace.tsx; components/HROperationsExtras.module.css; app/globals.css; components/GroupedWorkspace.tsx |
| QA-01 | Cross-module UI and approval regressions | 04 | partial; runtime QA blocked | lib/mock.ts; app/page.tsx; components/GroupedWorkspace.tsx; app/drive/; app/spreadsheets/; app/studio/ |

## Original 58-item review checklist

The following tracks each originally numbered requirement. `Implemented (unverified browser)` is **not** equivalent to QA passed. See batch reports for file paths and verification.

| Review # | Module | Proposed requirement | Batch | Current state |
|---|---|---|---|---|
| 01 | navigation + permissions | Combine HR Forms & Requests and Incident Reports into Request and Reports | 01 | implemented (unverified browser) |
| 02 | navigation + permissions | Combine Reports & Analytics and Demographics | 01 | implemented (unverified browser) |
| 03 | navigation + permissions | Combine Drive, Spreadsheet and Documents Library into Tools | 01 | implemented (unverified browser) |
| 04 | navigation + permissions | Payroll and Leave grouping (review before any merge) | 01 | deferred; keep separate operations |
| 05 | navigation + permissions | Audit Log access restricted to Admin only | 01 | implemented (unverified browser) |
| 06 | navigation + permissions | Recruitment & Hiring directly before Employee 201 | 01 | implemented (unverified browser) |
| 07 | dashboard | Remove redundant dashboard All branches headcount line | 02 | implemented (browser QA pending) |
| 08 | dashboard | Compact dashboard header replacing oversized hero | 02 | implemented (browser QA pending) |
| 09 | dashboard | Uniform workforce overview metric cards | 02 | implemented (browser QA pending) |
| 10 | dashboard | Remove unnecessary Total Employees / Salary Released spans | 02 | implemented (browser QA pending) |
| 11 | dashboard | Reduce workforce demographics whitespace | 02 | implemented (browser QA pending) |
| 12 | dashboard | Redesign Pending Actions by Module cards | 02 | implemented (browser QA pending) |
| 13 | dashboard | Prioritize urgent true pending actions and verify counts | 02 | implemented (browser QA pending) |
| 14 | dashboard | Preserve meaningful dashboard analytics | 02 | implemented (browser QA pending) |
| 15 | employee-201 | Compact Employee 201 full record view | 03 | implemented in source (browser QA pending) |
| 16 | employee-201 | Employee 201 filtering improvements | 03 | preserved existing filters; no new filter rewrite |
| 17 | employee-201 | One parent containing four clickable info cards | 03 | implemented in source (browser QA pending) |
| 18 | employee-201 | Remove oversized individual label-value tiles | 03 | implemented in source (browser QA pending) |
| 19 | employee-201 | History views for individual Employee 201 cards | 03 | implemented in source (browser QA pending) |
| 20 | employee-201 | Preserve all Employee 201 fields and actual data | 03 | implemented in source (browser QA pending) |
| 21 | employee-201 | Sensitive statutory ID role restrictions | 03 | implemented in source (browser QA pending) |
| 22 | payroll | NCR automotive ₱755/day rate reference only | 03 | implemented in source (browser QA pending) |
| 23 | payroll | Remove unrelated regional rate options in reference | 03 | implemented in source (browser QA pending) |
| 24 | payroll | Preserve actual compensation and historic payslips | 03 | implemented in source (browser QA pending) |
| 25 | payroll | Confirm wage classification applicability | 03 | implemented in source (browser QA pending) |
| 26 | payroll | Compact Payroll & Leave internal workflows | 03 | partially implemented; leave cleanup deferred to Batch 04 |
| 27 | hiring | Hiring three stacked cards left, calendar right | 03 | implemented in source (browser QA pending) |
| 28 | hiring | Stable controlled desktop calendar dimensions | 03 | implemented in source (browser QA pending) |
| 29 | hiring | Mobile/tablet repositioning instead of component scaling | 03 | implemented in source (browser QA pending) |
| 30 | hiring | Preserve existing hiring functionality | 03 | implemented in source (browser QA pending) |
| 31 | navigation + permissions | Demographics dedicated internal Reports & Analytics tab | 02 | implemented (unverified browser) |
| 32 | reports-analytics | Preserve demographic and government-relevant breakdowns | 02 | implemented (browser QA pending) |
| 33 | reports-analytics | Compact demographics panels and cards | 02 | implemented (browser QA pending) |
| 34 | reports-analytics | Avoid duplicate analytics KPIs and charts | 02 | implemented (browser QA pending) |
| 35 | reports-analytics | Preserve report exports and data-gap awareness | 02 | implemented (browser QA pending) |
| 36 | leave | Leave Incentive Approval uniform metrics | 04 | implemented in source (browser QA pending) |
| 37 | leave | Fix concatenated number-label KPI values | 04 | implemented in source (browser QA pending) |
| 38 | leave | Reduce oversized Leave search/filter wrapper | 04 | implemented in source (browser QA pending) |
| 39 | leave | Compact honest Leave table empty state | 04 | implemented in source (browser QA pending) |
| 40 | leave | Consistent Leave status and action controls | 04 | implemented in source (browser QA pending) |
| 41 | leave | Preserve Leave credit proposals and approvals | 04 | implemented in source (browser QA pending) |
| 42 | universal-ui | Uniform equivalent card styles globally | 01/04 | partially implemented; final QA pending |
| 43 | universal-ui | Uniform equivalent icon placement | 01/04 | partially implemented; final QA pending |
| 44 | universal-ui | Controlled max widths, no forced stretching | 01/04 | partially implemented; final QA pending |
| 45 | universal-ui | Responsive positioning instead of arbitrary shrinking | 01/04 | partially implemented; final QA pending |
| 46 | universal-ui | Compact label-value details | 03/04 | partial: Employee 201 details completed in source; other modules require visual QA |
| 47 | universal-ui | Remove excessive whitespace | 02/04 | partial: Dashboard, Reports, Leave, Requests and Incident views compacted |
| 48 | universal-ui | Universal popup/modal/dropdown clipping and stacking QA | 01/04 | existing shared controls inspected; full QA pending |
| 49 | universal-ui | Uniform functional buttons, filters and tables | 01/04 | existing shared controls inspected; full QA pending |
| 50 | universal-ui | No promotional or duplicate module copy | 02/04 | partial: dashboard hero replaced; other pages need copy audit |
| 51 | universal-ui | Preserve working features/data with no breaking rewrite | 01/04 | no data migration; regression QA pending |
| 52 | navigation + permissions | Ms Kate retains normal HR access including Document Studio | 01 | implemented (unverified browser) |
| 53 | navigation + permissions | Ms Kate has distinct final-approval authority | 01 | implemented (unverified browser) |
| 54 | navigation + permissions | Ms Kate not automatically Admin | 01 | implemented (unverified browser) |
| 55 | navigation + permissions | Protect Audit Log navigation, deep action and content | 01 | implemented (unverified browser) |
| 56 | navigation + permissions | Permissions retained for all grouped internal modules | 01 | implemented (unverified browser) |
| 57 | architecture/workflows | Future Accounting -> Ms Kate final approval sequence | 01/04 | architecture preserved; no live integration |
| 58 | architecture/workflows | Cross-app workflows planned only; ERP disconnected | 01/04 | architecture preserved; no live integration |

## Batch 03 source check (2026-10-22)

See [Batch 03 revision map](batches/BATCH-03.md) and the Employee 201/Hiring/Payroll module docs. Source and CSS parse, relative imports, and documentation links were checked. Full Next.js type-check/build and real browser testing remain blocked or pending; therefore no Batch 03 item is marked **verified**.

