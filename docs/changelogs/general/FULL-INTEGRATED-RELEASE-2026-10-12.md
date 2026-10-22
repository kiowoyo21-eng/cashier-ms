# UCMM HR — Complete integrated frontend source (October 12, 2026)

This is the **entire project**, not an incremental patch. Upload the **contents of this extracted folder** into the GitHub repository root. `package.json`, `app/`, `components/`, `lib/`, `public/`, `docs/`, and `tsconfig.json` belong at that root.

## Included revisions

- Employee 201: compact 2-column profile cards, View/Edit, controlled Employee Actions, branch and Department & Position history, linked Employment Memos, and A4/Letter document preview with Close/Escape.
- Recruitment & Hiring: Hiring Forms for position-specific public links; Hiring Cycle for position-grouped applicant intake/Shortlist/Decline/interviews/final decisions; Onboarding with customizable pre-employment requirements.
- Payroll: six-card workspaces for Pay Rates, Government Deductions, Holiday Calendar, 13th-Month Pay, Payslip History and Generate Payslips; frontend deductions and attendance status; weekly cutoffs and alerts.
- Leave Management: Pending Requests, Incentive Leave Approval, Leave History.
- **Included required dependency:** `components/CalendarDatePicker.tsx` (fixes the reported missing-module build error in Leave Management).
- Other existing modules and public `/apply` and `/report` routes retained.

## Known limitations

- This is a **frontend review application**, with fictional/browser-local records. It is not yet a live secure HR/payroll database, real electronic-signature service, real public submission intake or certified statutory payroll engine.
- Full Next.js production build has not been executed in this packaging environment because the npm dependencies are not installed; confirm the build on Vercel after upload.
- Planned visual polishing of Leave Management photo cards and Holiday Add form/calendar alignment is **not part of this release**; it was still under design review.
- GitHub website uploads do not necessarily remove obsolete files from older commits. If a superseded component exists on GitHub but is absent from this ZIP, remove it separately when needed (see `docs/GITHUB-LEGACY-CLEANUP.md`).

## Deployment

1. Extract the ZIP locally. Open the extracted directory and upload all files/folders into your existing GitHub repository root (do not upload the ZIP itself or an outer wrapper folder).
2. Commit the changes. Verify deployment under Vercel.
3. First test Leave Management (CalendarDatePicker), Employee 201, Recruitment, Payroll, and public routes.

**Future updates:** change-only PATCH ZIP, preserving the same GitHub folder paths and filenames.
