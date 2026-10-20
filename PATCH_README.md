# HRMS Workspace V2 Resumed — Install Guide

**This is an incremental PATCH ONLY**, not the full HRMS project. Requires the existing Workspace V1, V2, and V3 code. The previously reported DOCX bullet type fix is included in this ZIP.

1. Backup your current project/commit.
2. Extract all files from this ZIP into the project root (where `package.json`, `app/`, `lib/`, and `components/` exist). Keep folder structure and overwrite matching files.
3. No new npm packages are required by this patch. Ensure Vercel **Install Command** is `npm install` (or default), **Build Command** is `npm run build`.
4. Run `npm install`, then `npm run build`, then test `/spreadsheets`, `/docs`, and `/drive` locally.
5. Check HRMS Employee 201, Payroll, Assets, Leave, Recruitment and Compliance screens for the **Spreadsheet reports** launch links; test new-tab behavior.
6. Log in as HR, request worksheet edit approval; log in as Super Admin on the same demo browser to approve; verify the audit feed.
7. Deploy only after successful production build and smoke testing.

### Routes
- `/spreadsheets` — workbook home.
- `/spreadsheets/employees`, `/attendance`, `/payroll`, `/assets`, `/leave`, `/loans`, `/recruitment`, `/compliance`, `/incidents`, `/working` — dedicated workbooks.
- `/docs` — Docs home; `/docs/[id]` — Docs editor; existing `/studio/docs/[id]` links still work.
- `/drive` — view-only file browser; existing documents and uploaded assets remain available.

### Guardrails
- Browser-only prototype. Do not upload real HR confidential data or rely on demo permissions as real security.
- Spreadsheet source reports are snapshot/working-copy overlays; they DO NOT post edits back to official HRMS data.
- DO NOT interpret the consolidated payroll workbook as already batch-isolated; that is next-stage work.
- Read `CHANGELOG.md` for all implemented behavior and pending scope.
