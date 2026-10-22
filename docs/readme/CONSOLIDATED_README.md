# HRMS Complete Project - consolidated source (2026-10-20)

This is a **complete project**, not an incremental patch. It is assembled from the user's latest supplied `hrms-prot-main(1).zip` with the following fixes layered on top in chronological order:

1. `hrms-vercel-icon-map-fix-patch-only.zip` - restores missing Lucide navigation icons.
2. `hrms-vercel-spreadsheet-workbook-type-fix-patch-only.zip` - narrows legacy workbook IDs for TypeScript.
3. `hrms-payroll-batches-incremental-patch-only.zip` - adds separate payroll batches, batch-scoped payslip history and payroll worksheets.

Other features already present in the latest project snapshot (including demo-account login cards, Docs/Drive, per-module spreadsheets, and earlier V1-V3 and Vercel fixes) are preserved.

## Installation

You can use GitHub's **Add file > Upload files** in your repository (preserving the file paths). For a complete repo replacement, verify the existing GitHub contents and don't overwrite unrelated newer work; you can also use a GitHub repository import or GitHub Desktop.

For normal local development:

```bash
npm install
npm run build
npm run dev
```

Vercel install command must be `npm install` (or default); build command `npm run build`.

## Scope and limitations

This code includes a frontend-only HRMS and browser-local sample data. Real security, shared approval, cloud Drive storage, and immutable audit records still require a backend. Even after a production build, payroll and editor workflows need interactive testing before real use.

See `CONSOLIDATED_CHANGELOG.md` and `CONSOLIDATED_QA.md` for the included changes and build verification status.
