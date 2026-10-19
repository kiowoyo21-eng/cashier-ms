# v9.6.1 — Vercel CSV export typecheck hotfix

## Corrected

- `components/ReportStudio.tsx`: The CSV export formatter referenced `r` without declaring it inside the outer `Array.map()`. Changed the callback to `(row, r) => ...`, so exported computed spreadsheet cell values use the correct row index and TypeScript no longer reports `Cannot find name 'r'` at that location.
- `tests/v9.6-vercel-office-routes-smoke.cjs`: Added regression assertion for the CSV export callback binding.

## Deploy

Apply the patch to your existing v9.6 project, commit, and push to your Vercel-connected `main` branch. This does not change local browser files or require a data migration.

## Validation limits

Logic and Report Studio tests passed. A full `next build` was not runnable locally because dependency installation failed (npm registry DNS resolution unavailable). Please verify the new Vercel build and share any subsequent errors.
