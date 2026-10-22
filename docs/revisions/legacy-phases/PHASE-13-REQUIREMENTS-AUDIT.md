# Phase 13 — Requirements review, not production completion

This phase adds the dedicated **Advanced HR Screens** workspace, with five reviewable sections:

1. Employee 201: onboarding document compliance, probation, movement, exits, requests.
2. Payroll Operations: cutoff reconciliation, rate review, deductions, remittances, 13th month, funding, payslip follow-up.
3. Document Operations: template mapping, COEs, signing requests and acknowledgments.
4. Administration: account/access planning, MFA, retention, disaster recovery, integration health and alerts.
5. Report Catalog: headcount, payroll, movements, statutory report planning, compliance and confidentiality.

Each section has a scoped directory, search, status filter, printable details, filtered CSV export and local-only demo creation/status adjustment. The selection checklists are temporary.

## Known missing / backend-dependent requirements

- All demo state disappears on refresh; module demos are not cross-linked with real employee IDs.
- Mock frontend role visibility is **not** server security.
- No Supabase, storage, secure signing, real PDF/DOCX population, email/SMS, QR identity challenge or approval workflows.
- No legally verified rates, withholding, labor entitlements or official government schemas.
- Not all workflow configurations and conditional fields have independent full screens yet.
- Login credentials in source are insecure demos only.
- Full Next.js production build must still be validated through an npm-enabled environment/Vercel.

## Manual acceptance checks

- Login with demo Super Admin or HR.
- Open Advanced HR Screens, use all five tabs, filter records, create a demo entry, change status, export CSV, inspect mobile layout.
- Login with BM and confirm this HR-only menu is not visible (frontend-only).
- Check Employee 201, Payroll, Documents, and HR Workflow Center from earlier phases still load.
- Run `npm install && npm run build` and resolve all build failures before production use.
