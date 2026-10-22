# HRMS UI Recovery — GitHub Website Instructions

## Files in this incremental patch

- `app/layout.tsx` — replace
- `app/layout-recovery.css` — **new**
- `components/ReportsLanding.tsx` — replace
- `CHANGELOG.md`, `QA_REPORT.md`, `WHOLE_SITE_UI_AUDIT.md` — documentation

## Applying the patch

1. **Back up the current `main` branch** (download source ZIP or create a branch).
2. This patch is based on the user's latest uploaded `hrms-prot-main (1).zip` plus the previously delivered premium Dashboard + Employee 201 filter patch. If you have edited `app/layout.tsx` or `components/ReportsLanding.tsx` since, **compare your versions** rather than blindly replacing them.
3. Open GitHub repository `hrms-prot` on `main`.
4. Upload `app/layout-recovery.css` into `app/`. Ensure the existing `app/layout.tsx` imports it **after** `globals.css` and `universal-ui.css`, as shown:
   ```ts
   import "./globals.css";
   import "./universal-ui.css";
   import "./layout-recovery.css";
   ```
5. Upload/replace `components/ReportsLanding.tsx` (only if no newer conflicting edits).
6. Commit the changes and verify that the Vercel deployment **builds successfully**.
7. Hard-refresh (Mac: Cmd+Shift+R), then test **Employee 201 > Full Record**, **Reports > Government Samples > Table/Worksheet**, **Leave > New Request**, **Payroll > Demo Attendance**, **Docs/Document Library**, and narrow-screen responsive layout.
8. If an error occurs, share the **first real error**, the deployment commit, and a screenshot of the affected module; don't apply additional feature patches until it builds.

This is a style/UX and report-display patch. It does not add accounts, modify payroll amounts, or connect to CMS, Accounting, or ERP.
