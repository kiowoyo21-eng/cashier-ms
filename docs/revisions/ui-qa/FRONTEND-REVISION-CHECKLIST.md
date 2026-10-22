# Underchargers HR PWA — Consolidated Frontend Revision Checklist

**Release:** Phase 16 Review Patch | **Mode:** FRONTEND ONLY | **Date:** October 11, 2026

## Completed in the source code of this patch

### Dashboard and navigation
- [x] Expanded Quick Actions to direct destinations for HR and BM roles.
- [x] Reworked priority queue into Critical → High → Medium → Low groups, including counts and selection.
- [x] Added Dashboard HR Quick Reports for headcount, gender, regular/probationary numbers, separate daily/monthly basic rate totals and compliance links.
- [x] Role-filtered navigation for salary-sensitive modules.
- [x] Removed obsolete HR Workflow Center, Advanced HR Screens, Frontend QA Center and Final Review Hub *from the sidebar and their unused TSX components*, preserving main workflow modules.
- [x] Retained a single visible non-production indicator in the shell; reduced repeated "demo" labels in the main workflows.

### Employee 201 Files
- [x] Searchable Employee Directory; employment-status and department filters; configurable 5/10/20/50 page size.
- [x] Branch mandatory when adding employee. Direct regular hire and probationary starting options.
- [x] Profile tabs: Overview, Personal, Employment, Compensation, Documents, Evaluations, History, Clearance.
- [x] HR-only editing for selected fields, confidential blank government-number fields and requirements status checklist.
- [x] Contextual steps for Evaluate, Regularize, Promote, Transfer, Offboard and Edit; stage checks, effective date, reason and session history.
- [x] BM cannot see or navigate Employee 201 module.

### Documents and permissions
- [x] Dedicated BM Employee Document Submission module with branch-filtered employee lookup.
- [x] BM can record PDF/JPG/PNG file selection metadata and view submission status, but cannot inspect 201 profiles.
- [x] HR Document Submission review with Approve/Reject and reason; temporary same-browser session status.
- [x] HR Documents has separate subviews for library/templates, submissions and one-employee-one-document signing request preparation.
- [x] Individual signing request with employee, document, expiry, request tracking and revoke preview.
- [x] No fake operational signing link is issued.

### Payroll
- [x] Dedicated Payroll sections: Weekly Payroll, Employee Rates, Statutory Tables, 13th Month, Funding & Release, Remittances.
- [x] Searchable/paginated employee rate directory with branch-scoped records, department filters, individual rate overrides, effective dates and change notes.
- [x] Previews use employee > department > company priority for rate profile selection.
- [x] Employee-specific regular OT preview is linked into the existing Weekly Payroll computation screen for daily-paid employees.
- [x] Removed redundant global Rate Settings tab from Weekly Payroll navigation.
- [x] Agency table selector, bracket search, CSV import validation for proposed rows, manual proposed row entry and clear proposal.
- [x] 13th-month calculation review register (no fabricated annual earned-basic-salary amounts).
- [x] Funding net-to-be-paid and released-to-date inputs with remaining-payout preview.
- [x] Remittance status overview differentiating withholding and actual remittance.

### Assets and Devices
- [x] HR/Super Admin Add Device and duplicate-serial check.
- [x] Available/Free shown by default; inventory status filters and search.
- [x] Free: Assign; Assigned: View/Retrieve; Inspection: Inspect.
- [x] Assignment linked to one named employee, not a branch; an employee may hold multiple assets.
- [x] Step-guided Assign, Retrieve and Inspect flows with condition/accessory fields, review summary and confirm action.
- [x] Accountability/return form preview with employee-specific review acknowledgment.
- [x] Retrieved device goes to Inspection, never directly to Free; inspection resolves Free/Maintenance/Retired.
- [x] Per-asset assignment and return timeline in the frontend.
- [x] BM asset access disabled by default pending explicit role permissions.

### UX / Guidance
- [x] Reusable detail-rich ⓘ button component with Why, How, Example, Access, Next Steps and Cautions.
- [x] Guides added to key pages: Dashboard, Employee 201, Payroll, Brackets, Assets, Documents, Signing, Recruitment, Leave/Loans overview, IR, Compliance, Reports and Administration.
- [x] Guided Quick Reports with direct filters by status, department, search and optional Advanced Builder.
- [x] Multi-step processes do not use “Wizard” in visible titles.
- [x] Consistent white/yellow styling and responsive classes for new pages.
- [x] One root project ZIP rather than a patch-only file.

## Partial — additional implementation or verification required
- [ ] Fully verified *official effective-dated* Philippine government SSS, PhilHealth, Pag-IBIG and BIR schedules **preloaded**; no statutory figures invented. This is not complete yet.
- [ ] Uploaded statutory table approval, version comparison, rollback and legal formula enforcement (only local proposed rows exist).
- [ ] Complete payroll computation (rest-day, holiday combinations, monthly-paid allocation, night differential, contributions) and accuracy validation.
- [ ] Actual annual 13th-month earned-basic-salary history and statutory calculation.
- [ ] Individual recipient-verified signing URLs/QR, signatures, expiry and tamper-evident signed PDF production.
- [ ] Full employee-file attachments and secure HR verification workflow, rather than file-name-only session proposals.
- [ ] Shared database/persistent state and authenticated cross-account approvals, audit trail and job queues.
- [ ] Detailed multi-step procedures in **every** older workflow (Leave, Loans, Recruitment, IR, Compliance) beyond guided explanations or older per-module review forms.
- [ ] Device turn-over legally usable document template, identity verified signature, inspection photographic evidence.
- [ ] Full reports from authoritative payroll history and government agency-ready templates.
- [ ] Automated notifications / assignment role matrix editor and backend-enforced access control.
- [ ] End-to-end browser test and **Next.js production build**. Dependencies cannot be downloaded in this execution environment; Vercel build still needs verification.

## Review / deployment
1. Download full ZIP, extract its *contents* into GitHub repo root, replacing matching files.
2. Commit; inspect Vercel build logs. Do NOT infer a successful production build from source syntax checks alone.
3. Test login using the documented fictional accounts. Never input real employee, salary, tax, medical or disciplinary records here.
4. Check BM sidebar: there must be Employee Document Submission **without** Employee 201 Files or payroll.
5. Check HR sidebar: Employee 201, Payroll rate editor, Assets, Documents and Reports.
6. Test available-device assignment → assigned → retrieval → inspection → available, and check who is the accountable employee.
7. Compare the remaining checklist against actual company SOPs and voice transcriptions before backend development.
