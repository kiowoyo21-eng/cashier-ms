# UCMM HR · Batch 1 Payroll & Employee Preview Patch · 2026-10-13

## Installation

**Updated files only.** Apply after the Combined Mock Data patch **and** the Recruitment Stacked Cards / Interview Calendar patch. Extract and upload the CONTENTS into the existing GitHub repository at the same folder paths. Do not create a nested folder or delete untouched source files. Vercel can then build the repository.

## Changed

1. **Payroll · Attendance Records** is a separate overview card. The existing September/October demo log viewer is no longer buried in Generate Payslips. September 1–30 (1,050 rows), October 1–31 (1,085 rows) for 35 demo employees. Standard demo punches use 08:00–17:00, with **assumed one-hour unpaid lunch**. Late, rest day, absence, future simulation and incomplete punch examples remain; future placeholder days intentionally have no punches.
2. **Government contribution preview** shows SSS/PhilHealth/Pag-IBIG monthly reference split across the first FOUR Wednesday-ending weekly cutoffs in each calendar month. A fifth Wednesday cutoff carries no additional monthly mandatory installment. Final scheduled installment adjusts rounding. BIR withholding remains a **weekly taxable pay estimate**, not monthly ÷4. This is an allocation/QA rule, NOT proof of legal contribution calculation or remittance.
3. **Loans / Cash Advances** now uses a selectable Employee 201 ID, adjustable installment amount/frequency/start date, required HR review reference, and an explicit demo approval state. Legacy name-only records must be re-linked to an ID; they NEVER automatically deduct solely by name.
4. **Draft / sample release** proposes approved, due loan repayments; the installment is capped at the outstanding balance. On sample release ONLY, it records repayment against the same loan (release-ID-linked history), reduces balance, and marks the loan Fully Paid at zero. Duplicates are blocked for the employee/cutoff, and changed loan balances require draft recreation. This is **browser-local simulation**, not an authoritative accounting ledger, valid employee consent, or actual salary payment.
5. **Payslip History** View opens a centered modal with prominent **Net Pay**, itemized available salary, overtime, holiday, allowances, SSS, PhilHealth, Pag-IBIG, BIR, loans and other deductions (for newly generated drafts). Legacy seeded payslips lack stored detail, so the UI labels their detail incomplete rather than inventing it. Print/Save uses the existing browser print flow.
6. **Employee 201** allows HR demo edit of salary type and base rate inside Salary & Benefits, with a required reason, effective date TODAY, rate-change history, and unchanged prior released payslip snapshots. Future-dated pay rate workflows remain in Payroll Management. BM role remains read-only.
7. **Leave classification**: approved **VIL and Unpaid Leave are unpaid**, do not consume SIL. Approved SIL credit check remains. When copying sample attendance to an individual daily-rated payroll draft, approved SIL/company-paid leave days saved in the browser leave ledger may be included in compensable day count, but VIL is excluded. No approved request is auto-debited against a live payment.
8. **Monthly equivalent**: daily rate ×26 remains a contribution reference and does NOT guarantee pay for 26 days regardless of attendance.

## How to test

- Payroll > Attendance Records: switch September / October, select employee, check 08:00 to 17:00 or late + OT sample punches; export filtered CSV.
- Payroll > Government Deductions: choose period ending Oct 7/14/21/28, 2026. On a sample PHP 20,000 basis, SSS reference PHP 1,000/month ⇒ PHP 250/week; PhilHealth PHP 500/month ⇒ PHP 125/week; Pag-IBIG PHP 200/month ⇒ PHP 50/week; tax is separate. Values rely on bundled **reference** schedules, not legally validated live rules.
- Payroll > Loans & Cash Advances: add, select employee by Employee ID, set PHP 500/cutoff and an authorization memo, save, then open and approve the demo repayment plan. In Generate Payslips select same employee/cutoff. Verify attendance metadata and approve/release a sample draft. Check outstanding loan balance and Payslip History modal.
- Employee 201 > View employee > Salary & Benefits > Edit Basic Pay Rate. Save a same-day demo rate and verify current rate display and subsequent draft.
- Leave Management: approve one VIL and one SIL request with remarks. Check classification and copy matching demo attendance into the draft; VIL is unpaid.

## Known limitations / do not use for actual payroll

- No secure backend, biometric attendance import, authenticated payroll approval, statutory remittance, or employee identity verification. The browser's local storage is not secure HR/accounting storage.
- Contribution references, SSS MSC bracket, PhilHealth, Pag-IBIG, BIR taxability/period brackets, premium rates, weekly monthly-paid divisor (12/52), paid closures/holiday stacking, and overtime must be independently checked and approved by HR/Finance before production. Philippine labor-law requirements and company policies take precedence over demo calculations.
- Company paid-closure/day overlaps, proper withholding remittance, government receipts, legal loan consent, detailed paid-leave credits, and authenticated signatures remain future integration work.
- We performed TS/TSX source parsing, CSS parsing, and isolated numeric/data QA. **A full Next.js build and real Vercel/browser regression test were NOT completed** because React/Next dependencies were unavailable in this environment.
