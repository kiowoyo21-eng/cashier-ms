# UCMM HR · Government Report Samples (frontend)

## Scope
Updated `Reports & Analytics` with two main views:
- **Government Reports** (default): clickable agency-linked reporting preparation worksheets.
- **Employee Analytics**: existing headcount, gender, employment status, basic rate summaries and advanced employee report builder, preserved.

All government report figures in the new view are **FICTIONAL EXAMPLES**. They are independent of actual employee payroll, real incident cases, remittance submissions, and real BIR/SSS/PhilHealth/Pag-IBIG credentials. They must never be submitted to government agencies. They do not signify current compliance.

## Sample report catalog
| Agency | Sample report | Source reference |
|---|---|---|
| DOLE | 13th-Month Pay Compliance Worksheet | https://reports.dole.gov.ph/ |
| DOLE | OSH Annual Exposure Data (AEDR) | https://bwc.dole.gov.ph/occupational-safety-and-health-forms/ |
| DOLE | Work Accident/Injury Register (WAIR) | https://ncr.dole.gov.ph/downloadable-forms/ |
| DOLE | Annual Medical & OSH Checklist | https://ncr.dole.gov.ph/downloadable-forms/ |
| SSS | Contribution Collection List (e-CL / R-3) | https://www.sss.gov.ph/pay-contribution/ |
| SSS | Loan Collection Preparation | https://www.sss.gov.ph/download-forms-and-electronic-applications/ |
| PhilHealth | Premium Remittance Worksheet (EPRS) | https://www.philhealth.gov.ph/partners/employers/pay_procedures.php |
| Pag-IBIG | Membership Savings Remittance (MCRF / eSRS) | https://www.pagibigfund.gov.ph/document/pdf/dlforms/providentrelated/Instructions%20in%20Encoding%20of%20MCRF.pdf |
| BIR | Monthly Compensation Withholding (1601-C) | https://www.bir.gov.ph/bir-forms?q=Bir |
| BIR | Annual Withholding Alphalist (1604-C) | https://www.bir.gov.ph/bir-forms?q=Bir |
| BIR | Employee Tax Certificate Register (2316) | https://www.bir.gov.ph/bir-forms?q=Bir |

Report applicability varies by employer, report type, covered activity, timing, and current agency rules. No due date or filing status is asserted by the examples. Monthly, annual and event-based tags indicate a reference period, not verified legal filing deadlines.

## Features
1. Agency chips and report search.
2. Open a sample to view its representative table, reporting year/month, and branch scope (from the existing top-of-app branch selector).
3. Shows which real datasets/confirmations would be needed for actual filing.
4. Download CSV with prefix `SAMPLE_NOT_FOR_FILING_` and an explicit sample-data header; not an agency submission file.
5. A4 landscape print/PDF preview with `NOT FOR FILING` watermark-like warning and Close button.
6. Existing advanced employee analytics and CSV/print functions retained.
7. HR/Super Admin-only handling, matching existing module permissions. Actual role-based security still requires Supabase backend enforcement.

## Frontend test checklist
- Reports & Analytics loads default Government Reports view.
- Search for "1601"; BIR 1601-C card appears. Change agency filter to SSS; only SSS cards appear.
- Open DOLE AEDR and verify sample branch rows.
- Change top app branch from All Shops to UC Las Piñas; results should filter accordingly.
- Change reporting year/month; sample list should update without breaking table.
- Export CSV, inspect first row `FICTIONAL SAMPLE — NOT FOR GOVERNMENT FILING`.
- Print / PDF Preview: title, table and warning are visible, Close works.
- Switch Employee Analytics: original headcount and Advanced Employee Report Builder still work.
- Test responsiveness and permission-denied view for BM.

## Future backend integration
Use verified payroll release ledger, reconciled tax withholding, employee membership IDs, EPRS/eSRS/SSS remittance data, approved DOLE compliance records and authorized OSH summaries. Do not reuse the fictional figures for actual reporting. Official agency-specific filing formats, schedules and source evidence must be validated before enabling any real export or submission.
