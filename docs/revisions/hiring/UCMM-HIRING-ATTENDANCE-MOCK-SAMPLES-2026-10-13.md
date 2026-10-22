# UCMM HR — September & October 2026 Test Data Update

This incremental patch changes only the listed files. Apply **after** the previous Leave Samples & Official Holidays update.

## What is new

- **20 fictional hiring applicants** total: 4 previous demo applicants + 16 additional September/October demo applicants across four existing job forms. Stages cover new, shortlisted, telephone / initial / final interview, passed, rejected and on hold.
- All new applicants use `example.com` email addresses; references to resumes, uploaded forms and assessments are **fake metadata** for UI testing. No private document is present.
- New browser storage automatically sees the 20 seed applicants. If the browser already has saved recruitment records, open **Recruitment & Hiring** and click **Load Missing Demo Applicants** in the module home. This merges only missing sample IDs and preserves manual and previously edited records.
- **Daily attendance demo** for every date from September 1 to October 31, 2026, using the existing 12 Employee 201 sample people. There are **724 generated entries** for these employees, as one sample employee joined on September 9. All 61 calendar dates are represented.
- Statuses: Present, Late, Overtime, Absent, On Leave, Incomplete, Rest Day, Future Demo. October 14–31 is identified as future test data relative to October 13, 2026 and **is never treated as an actual clock-in**.
- In **Payroll Management → Generate Payslips**, find **September–October Daily Attendance (DEMO)**. Filter by month, employee and status, paginate and export a filtered CSV.
- For testing, select an employee and a valid Thursday cutoff in **Generate Payslips** and click **Copy sample days & OT to draft inputs**. No actual leave validation, government contribution accuracy, approved overtime, or secure attendance import is implied.
- In **Attendance Upload & Verification**, use **Load sample CSV for cutoff**, choose the branch/cutoff and then record/verify the imported metadata. This exercises browser-local status transitions, not real upload.

## Preserved data and caveats

- No edits to original 12 employee records, devices, saved Leave requests, government holidays or Supabase.
- Previously saved applicants/attendance statuses in browser localStorage are not deleted or rewritten; the Load Missing button is intentionally optional.
- The payroll approval path is still a demo requiring review of attendance status; daily mock rows do not automatically become verified attendance and do not automatically create salary releases.
- No production authentication, biometrics, cross-device synchronization, secure documents, or payroll compliance validation is included.

## Updated/new files

- `lib/recruitmentCatalog.ts`
- `components/RecruitmentWorkspace.tsx`
- `lib/demoAttendance.ts` (new)
- `components/DemoAttendanceExplorer.tsx` (new)
- `components/PayrollOperationsHub.tsx`
- `app/globals.css`
- `docs/revisions/hiring/UCMM-HIRING-ATTENDANCE-MOCK-SAMPLES-2026-10-13.md` (new)

## Checks run

- Isolated TypeScript type-check for sample-data modules completed.
- Parsed 53 TS/TSX files and CSS source with zero syntax errors.
- Generated 20 unique applicant IDs, 724 daily attendance rows and 61 dates.
- ZIP integrity checked.
- Full Next.js production build/browser QA remain **unverified** because project dependencies were not installed in the working environment.
