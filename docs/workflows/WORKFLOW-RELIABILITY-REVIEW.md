# Underchargers HR — Workflow Simplification & Reliability Review

Release: Consolidated Frontend Workflow Patch (after Phase 16)

## Scope and security

Frontend-only review software. All people, amounts, credentials and audit items are fictional. Local browser storage is NOT secure personnel storage, authentication, approval or legal payroll processing. Do not enter actual employee personal information, medical records, payroll information, or confidential incident evidence. All role restrictions are demonstration UI restrictions only, not backend authorization.

## Completed in source (reviewable interaction, not production processing)

- [x] Preserved main HR modules and removed retired review-center navigation from the active sidebar.
- [x] Central browser-persisted record store for employees, per-person rate profiles, payroll earnings inputs, individual deductions, assets and BM document submissions.
- [x] Reset sample records control under Account Settings.
- [x] Employee 201 opens to directory with search, department/status/branch filtering and pagination. A separate profile screen shows 201 sections, and actions open only when explicitly selected.
- [x] Add Employee requires branch, name, position and basic salary, and new records appear in payroll, assets selectors, dashboard and quick reports.
- [x] Employment change review for evaluation, regularization, promotion, transfer and offboarding with decision notes and history; offboarding shows outstanding assigned assets.
- [x] BM remains excluded from the Employee 201 module; Employee Document Submission only lists employees in the BM's permitted branch.
- [x] BM document submission metadata is tracked by employee ID; HR approval/rejection updates the matching employee's 201 document checklist.
- [x] Payroll Rate Management uses the employee master list, searchable/paginated directory and per-person editing. Saved changes are visible after switching views and refreshing in the same browser.
- [x] Payroll earnings inputs (days, overtime hours, bonus/adjustment reference) read each employee's rate profile; individual deduction inputs no longer subtract the same deduction from every employee.
- [x] Dedicated Payroll navigation for weekly preview, employee rates, statutory table review, 13th month, funding and remittance tracking.
- [x] Statutory CSV bracket review has range search, paginated rows, manual proposal editing and overlapping-bracket import rejection; imported schedules are NOT activated as official rates.
- [x] Assets use one accountable employee ID; available devices show Assign, assigned devices show View/Retrieve, returned devices go to Inspection, and inventory history is retained in the browser.
- [x] HR/Super Admin can register devices; duplicate serial numbers are checked.
- [x] Device assignment/retrieval has form-specific A4 print-ready accountability/return documents, not a webpage print.
- [x] Incident Report case-stage dropdown replaced with Next Stage action plus required written notes; HR stages restricted from BM's case editor, BM-related cases hidden from BM preview.
- [x] IR form and case print buttons open formatted documents instead of the screen layout.
- [x] Dashboard report counts read the shared employee directory; expired and near-term tasks are prioritized over ordinary tasks.
- [x] Detailed report filters use the shared employee directory instead of independent invented employee names; CSV and document-only print summary available.
- [x] Existing detailed information guides retained.

## Partial / not completed (do not represent as finished)

- [ ] Secure, real signing links, QR signing, identity verification and signed PDFs; only request preparation and document preview are available.
- [ ] Official verified preloaded SSS/PhilHealth/Pag-IBIG/BIR schedules, legally accurate withholding logic, employee/employer contributions and government-specific export formats.
- [ ] Full monthly salary weekly allocation policy, attendance importer validation, holiday/rest-day/night-differential combinations and production-ready payroll calculation.
- [ ] Actual payroll approval, disbursement, remittance proof validation, 13th-month earned-salary ledger and signed payslip archive.
- [ ] Cross-module persistent leave and loan amortization logic: the existing leave/loan pages remain standalone frontend prototypes.
- [ ] Full recruitment-to-employee-201 conversion and approval; earlier recruitment screen still uses independent records.
- [ ] Full government evidence vault, agency filing flow, real reminders and compliance validation.
- [ ] Actual server-side branch access control, authenticated HR approvals, immutable audit trail, sensitive file storage and real notifications.
- [ ] Verified production Next.js build; npm registry could not be accessed from this environment. Vercel deploy must be checked after GitHub upload.
- [ ] Formal end-to-end browser tests; source syntax/imports and package structure were checked, not every click in a browser.

## Test this release

1. Sign in as HR (fictional credentials displayed on login); add an employee and assign a branch.
2. Open Payroll → Employee Rates and find the employee; edit their OT multiplier and save.
3. In Weekly Payroll → Deductions select that employee, change overtime hours and an individual deduction; verify other employees retain different deductions.
4. Open Assets, assign an available device to that employee, and open its accountability document. Retrieve, inspect, and return it to Available.
5. Sign in as BM; verify Employee 201 is absent, and submit a document for an employee in the BM's branch.
6. Sign in as HR; open Documents → Employee Submissions; approve the submission, then find the employee's changed 201 document status.
7. Open Incident Reports; attempt to move a case to the next stage without notes. Supply notes, proceed, and print a document-only case review.
8. Check Dashboard and Reports after adding an employee, and refresh the browser to confirm local review data persists.
9. Use Account Settings → Reset Sample Records to return to a clean state.

## GitHub / Vercel

Extract ZIP, upload files into the existing repository root, replacing matching paths. GitHub web upload does not delete obsolete files; follow `docs/GITHUB-LEGACY-CLEANUP.md` to remove legacy components if necessary. Verify the Vercel build; do not publish real data to this review system.
