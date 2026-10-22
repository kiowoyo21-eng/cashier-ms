# UCMM HR Payroll Patch — October 12, 2026

## Scope / repository location

Replace **only the files in this patch** at the matching paths in the existing GitHub repository. Do not replace the entire application. This update is applied on top of `UCMM_HR_Payroll_Management_Six_Card_Workspaces_PATCH.zip` and retains its six-card Payroll Control Center, signature request controls and Employee 201 release linkage.

## Updated functions

1. **Government Deductions** — automatic calculation of employee SSS, PhilHealth, Pag-IBIG and estimated weekly BIR withholding, with employer shares shown separately. HR can open an individual employee's contribution breakdown, configure the employee's monthly compensation basis, and indicate a reviewed minimum-wage-earner withholding exemption when applicable. Imported contribution schedule proposals remain drafts; reference versions are selected by their effective dates for an *estimate*, and versions are preserved.
2. **Monthly-versus-weekly control** — SSS, PhilHealth and Pag-IBIG employee contributions are withheld **once on the first payroll cutoff ending Wednesday in each calendar month**, not on every Saturday. BIR withholding is estimated weekly. This is an explicit company-side preview convention, **not a claim that this is a government-mandated withholding day**. Finance/HR must confirm employee monthly compensation, contribution coverage, tax classifications/exemptions, employer contributions, pay timing, and actual remittance rules before live use.
3. **Daily-paid employees** — uses a clearly labeled provisional monthly basis of daily basic rate × 26 unless HR inputs a proper monthly contribution basis. **This estimate must not be treated as a verified actual monthly salary.**
4. **Payslip drafts** — both individual and sample batch drafts use the same per-employee deduction calculator. The employer portion is shown but does **not** reduce employee net salary. Per-agency snapshot records are saved with the draft and appear on the draft review screen and the printed example payslip when linked to a release. Loans and authorized additional deductions remain separate.
5. **Holiday Calendar** — real 7-column monthly calendar with previous/next month navigation, clickable dates, and a **month-specific table below the calendar**. Existing holidays can be selected for edit or deleted after confirmation. Branch, department and individual premium override controls are preserved.
6. **Payslip History** — select Year, Month, and **cutoff week** (Thursday–Wednesday), then open that week's employee payslip table with gross, deductions, net, release date, and signature status. Payroll weeks are classified by the month of the Wednesday cutoff end (even when Thursday lies in the previous month).
7. **Calendar-only payroll dates** — reusable `CalendarDatePicker` component replaces free-typing date inputs inside Payroll (effective rates, premium schedule, contribution reference dates, holidays and cutoff dates). Weekly cutoff selector enables only Thursdays and automatically displays the following Wednesday.
8. **Attendance workflow + alerts** — Upload CSV **by branch and cutoff**, preview rows, Record Attendance Upload, Send for Verification, HR Verify or mark Needs Correction. In-app payroll notifications show on **Friday (Saturday release reminder), Saturday (release day warning), and Sunday (unresolved follow-up)** for branches that are not Verified; resolved alerts disappear when opened/recomputed. Sample payroll approval and release are blocked for unverified branch/cutoff attendance. Metadata/status persist to browser-local HR state; **the CSV file bytes are not preserved**, and there are **no push notifications, emails, or background jobs**.

## Validation and limitations

- Offline TypeScript verification with available local declaration shims; source parse and relative import checks; CSS parse; basic calculation scenario checks; ZIP CRC integrity.
- **No full `next build`** in this sandbox because Next.js/npm dependency installation is unavailable. Test on Vercel after uploading.
- Frontend demo only: no secure authentication, real remittance, payroll transfer, shared multi-device database, government API live sync, file storage or legally effective signature. A real payroll requires current official publications, policies, records and human review. The calculator is a **review estimate, not an authoritative payroll engine**.
- Dates in other unrelated modules have not been changed by this Payroll-only patch; the shared calendar component can be reused in a later global date-field rollout.

## References for HR to verify

- SSS Circular 2024-006 / 2025 business employer contribution table: https://www.sss.gov.ph/wp-content/uploads/2024/12/2025-SSS-Contribution-Table-rev.pdf
- PhilHealth 2025 Advisory 2025-0002, 5% monthly premium and MBS definition; **recheck applicable 2026 advisory**: https://www.philhealth.gov.ph/advisories/2025/PA2025-0002.pdf
- Pag-IBIG official document reference (fund salary/savings rules; verify current circular and eligible classification): https://www.pagibigfund.gov.ph/document/pdf/payments/ESRS.pdf
- BIR Annex E revised weekly withholding tax table (effective 2023 onwards): https://bir-cdn.bir.gov.ph/local/pdf/Annex%20E%20RR%2011-2018.pdf
- NCR wage classification/source (Payroll minimum-wage region remains NCR only): https://nwpc.dole.gov.ph/ncr/

## Manual smoke test

1. Payroll → Government Deductions → select employee → select Thursday cutoff using calendar → confirm auto amounts, employer/employee split, monthly basis, and tax-exemption toggle. Compare first vs later Wednesday cutoff in same month.
2. Payroll → Holiday Calendar → switch month → select a date → add holiday → verify entry appears on calendar and list → edit via Use details → Save Holiday Changes.
3. Payroll → Payslip History → choose year/month → click weekly cutoff → view employee rows and open released payslip/signing controls.
4. Payroll → Generate Payslips → choose cutoff Thursday, branch and CSV → Record Attendance Upload → Send for Verification → Verify → generate/review/approve/sample release. Try before verification: should block approval and sample release.
5. Test Payroll module on Friday/Saturday/Sunday to verify in-app alerts for unverified branches; no push messages are dispatched when the app is closed.
