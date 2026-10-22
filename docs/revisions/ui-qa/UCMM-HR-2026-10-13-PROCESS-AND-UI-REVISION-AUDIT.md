# UCMM HR — Process / UI Revision Audit (October 13, 2026)

## Delivery and use

This ZIP is a **delta patch** from `UCMM_HR_2026-10-13_All_Reviewed_UI_Workflows_PATCH.zip`, plus the missing incident records file restored from the earlier official Incident Reports patch. Apply the contents directly at the **GitHub repository root**, preserving folder paths. Do not upload this patch as a nested folder. No full Next.js build, runtime browser testing, production deploy, or database migration was done.

**Safety:** Existing project runs with browser-local fictional/demo records. Roles/approvals are UI controls, not server-authorized access. NEVER use live employee/applicant confidential documents or actual government payroll calculations until the backend is secure and schedules are validated against currently applicable agency issuances.

## Implemented or clarified in this patch

| Review ID | Module / task | Outcome |
|---|---|---|
| 1, 18 | Gov. deductions approved but ₱0.00 | Root cause: monthly SSS/PhilHealth/Pag-IBIG are deducted only in the cutoff ending the **first Wednesday** of each month; a later cutoff legitimately shows ₱0.00. Shows **monthly reference** side-by-side with **selected weekly cutoff due**; BIR remains a weekly calculation. No new statutory formula introduced. |
| 2 | Incident duplicate notification bell | Removed the extra bell below Existing Reports/IR History; module header bell remains. |
| 3 | Duplicate Resume / Resume-CV | Added canonical naming and merge logic, including legacy duplicates, retaining best verified status and filename (if recorded). Onboarding displays one Resume / CV. |
| 4 | Submitted without attachment | New manual Submitted/Verified status requires a recorded filename; legacy status-only documents are flagged and blocked from hiring confirmation. Filename-only is still NOT actual secure file verification. |
| 5 | Confirm Hired → Employee 201 | Now creates an idempotent browser-local Employee 201 record `HIRE-APP-...`, including job, branch, hire date and onboarding document metadata. **Salary is intentionally 0 / pending HR setup;** individual/batch payslip generation blocks zero/unconfigured rates. Backend sync remains pending. |
| 7 | Missing Incident Records library | Restored `lib/incidentRecords.ts` dependency, including sample cases and case document helpers. |
| 8, 9 | Hiring assessment | Position-sensitive 1–5 evaluation scorecard, screening checklist, per-interview evaluator/ratings/date, remarks and review in interview history. Final decision still needs an explicit selection by HR. |
| 10–14 | Applicant document portal | HR can generate/revoke one 1-hour **same-browser DEMO** access link per candidate (all checklist items). Portal shows pending, submitted, verified, rejected and not-required items. Successful file **name only** selection auto-saves to browser local storage. Expired links cannot edit; regenerated access retains checklist. **Phone-to-HR transfer and actual file storage are NOT implemented**; real secure link/QR requires backend. |
| 15 | Pre-hire guards | Confirm Hired requires accepted offer, hire date, documented/verified mandatory requirements, and HR-recorded acknowledgment. Exception override requires separate secure approval (not implemented). |
| 16 | Holiday rate labels | Shows worked day and worked on rest day references when adding a holiday (Regular 200%/260%; Special non-working 130%/150%; Special working 100%/130%) and in the calendar list. These are day-rate references, subject to work/attendance/eligibility validation; no automatic payroll premium application is claimed. |
| 20 | Draft payroll safety | Individual/batch drafts reject employees with unconfigured zero basic rate; manual deductions require written approval reference in notes. Real independent reviewer authority still needs backend. |
| 21–24 | Card widths/responsiveness | Government Compliance square icons now target 165–180px medium widths on desktop with stable spacing and readable labels. Small groups in Recruitment, Incident Reports, Documents, Leave and Operations use content-aware width caps rather than filling the entire page. Media queries adjust for narrow screens. Browser QA still needed. |
| 25–27 | Preserved prior UI | Existing compact Employee 201 filters, 3-card Documents & Templates and in-workflow demo signing options are retained. No standalone signing module added. |

## Still pending and NOT claimed working

- **Real cross-device applicant uploads:** authenticated applicant-specific and token-bound API; 1h server-side expiry/revocation; encrypted private file storage; scanning and validation; durable auto-save of actual PDF/photo bytes; rate limiting; email/SMS delivery; real QR encoding; HR document verification; download controls and retention policies. The demo is same-browser and should NOT be sent to applicants.
- **Production government payroll:** officially verified contribution/tax tables including classification/exemptions; approval by authorized distinct reviewer; effective-dated historical recomputations; reconciliation and remittance. The existing reference schedules are illustrative only.
- **Loan amortization integration:** SOP for SSS/Pag-IBIG loans vs company loans, verified SOA, legally appropriate repayment schedule, exact installment allocation, approval, exception handling, ledger synchronization and double-deduction controls. SOA image/PDF preview placeholders already exist in prior patch; there is no automatic loan deduction link.
- **Holiday pay automation:** attendance-row interpretation, rest-day and workday flags, work/no-work qualification, overtime, premium interactions, approved overrides, eligibility and proof; no automatic holiday premium from the calendar is connected to payslip drafting yet.
- **True e-signing:** authenticated signer-specific secure on-device/link/QR document, signature evidence, hash and tamper-resistant timeline, completed PDF and Employee 201 placement. Current UI is a demo preview only.
- **Authorization and audit trail:** server-side HR/BM/Super Admin permissions for confidential employee files, special HR takeover, approver separation, incident documents, immutable audit logs, applicant and leave data; local role flags do not enforce confidentiality.
- **Full end-to-end validation:** no database, Vercel staging test, responsive device screenshots, or full compilation was performed in preparing this patch.

## Exact UI walkthrough after uploading

1. **Incident Reports → home:** see two cards + Create IR and Public Report Form, but no lower duplicated bell. Check header notifications for HR/BM routing.
2. **Payroll → Government Deductions:** approve one *sample* SSS/PhilHealth/Pag-IBIG schedule for demo in agency popup. Choose cutoff starting **Oct 1, 2026** (ends Wednesday Oct 7) vs **Oct 8** (ends Oct 14). Both should show monthly reference; only first cutoff carries monthly contribution, later one shows zero to avoid double deduction. Inspect one employee and list totals separately. Verify BIR remains weekly.
3. **Payroll → Holiday Calendar:** switch Regular/Special Non-Working/Special Working and verify worked/rest-day percentages. Add sample holiday and check month calendar and listing. No auto attendance/payroll premium promised.
4. **Recruitment → Hiring Cycle → interview:** choose a candidate with scheduled pending interview, complete five ratings and screening checklist, enter remarks, save evaluation, reopen to see its recorded scorecard. Final decision requires latest interview Passed.
5. **Recruitment → Onboarding:** Resume and Resume / CV collapse into one visible record; legacy status without filename flagged. Choose a fictional Passed applicant, generate demo upload access. Open **Preview Applicant Portal** in a new tab *in the same browser*, select a test file; return to HR tab and check status. Generate a replacement link; previous token invalid. Wait 1h (or change demo expiry through test data) to verify denial. Do NOT use an actual applicant's data.
6. **Onboarding → Confirm Hired:** verify accepted offer, mandatory files and signing status (all demo), select date, confirm. Employee 201 should list the new id and doc metadata. Payroll drafts should block the new employee until HR sets pay rate.
7. **Government Compliance:** five medium square cards per row where space permits, ~165–180px each. Check tablet/mobile sizes, and browser zoom.
8. **Documents & Templates / Leave / Incident / Recruitment:** 1–2 clickable cards should not stretch full width. Verify no overflow at mobile widths; use browser device testing.

## Suggested next backend phase

Server-side auth/authorization → secure applicant document storage and upload links → durable recruitment-to-employee conversion with transaction/audit history → verified payroll and loan rules → incident confidential access control → signed document integration → automated integration tests. This order is important to avoid mistaking local demo records for production-ready HR operations.
