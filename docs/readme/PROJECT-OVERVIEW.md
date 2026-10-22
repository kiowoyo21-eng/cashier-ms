> **Latest review update (2026-10-13):** global compact headers, uniform cards, premium Employee 201 filters, local demo login persistence, daily rate × 26 monthly reference, and expanded original Incident Report with guided stages. See [`docs/revisions/ui-qa/UCMM-HR-2026-10-13-GLOBAL-UI-AND-SESSION-UPDATE.md`](../revisions/ui-qa/UCMM-HR-2026-10-13-GLOBAL-UI-AND-SESSION-UPDATE.md). This remains a browser-local demo, not production-secure HR/payroll software.

## Latest — Employee 201 Compact Profile, Controlled Actions & A4/Letter Preview (2026-10-12)

- Compact two-column Employee/Employment Details; Salary & Benefits stays full width; Reviews, History and Clearance remain on one scroll.
- Hire Date is entered during initial onboarding registration, then locked in Employee 201 View/Edit. It is preserved when saving other profile fields.
- Dedicated **Employee Actions** after Clearance & Assets: Assessment, Regularization, Promotion, Transfer, Pay Rate, Assign Device, Offboarding with separation reason/type.
- Documents have an A4/Letter paper-proportioned canvas with 35% pane, navigation and enlarged view (preview frame only; source PDF isn't reformatted).
- Frontend review only; no secure file storage, signed approvals, live employee records or production payments.

See `docs/revisions/employee-201/EMPLOYEE201-DECISIONS-COMPACT-AND-DOCUMENT-PAPER-2026-10-12.md` for changes, QA guide and limitations.

---

## Latest update: Assets & Devices — Accountability / Turnover (frontend-only)

- **Assign Device** uses three steps: Assignment Details, Accountability Form, Turnover Confirmation.
- Step 2 displays auto-filled employee/device details, an inline document preview and a separate A4 print/PDF document.
- Select Phone/QR (future integration), Sign on This Device (temporary drawing pad), or Print for Physical Signature.
- Step 3 supports a signed physical form file selection and officer/physical handover confirmation. A local preview can mark a device Assigned if those frontend checks pass, but **signature identity is not verified and file contents are not saved**.
- Phone/QR cannot complete a handover without backend; use Pending Turnover to reserve the device. Pending items are not available for reassignment.
- Explicit UI warning and project documentation: no confidential or real employee data should be entered in this prototype.
- Existing Employee 201, Payroll, Documents, /report, /apply, and other screens retained.

# Employee 201 Directory & Profile Update

Expanded Employee 201 display and added **10 / 20 / 50** rows per page. See `docs/revisions/employee-201/EMPLOYEE-201-DISPLAY-AND-PAGINATION-PATCH.md` for complete details and remaining limitations. The full project, including public reporting and hiring forms, is retained.

# Underchargers HR PWA — Public Forms Frontend Patch

## Latest changes

**Public incident report (`/report`)**
- Removed local text-draft download.
- **Submit Report** validates required fields and displays an explicit *NOT SENT* browser alert. No report, case or notification is created.
- Intended routing remains: reports about a Branch Manager → HR only; reports about other employees → BM with HR copied; unclear role → HR screening.

**Public hiring application (`/apply`)**
- New login-free single-page job application form with Full Name, Email, Contact Number, Position, Preferred Branch, optional Experience/Introduction and a **required Resume/CV selector**.
- CV selection accepts PDF/DOC/DOCX files of at most 10 MB. The file remains in browser memory: it is **not uploaded, saved, emailed, or received**.
- **Submit Application** validates the form and shows an explicit *NOT SENT* browser alert.
- Links are available from the HR login page and the Recruitment & Hiring workspace. Both paths work directly with a shared deployment domain.

See `docs/revisions/request-and-reports/PUBLIC-FORMS-REVISION-CHECKLIST.md` for a detailed completed/pending checklist.

# Underchargers HR — Frontend Workflow Review

Next.js / React / TypeScript frontend review project (post-Phase 16 consolidated workflow simplification release).

## What's different

One local master employee record is used by Employee 201, Payroll Rate Management, Payroll earnings/deduction reference inputs, Asset Accountability, Employee Document Submission, Dashboard and quick Reports. The data is persisted in browser localStorage for testing and can be reset under Account Settings.

For feature-by-feature completed/pending status, see **`docs/workflows/WORKFLOW-RELIABILITY-REVIEW.md`**.

## Deploy

Upload the ZIP contents directly into the existing GitHub repository root and commit. Vercel will build the Next.js application from `package.json`. Delete retired components if they still exist in GitHub (see `docs/GITHUB-LEGACY-CLEANUP.md`).

## Important safety and validation

**This is not a real HR database or legally verified payroll system.** Fictional credentials and records are accessible in browser source. Role restrictions are only for review, and localStorage is not suitable for actual employee records. No secure signing links, official contribution tables or real payments are connected. A production-ready system will need Supabase/Auth/RLS, confidential storage, legal rate validation, approval workflows, audit controls and testing.

Full production build could not be run locally because dependencies could not be downloaded from the npm registry in this environment. Do not enter real personal data, upload confidential documents, or process real payroll on this site.


## Employee 201 Salary Display Adjustment (Oct 2026)

- The Employee Directory **Basic Salary** cell stacks the pay basis (**Daily** or **Monthly**) above the corresponding rate (for example, **₱700/day** or **₱25,000/month**).
- The Employee Profile **Overview** uses the same stacked format.
- Rates are read from the shared `data.people` employee state used by the Payroll workspace, rather than a hardcoded display value.
- Existing 10/20/50 pagination, confidentiality restrictions, and all public forms are preserved.
- Frontend-only review data; no production payroll system or Supabase integration.

## Final Employee 201 Salary Column Presentation

Employee Directory header: **Salary Type / Salary**. Every cell follows the same stacked hierarchy as Employee / ID: **Daily** or **Monthly** on top in bold, and **₱700/day** or **₱25,000/month** beneath it in muted secondary text. The Employee 201 Overview uses the same two-line presentation. The amount remains linked to the shared employee record, and pagination remains 10 / 20 / 50.


## Employee 201 directory filters restored / expanded

The directory keeps the Salary / Type compact two-line display (amount first, pay basis second) and 10/20/50 pagination, defaulting to 10. Search, Branch, Employment Status, Department, and Sort remain visible. The advanced panel has Gender, Position, Salary Type, Basic Rate min/max (within a selected Daily or Monthly basis), Hire Date range, and Document Status. One-click presets include Probationary, Missing Documents, Pending Verification, and New Hires (past 90 days). Selected filters show as removable chips, with result counts, clear-all and empty-state guidance.

The filter data is read from the shared frontend HR record store. It is not yet backed by secure storage or authorization. No real employee data should be entered.


## UI terminology update
See `docs/UI-LABEL-TERMINOLOGY-AUDIT.md` for module and Employee 201 label updates. This update preserves the underlying record schema, filtering, payroll state and role permissions.

## 2026-10-12 · Module-focused UI/UX revision

See `docs/revisions/general/REVISION-2026-10-12.md` for an itemized implementation and limitations review.

The standalone HR Tasks module and duplicate Dashboard task listing have been removed. Module headers are compact with contextual info and a module-specific alert bell; notifications point to the originating record where implemented. Compliance is now organized into standalone **agency workspaces within the module** (not merely an agency list filter), with progress tracking, due-date urgency, all-branch/selected-branch applicability and per-branch review status. Leave and Incident records expose more detail; device inventory exposes registered branch and accountable employee. Recruitment can record interview dates and outcomes.

**Deployment warning:** This remains a frontend review build. Sample accounts are not authenticated, role visibility is not secure authorization, browser storage is not appropriate for personal employee files, document uploads/signatures are not backend-verified, and government deadlines require independent official confirmation before relying on them. Use fictional data only. Build requires npm packages (`npm install`), which were unavailable in the packaging environment.

## October 12 — Asset branch TypeScript build fix

Fixed Vercel TypeScript error in `components/AssetWorkspace.tsx` Add Device branch selection. Also fixed a stale memo dependency for the inventory branch filter. See `docs/revisions/ui-qa/VERCEL-ASSET-BRANCH-TYPE-FIX.md`.

## Employee 201 / Payroll / Recruitment revisions (2026-10-12)

This release retains the previous Vercel Asset type fix and system-wide module UI/UX changes. Employee 201 now has **View/Edit**, **one-scroll Employee Profile** and separate **folder-based Documents**, including sample Payslips and a compact PDF/image preview. A shared fictional released payroll ledger powers the **Total Salary Received** figure. Payroll uses tab-based **Employee Pay Rates**, **Government Deductions**, **Payroll Processing**, **13th-Month Pay**, **Funding & Release**, and **Remittances**. Hiring has a direct **Shortlist** action and controlled stage progression.

See [existing release notes and related requirements](../revisions/general/REVISION-2026-10-12.md).

**Important:** Sample payroll releases, salaries, manual deductions and payslip previews are fictional browser-only data. The application does not store real files, issue official payslips, perform real government deductions or make payments. Secure backend still required for production.


## Latest complete integrated release (October 12, 2026)
See `docs/changelogs/general/FULL-INTEGRATED-RELEASE-2026-10-12.md` for current included modules, deployment steps, and outstanding limitations.
