# CMS v9.21.1 — Vercel PDF TypeScript Hotfix

## Reported production error
Vercel commit `e6b5457` (CMS v9.21.0) failed `tsc --noEmit` because `lib/disbursement-paper.ts` used undeclared `normalize` and `left` identifiers in PDF receipt attachment rendering (lines 133–141). There were ten TS2304 errors.

## Changes
- Replace undeclared `normalize` with the existing PDF-local ASCII text sanitizer `safe` for receipt heading/error text.
- Replace undeclared `left` with the existing PDF-local page-margin variable `margin` for receipt headings and image width calculations.
- Bump package version to `9.21.1`.
- No changes to approval states, status transitions, accounting/HRMS handoff, fund entries, calculations, receipt source linkage, or user data.

## Verification
- `npm run check:components`: PASS — 87 local imports.
- `npm run check:view-maps`: PASS — all 15 views.
- `npm run test:disbursement-requests`: PASS — v9.21, v9.20, v9.19.
- Other selected legacy tests (v9.15, v9.17.1, v9.20.1): PASS.
- Targeted `tsc --noEmit --strict` for PDF source using a temporary external `pdf-lib` declaration stub: PASS; this checks the PDF source for missing identifiers but is **not** a full Next.js production build.
- Full logic suite progressed through v9.6 but timed out in a later legacy office-editor test; no failed assertion was reported before timeout.
- Full Next.js build: **not verified** because npm dependencies were not available in the container's offline npm cache.

## Apply
Patch v9.21.0 only. Extract `lib/disbursement-paper.ts`, `package.json`, and this note to the root of your existing CMS repository; commit/push to GitHub to trigger Vercel. This patch does not erase localStorage or saved data.
