# UCMM HR — Global UI / Session / Incident Review Update
Release date: 2026-10-13
Base: Full `hrms-prot-main` GitHub repository uploaded by user + existing October 13 process/payroll patch.

## Changes included

1. **All modules: compact top navigation** — shared workspace displays module name once in the slim top bar. Removed repeated page-level title box; moved the existing module guide/notification controls to top bar where applicable. Dashboard retains context details, but not duplicated title.
2. **Global layout** — normalized navigation card size, icon/illustration height, body padding, footer alignment, white space and responsive breakpoints across Payroll, Recruitment, Leave, Incident Reports, Documents & Templates, plus reused global panels, forms and tables. Smaller card sets no longer stretch across available space. Existing action buttons preserved.
3. **Employee Directory filters** — a single compact search field, filter toggle with applied-count indicator, sort selector, optional clear action, quick-presets, and an expandable section containing branch, status, department, gender, position, salary type, document status, hire dates and min/max rates. Existing filtering logic, search, chips and sorting preserved.
4. **Browser-local demo session** — restores recognized demo username/role on refresh, and returns to login after explicit logout, 30 min inactivity or a 7-day absolute lifespan. No passwords saved. **This is not secure authentication**; browser state is editable and must not be used to enforce actual user access or hold employee confidential data.
5. **Daily-paid monthly basis** — retains the existing `estimateMonthlyBasis` calculation (daily basic × 26) and shows its reference alongside daily rate in Employee 201 salary details and payroll pay-rate history/list. Actual weekly payslip uses attendance/paid days, overtime, holiday eligibility and validated deductions, not a fixed 26 paid days per calendar month. Official government agency schedules must be validated before production processing.
6. **Incident Reports** — places the full original incident narrative in a read-only panel before the case processing controls; expands the fictional seeded IR examples. For previously saved demo seed descriptions that match exact generic placeholder strings, only those sample narratives are refreshed. Explicit user-entered narratives are not replaced. The duplicate short narrative in Case Details was removed; initial Case Documents tab defaults to Written Explanation. Case list action reads `View Full Report`.
7. **Incident processing** — compact 9-step progress track and stage dots, readable current-stage details, previous/next navigation *for reviewing completed stages only*, notes required to advance, HR decision/closure safeguards retained, and browser-local draft text persistence while reviewing a case. Stage navigation alone does not change case status.

## Not delivered / existing limitations

- Supabase authentication, server-enforced RBAC, tamper-proof audit logs, secure applicant uploads or file bytes storage are **not** built; the app remains a **fictional/demo review workspace**.
- Real confidential IRs, applicant files, staff details or payroll runs must not be entered until the production backend is secured.
- Network-dependent `npm install` could not complete in the editing environment, so a complete Next.js `npm run build`, Vercel deployment and visual browser QA could not be performed here.
- Local/global CSS responsive rules were adjusted, but visual device-level checking remains mandatory after deploy.

## Static validation run

- Parsed/transpiled all **48 root-project** `.ts`/`.tsx` sources with the locally available TypeScript compiler: **0 syntax diagnostics**.
- Full Next.js typecheck/build still needs project dependencies and Vercel or a local environment.

## Deployment instructions (GitHub → Vercel)

1. Download this full repository ZIP and extract it locally.
2. Open the extracted folder **containing root `package.json`, `app`, `components`, `lib`**. Upload those files/folders to the **root** of the GitHub repository; do not nest a second `hrms-prot-main` folder.
3. Allow the connected Vercel project to deploy. If Vercel's root directory is customized, point it to the folder with the main `package.json`.
4. Use demo records only. Test a login → refresh → logout cycle, Employee Directory filters, navigation cards at desktop/tablet/mobile widths, IR full report and stage review, and daily-rate payroll reference display.
5. In a local terminal with network access, run `npm install`, `npm run lint` and `npm run build` before accepting the release.

Note: The repository still contains historical standalone Phase 9 folder and Phase 3 ZIP, retained unchanged for backward reference. The **root** `app`/`components`/`lib` is the active project.
