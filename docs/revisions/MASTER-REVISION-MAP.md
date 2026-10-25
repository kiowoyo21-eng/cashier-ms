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

| FIX-01 | Dashboard common card grid and spacing | 05 | implemented (browser QA pending) | components/DashboardOverview.module.css |
| FIX-02 | Hiring common width and calendar reflow | 05 | implemented (browser QA pending) | app/globals.css |
| FIX-03 | Employee 201 Overview primary, directory rows clickable, editing fields preserved | 05 | implemented (browser QA pending) | components/EmployeeWorkspace.tsx |
| FIX-04 | Payroll/Leave landing card consistency | 05 | implemented (browser QA pending) | app/globals.css |
| FIX-05 | Assets true modal action flows and accessible record rows | 05 | implemented (browser QA pending) | components/AssetWorkspace.tsx; app/globals.css |
| FIX-06 | Dashboard/demographics data card and record drill-downs | 05 | partial overall; named surfaces implemented; browser QA pending | components/DashboardOverview.tsx; components/EmployeeDemographicsWorkspace.tsx; components/EmployeeWorkspace.tsx; components/AssetWorkspace.tsx |
| FIX-07 | SSS/PhilHealth/Pag-IBIG/BIR compact dialog and bracket pagination | 05 | implemented (browser QA pending) | components/PayrollOperationsHub.tsx; app/globals.css |
| FIX-08 | Whole-system interactive controls and responsive QA | 05 | partial; live browser QA blocked | app/globals.css; components/ affected above |

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



## Batch 06 — Dashboard-only polish (2026-10-22)

| Revision ID | Module | Actual paths | Target | Batch | State | Verification |
|---|---|---|---|---|---|---|
| DASH-ALIGN-06 | dashboard | `app/page.tsx`, `app/globals.css` | One coherent centered bounded content grid for KPIs, alerts and shortcuts | 06 | Implemented | Static checks; browser pending |
| DASH-ACTIONS-06 | dashboard | `app/page.tsx`, `app/globals.css` | Alert priority, compact shortcuts, preserved collapsible reports and demo history | 06 | Implemented | Static checks; browser pending |
| DASH-COPY-06 | dashboard | `components/DashboardOverview.tsx` | Shorter accurate salary-source note | 06 | Implemented | Static checks; browser pending |

See [Batch 06](batches/BATCH-06-DASHBOARD.md). No non-dashboard modules changed.

## Batch 07 — revised 2026-10-22 UI/UX proposal, YTD Dashboard and visible reports

| ID | Module | Actual source paths | Outcome | Status | Verification |
|---|---|---|---|---|---|
| UI7-01 | Shared UI | `app/tokens.css`, `app/ui.css`, `app/layout.tsx`, `app/globals.css` | Foundations and aligned shell | implemented | Source syntax/CSS; browser pending |
| UI7-02 | Navigation | `app/page.tsx`, `lib/mock.ts`, `app/ui.css` | Four sidebar groups and distinct main icons | implemented | Source syntax; role browser QA pending |
| DASH7-01 | Dashboard | `lib/dashboardAnalytics.ts`, `components/DashboardOverview.tsx` | Current-year hires, applied offboarding and reviewed gross salary released | implemented | Synthetic YTD calculations passed; browser pending |
| DASH7-02 | Dashboard | `app/page.tsx` | Remove demo Sample Activity UI (retain audit data) | implemented | Source inspection; browser pending |
| DASH7-03 | Dashboard | `components/DashboardExtras.tsx`, `components/DashboardExtras.module.css` | Visible clickable additional reports, compact actions | implemented | Syntax/CSS; browser pending |
| DASH7-04 | Dashboard | `components/DashboardOverview.module.css` | Aligned three-column card layout/reflow | implemented | CSS parse; browser pending |
| UI7-03 | All modules | Existing module-specific CSS and components | Migrate Buttons, Fields, Tabs, Dialogs, Tables and legacy styles to shared primitives | planned | Not implemented in Batch 07; broad runtime QA required |

See [Batch 07](batches/BATCH-07-REVISED-UI.md) for exact data semantics and unresolved QA. All cross-app integrations remain separate and unconnected.

The YTD calculation smoke test is under `scripts/check-dashboard-ytd.cjs` (source-level test, not interactive payroll certification).

## Batch 08 — Universal UI component adoption (source edits; runtime not verified)

| Revision | Real files | Scope | State | Test/remaining work |
|---|---|---|---|---|
| UI8-01 | `components/ui/HrmsPrimitives.tsx`, `app/hrms-components.css`, `app/layout.tsx` | Shared visual/control primitives | implemented | Parse/import checks; use in further legacy screens |
| UI8-02 | `components/GroupedWorkspace.tsx`, `components/ReportsLanding.tsx`, `components/HRFormsRequestsWorkspace.tsx`, `components/RecruitmentWorkspace.tsx` | Consolidated working tabs | implemented | Source checks only; browser interactions outstanding |
| UI8-03 | `components/HelpButton.tsx` | Shared help dialog | implemented | Focus/Escape browser test outstanding |
| UI8-04 | `components/ui/useManagedDialog.ts`, `components/PayrollOperationsHub.tsx`, `components/LeaveManagementWorkspace.tsx`, `components/AssetWorkspace.tsx` | Topmost modal/keyboard behavior | implemented | Browser modal navigation/approvals outstanding |
| UI8-05 | `app/hrms-migration.css` | Scoped legacy card/input/table/modal polish | implemented | Responsive screenshots and full cross-module QA outstanding |
| UI8-06 | `scripts/check-ui-components.cjs` | Shared UI wiring smoke test | implemented | Script test passed; not a full UI test |
| UI8-07 | All legacy UI modules and styles | Complete React primitive migration, strict stylelint/token enforcement, CSS cleanup | **planned** | Do not claim complete until runtime and codebase-wide migration |

[Full Batch 08 mapping and limits](batches/BATCH-08-UNIVERSAL-UI.md).

## Batch 09 — Employee 201 Overview required documents + Dashboard actual records

| Revision | Actual source paths | Desired and implemented behavior | Status | Validation / outstanding |
|---|---|---|---|---|
| DOC9-01 | `components/EmployeeWorkspace.tsx`, `app/hrms-migration.css` | Restore Required Documents statuses/filename/HR review in Personal Information; working Documents tab action | implemented (source) | Source inspection + smoke assertion; browser attachment/navigation check pending |
| DASH9-01 | `lib/dashboardAnalytics.ts`, `lib/dashboardRecordViews.ts`, `components/DashboardOverview.tsx`, `components/DashboardExtras.tsx`, `components/ModuleAlerts.tsx`, `components/DashboardRecordsDialog.tsx`, module CSS | In-dashboard actual-data popups for displayed data cards, parity with filtered KPIs, expandable records | implemented (source) | Count/branch/date/role unit checks + parse/import; browser actions/responsive pending |
| DASH9-02 | Same | Full browser accessibility/regression across users/modules | blocked / not yet verified | Requires installed Next.js/React dependencies and interactive QA |

See [Batch 09 scope](batches/BATCH-09-EMPLOYEE-DOCUMENTS-DASHBOARD-DRILLDOWN.md).

## Batch 10 — PSA OWS / ISLE supporting datasets (manual government filing aid)

| Revision | Files | Status | Checks / constraints |
|---|---|---|---|
| PSA10-01 — Reports integration | `components/ReportsLanding.tsx`, `components/PsaDataSupportWorkspace.tsx`, `.module.css` | implemented (source) | Separate OWS/ISLE, single establishment/date filters, traceable tables; browser tab navigation pending |
| PSA10-02 — read-only datasets | `lib/psaDataSupport.ts` | implemented (source) | Employment, occupation, evidenced basic pay, dated releases, hires/separations; absent datasets flagged; historical records partial |
| PSA10-03 — file support | `components/PsaDataSupportWorkspace.tsx`, `lib/psaDataSupport.ts` | implemented (source) | CSV+print supporting rows with explicit warnings; export/browser interaction unverified |
| PSA10-04 — QA & documentation | `scripts/check-psa-data-support.cjs`, module README, changelog, this map and `docs/revisions/batches/BATCH-10-PSA-DATA-SUPPORT.md` | source checks completed | Full Next.js build and interactive desktop/mobile tests outstanding |

[Batch 10 detailed scope](batches/BATCH-10-PSA-DATA-SUPPORT.md).

## Batch 11 — PSA Entity + Dataset Popup + Demo Profile Review (2026-10-22)

| ID | Scope | State | Paths |
|---|---|---|---|
| PSA-11-01 | UC LP + MD + QC combined; MM fully separate, correct historical grouping | Implemented; browser QA pending | `lib/psaReportingEntity.ts`, `lib/psaDataSupport.ts`, `components/PsaDataSupportWorkspace.tsx` |
| PSA-11-02 | PSA dataset click opens modal, no inline dataset detail | Implemented; browser QA pending | `components/PsaDataSupportWorkspace.tsx`, `.module.css` |
| EMP-11-01 | Fictional DOB, age and personal/emergency/demographic sample fields across 35 original demo employees | Implemented; browser QA pending | `lib/demoEmployeeProfiles.ts`, `lib/hrState.tsx`, `lib/employeeDemographics.ts`, `components/EmployeeWorkspace.tsx` |
| UI-11-01 | Dashboard record-row details now open a modal; remaining legacy no-inline surfaces | Dashboard implemented; **system-wide audit pending** | `components/DashboardRecordsDialog.tsx` and `.module.css`; other legacy modules untouched |

See [Batch 11](batches/BATCH-11-PSA-ENTITY-DEMO-PROFILES.md). The HRMS is frontend/browser-local; no official PSA submission or certified data output.


## Batch 12 — Responsive table action visibility (focused)

- [x] Supported legacy scrollable tables with final-cell actions keep that column visible on tablet/phone screens.
- [x] Asset record popup exposes status/permission-appropriate actions without requiring the user to locate a hidden last column.
- [ ] Continue module-by-module responsive audit: non-final action cells, special table wrappers, mobile button labelling, and interactive device/browser testing. See [Batch 12](batches/BATCH-12-RESPONSIVE-TABLE-ACTIONS.md).


## Batch 13–14 — Lifecycle documents and PDF overlay (partial scope)

| Revision ID | Status | Scope / remaining work |
|---|---|---|
| LIFE-13-01 | Implemented in source, browser QA pending | 30-item draft onboarding/offboarding catalog and legal applicability labels |
| LIFE-13-02 | Implemented in source, browser QA pending | Dedicated Employee 201-linked checklist with manual statuses, references and audit history |
| LIFE-13-03 | Implemented in source, browser QA pending | Authorized creation of blank draft document templates, no assumed legal sufficiency |
| LIFE-13-04 | **Pending** | Legally reviewed production form content, service-of-notice/approval workflow, statutory due dates, full final-pay and compliance integration |
| PDF-14-01 | Implemented in source, browser QA pending | Existing PDF uploader/editor enhanced with simple token overlays, preview values and entity safeguards |
| PDF-14-02 | **Pending** | Secure backend, formal file retention, precise multi-device rendering, signed document lifecycle, full Employee 201 document indexing |

See [Batch 13](batches/BATCH-13-LIFECYCLE-DOCUMENT-RECORDS.md) and [Batch 14](batches/BATCH-14-PDF-OVERLAY-AUTOFILL.md). The 52-revision list is **not** fully complete.

## Batch 15 — Source forms in uploaded archive (2026-10-23)

| ID | Module | Work | Status |
|---|---|---|---|
| DOC15-01 | Document Studio | 13 normalized source-form categories, original source names, due-process/privacy/legal caveats | Implemented metadata-only catalog; original forms **not** bundled |
| DOC15-02 | Document Studio | Dedicated responsive Source Forms page; click opens modal rather than inline | Implemented in source; browser QA pending |
| DOC15-03 | Document Studio | Permission-restricted validated PDF draft import; preserve source bytes in existing IndexedDB PDF storage; open dedicated overlay editor | Implemented in source; browser QA pending |
| DOC15-04 | Onboarding/Offboarding | Cross-reference uploaded form inventory from related lifecycle checklist requirements | Implemented in source; browser QA pending |
| DOC15-05 | All forms | Exclude logo/image files, employee-specific filled forms, unrelated PDFs, and PSA questionnaires | Implemented as archive metadata filter; no source PDFs shipped |
| DOC15-06 | Legal/privacy | Legal and sensitive-source review before production; no actual legal approval or signed sample reuse | Outstanding manual/company legal review |

See [Batch 15 source form inventory](batches/BATCH-15-SOURCE-FORMS-REVIEW-IMPORT.md). This is not a full system-wide legal-form approval, live secure backend, or device/browser verification.

## Batch 16 — Tools Form Builder (2026-10-23)

| Revision | Status | Scope / limitations |
|---|---|---|
| FORM-16-01 | Implemented (frontend) | Tools → Form Builder editor for custom and existing intake supplementary questions; role-aware UI access (not production authorization) |
| FORM-16-02 | Implemented (frontend) | Public job application + incident title, description and additional questions; original validations/routing not replaced |
| FORM-16-03 | Implemented (frontend) | Existing HR Requests optional/required custom questions; answer snapshots and existing review records retained |
| FORM-16-04 | Implemented (browser demo) | New employee intake templates, same-browser `/intake/[id]` preview links, local submissions, CSV and status review |
| FORM-16-05 | **Pending** | Secure backend, cross-device publishing, real email/HR delivery, server permissions, evidence uploads, response retention and production QA |

See [Batch 16](batches/BATCH-16-FORM-BUILDER-INTAKE.md) and [Form Builder guide](../modules/form-builder/README.md).

## Batch 17 — Form link sharing and QR preview (2026-10-23)

| Revision | Status | Scope / limitations |
|---|---|---|
| FORM-17-01 | Implemented, source tests passed | Published custom intake: share modal, portable URL, Copy Link, browser Share API, open preview, QR PNG download |
| FORM-17-02 | Implemented, source tests passed | URL carries compressed versioned *questions only*; respondent can preview form on another device without the author's browser data |
| FORM-17-03 | Implemented | The remote preview validates answers but does not store/transmit them to HR; local test collection retained separately |
| FORM-17-04 | **Pending** | True Google Forms-style cross-device live publishing, secure response collection, form revocation, spam protection, access controls, notification/routing, production device QA |

See [Batch 17](batches/BATCH-17-FORM-SHARE-QR-PREVIEW.md). No backend integration added.

## Batch 18 — Tools UI and Drive operations (2026-10-23)

| Revision | Status | Notes |
|---|---|---|
| TOOLS-18-01 | Implemented in patch, browser QA pending | Compact Tools frame; embedded Drive/Spreadsheet launcher/Document Studio, no duplicate embedded navigation |
| TOOLS-18-02 | Implemented in browser demo | Super Admin Drive create folder, upload, rename, move, trash, restore, using existing IndexedDB/local metadata; HR roles read-only |
| TOOLS-18-03 | Implemented in patch, device QA pending | Drive management dialog; form row modal actions visible on compact screens |
| TOOLS-18-04 | Existing behavior preserved | Document Studio template approvals, PDF editor, Spreadsheet workbook approvals/import-export, Form Builder preview QR |
| TOOLS-18-05 | Outstanding — needs secure backend | Live multi-device form responses, stable revocable form links, real cloud file store, server-enforced permissions, submission/routing/notifications |
| TOOLS-18-06 | Outstanding | Full Playwright/manual browser/tablet/mobile QA and production Next.js build |

See [Batch 18 implementation](batches/BATCH-18-TOOLS-UI-AND-DRIVE.md).

## Batch 19 — Next Tools Functionality (2026-10-23)

| ID | Scope | Batch | Status | Affected paths |
|---|---|---|---|---|
| FORM-19A | Section/group labels and step-by-step custom form preview | 19 | source implemented, browser QA pending | `lib/intakeForms.ts`, `components/intake/IntakeQuestions.tsx`, `components/intake/FormBuilderWorkspace.tsx`, `app/intake/[id]/page.tsx`, `app/intake-forms.css` |
| FORM-19B | Conditional questions referencing earlier choice answers; required validation only for visible questions | 19 | source implemented, browser QA pending | `lib/intakeForms.ts`, `components/intake/FormBuilderWorkspace.tsx`, `components/intake/IntakeQuestions.tsx` |
| FORM-19C | Exclude hidden extension answers from newly saved local HR request/job application records and custom test responses | 19 | source implemented, browser QA pending | `lib/intakeForms.ts`, `components/PublicJobApplication.tsx`, `components/HRFormsRequestsWorkspace.tsx`, `app/intake/[id]/page.tsx` |
| FORM-19D | Backward-compatible portable form preview/QR schema with sections + conditional rules | 19 | source implemented, browser QA pending | `lib/shareIntake.ts`, `scripts/check-tools-patch19.cjs` |
| FORM-19E | True public submissions and centralized encrypted response storage | future backend | not implemented | Requires server-side records, identity/privacy/routing safeguards, and real deployment QA |

## Batch 20 — Form Builder local response register (2026-10-23)

| ID | Scope | Status |
|---|---|---|
| FORM-20A | Search/filter/paginate local test responses by status and recorded answer; show New/Reviewed totals | Source implemented, browser QA pending |
| FORM-20B | Clicking a response opens full answer detail within dedicated modal view, not inline; review-status action preserved | Source implemented, browser QA pending |
| FORM-20C | Export only filtered local responses with preserved field/version identity and formula-safe CSV values | Source implemented, browser QA pending |
| FORM-20D | UI restrictions on accessing demo responses remain HR role scoped | Source implemented, production backend security pending |
| FORM-20E | Cross-device submissions, centralized secure response inbox, attachment storage, and live routing | Not implemented; requires backend |

See [Batch 20](batches/BATCH-20-LOCAL-RESPONSE-REVIEW.md).

## Patch 22 — Unified Tools File Views (2026-10-25)

| ID | Status | Scope |
|---|---|---|
| TOOLS-22-01 | Implemented in patch; browser QA pending | Spreadsheet launcher uses file rows instead of large catalog cards; listed system workbooks and saved custom worksheets, with role-aware New Sheet and XLSX upload actions |
| TOOLS-22-02 | Implemented in patch; browser QA pending | Document Studio source/generated PDFs and documents use file-list rows, with compact New Document / Upload DOCX / Upload PDF toolbar and create modal |
| TOOLS-22-03 | Implemented in patch; browser QA pending | Form Builder and Source Forms use file-style rows, with record actions in pop-ups, not inline expansion |
| TOOLS-22-04 | Implemented in patch; browser QA pending | Drive defaults to List, retains optional Grid and folder/file functions; New menu visible with explanatory permission messaging |
| TOOLS-22-05 | Out of scope | Secure persistent shared storage, live cross-device form submissions, HR edit permissions beyond existing prototype roles |
