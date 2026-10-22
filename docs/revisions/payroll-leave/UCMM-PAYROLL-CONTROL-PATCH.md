# UCMM HR — Payroll Control Center Patch

**Scope:** Changed/new files only, preserving original GitHub folder paths. Based on the latest Recruitment Hiring Forms → Hiring Cycle → Onboarding version plus previously applied Employee 201 patches.

## Six Workspaces

1. **Employee Pay Rates** — NCR wage reference cards with effective dates, employee directory, current effective base rate, proposed effective-dated changes, rate history, and employee OT/rest-day/holiday premium profiles. Reference regional wage classification must be verified before real use.
2. **Government Deductions** — SSS 2025 employer/employee table, PhilHealth 2025 premium reference, Pag-IBIG reference, BIR 2023-onwards weekly withholding bands. Search, history/versioning, CSV import, editable proposal rows, proposal save, manual employee deduction overview, remittance CSV tracking. These sources **do not become automatic payroll deductions** without review and implementation of agency-specific computation rules.
3. **Holiday Calendar** — HR can enter date, type, branch applicability, department and individual total-pay percentages with hierarchy: **employee exception > department override > baseline**. Optional extra-premium suggestion for daily-paid employees when the ordinary day is already included in days worked. Actual holiday applicability, rest day, overtime, and attendance need validation.
4. **13th-Month Pay** — Per-employee eligible annual basic earnings, computed estimate (`eligible basic / 12`), For Review and Approved (Demo) steps. Does not issue real payments or assume gross releases are all eligible basic pay.
5. **Payslip History** — Search released sample ledger by employee/month, CSV, open payslip, print/save to PDF A4/Letter, one acknowledgment request per **employee AND document/release**, revocation and local sample states.
6. **Generate Payslips** — Thursday–Wednesday cutoff; individual draft calculations with editable attendance/bonus/holiday premium and sample deductions; optional batch sample drafts; Draft → For Review → Approved → Released (Demo). Attendance CSV preview is retained for review; not directly applied to payroll computations.

## Individual payslip signing — planned architecture

- One unique, expiring link/QR for one employee and one specific **approved, immutable** payslip.
- Employee views full payslip and acknowledges on own device; identity validation, timestamps, revocation, secure signed PDF storage, and audit trail required in backend phase.
- The local preview can **prepare a request reference** and choose Phone/QR, On This Device, or Print & Upload. Phone/QR link is **not actually generated/delivered** yet. No legal signature is claimed.
- Signed/acknowledged document will eventually be archived under Employee 201 → Documents → Payslips; shared release ledger already displays released sample payslips there.

## Official reference sources and caveats

- Current NCR minimum wage reference (as of 12 Oct 2026): non-agriculture ₱755/day; eligible small service/retail or agriculture ₱718/day, effective 26 Sep 2026 — https://nwpc.dole.gov.ph/ncr/ . Applicable classification, wage orders under litigation, exemptions, and region must be checked before production.
- SSS 2025 employer-employee table — https://www.sss.gov.ph/wp-content/uploads/2024/12/2025-SSS-Contribution-Table-rev.pdf . Includes monthly salary credit and employer EC amount in reference. MPF allocation needs validation.
- PhilHealth 2025 UHC reference (5% total with ₱10k floor, ₱100k ceiling) — https://www.philhealth.gov.ph/uhc/ . **2026 current validity not confirmed.**
- Pag-IBIG fund salary ceiling reference — https://www.pagibigfund.gov.ph/document/pdf/payments/ESRS.pdf . Confirm applicable agency circular and exceptions.
- BIR Annex E 2023-onwards **weekly** withholding tax bands — https://bir-cdn.bir.gov.ph/local/pdf/Annex%20E%20RR%2011-2018.pdf . Taxable compensation is NOT gross salary and tax is NOT auto-calculated.

No real statutory/employee deduction calculation, external government filing, bank payout or legally valid e-signature occurs. The numbers are sample/reference values stored in browser localStorage. Real production must validate updates, per-employee eligibility, schedule frequency, and backend RLS/approvals.

## Patch Contents

- `components/PayrollOperationsHub.tsx` — reworked six-card payroll module.
- `components/EmployeeWorkspace.tsx` — show effective-dated basic rate changes in Employee 201 view/filters.
- `components/ModuleAlerts.tsx` — route payroll bell notifications to corresponding payroll workspaces.
- `lib/payrollConfig.ts` — new browser-review payroll schedules and shared typed settings.
- `lib/hrState.tsx` — backward-compatible local data migration/persistence for payroll config.
- `lib/printDocument.ts` — optional A4/Letter print page size, backward compatible default A4.
- `app/globals.css` — new responsive payroll card and data-table styles.
- `docs/revisions/payroll-leave/UCMM-PAYROLL-CONTROL-PATCH.md` — these notes.

## Manual test plan on Vercel

1. Payroll home displays 6 visual cards at desktop and mobile, with relevant summary indicators.
2. Rates: choose employee, schedule a pay increase effective tomorrow. Reload, see scheduled history; see original rate for historical cutoffs. Review Employee 201 current rate after effective date.
3. Government: select SSS/PhilHealth/Pag-IBIG/BIR, search compensation bracket, open source URL. Propose new version, upload sample CSV with headers `min,max,employee,employer,effective`; inspect proposed rows and save version. Verify originals remain available.
4. Holiday: create a special holiday for a branch; set department percentage, optionally employee percentage. In Generate Payslips pick matching employee/cutoff, select holiday, review suggested daily extra premium. Check input validation and hierarchy.
5. 13th: input eligible basic pay for one employee, save/submit/approve in browser; confirm no release transaction created.
6. Generate: select employee, Thursday cutoff, days worked/deductions; save individual draft, review → approve → record demo release, check sample payslip appears in History and Employee 201 Documents. Ensure duplicate same-cutoff release is blocked.
7. History: choose an employee and sample payslip, print A4 and Letter, prepare one phone/QR placeholder request, ensure duplicate request is blocked, revoke and create new reference; no actual QR delivery claimed.
8. Notification bell: after creating a pending payslip review and near-term holiday, click each alert and confirm it opens its respective card.
9. Verify Recruitment, Employee 201 two-column layout, government compliance and Assets remain accessible after only these files are uploaded.

## Validation scope

- Offline TypeScript check with local React/Next typings shim, source parse and import consistency checks.
- Full `next build` / Vercel deployment cannot be verified without installing npm dependencies; test on Vercel after GitHub patch upload.
