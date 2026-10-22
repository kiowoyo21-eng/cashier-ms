# UCMM HR System — Vercel TypeScript Build Hotfix (2026-10-15)

## Updated source files

- `app/onboard-upload/page.tsx` — Removed stale `mergeRequirements` import in favor of the exported `uniqueRequirements` utility; aligned invitation auth/expiry with `ApplicantRecord.uploadPortal`; removed references to requirement statuses/notes that are absent from the current model; accepts both `app` and legacy `applicant` query names.
- `lib/payrollConfig.ts` — Restored imported CSV attendance row type, browser-local attendance row/reminder defaults and optional detailed payslip fields referenced by the existing payroll modules. Default normalization preserves compatibility with previously saved browser configurations.
- `lib/hrState.tsx` — Added optional filename metadata to the existing `HRDocument` type used by Employee 201 Document Library.

## Verification

- Strict TypeScript project simulation (including imported components) passed with no reported errors using temporary lightweight dependency declarations.
- 68 TypeScript/TSX files parsed with no syntax issues, including temporary QA shim source.
- Targeted Node smoke tests passed for applicant requirement deduplication, default payroll migration, and CSV parsing.
- Source-relative module import resolution confirmed (including stylesheet imports).

**Limits:** This container cannot reach npmjs.org (EAI_AGAIN). Therefore actual `npm install`, `npm run build`, rendering, and a Vercel deployment were not executed. Run the real build in Vercel after pushing. The frontend uses browser-local demo storage, not a production-backed applicant upload, payroll, or secure document service. No genuine documents are uploaded through this patch.

## Applying to GitHub / Vercel

1. Extract the ZIP. Do **not** upload the ZIP as a single file into the repository.
2. Copy the **contents inside** `hrms-prot-main/` to the root of your existing GitHub repository, keeping folders/paths unchanged and replacing matching files. Or apply only the 3 modified source files in `UCMM-HRMS-Vercel-Hotfix-Only.zip`.
3. Commit the changes on the branch connected to Vercel.
4. Wait for the new deployment; open Vercel > Deployments > Build Logs to confirm.
5. If Vercel reports any additional errors, share the first full error from the new build log.
