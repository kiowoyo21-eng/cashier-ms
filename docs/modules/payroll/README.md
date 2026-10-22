# Payroll Management — Wage Reference and Employee Pay Rates (Batch 03)

Source: `components/PayrollOperationsHub.tsx`, `lib/payrollConfig.ts`, `lib/employee201Rates.ts`, `lib/hrState.tsx`.

The Employee Pay Rates screen now shows **one** NCR automotive reference card, for the general non-agriculture wage: **₱755.00 per day**, per **Wage Order NCR-28**, **26 September 2026**. Official source: [NWPC NCR](https://nwpc.dole.gov.ph/ncr/).

The ₱718/day tier for qualifying small retail/service establishments (15 workers or fewer), manufacturing regularly under 10 workers, and agriculture can be applicable depending on legal classification. The UI **does not** display that tier as an additional selectable rate card, but warns of applicability and requires review. The single official reference is a displayed baseline, **not** an automatic update of employee compensation.

Payroll configuration, historical minimum wage versions (including the lower tier), employee pay-rate changes, individual premiums, payroll releases, payslips, government deductions, holiday rules, loan evidence, and final-pay review data are **not migrated or overwritten**. The existing proposed-reference revision action remains for browser-only review; it does not become the displayed statutory baseline or adjust individual employee payroll.

End-to-end payroll, history, and reference editing browser tests remain pending. This is a frontend-only demo, not legally certified payroll calculation.
