# v9.18 — Restore Clickable Login Shortcuts

Baseline: v9.17.1; frontend-only.

## Changed files
- `app/page.tsx`: Add opt-in Enable Demo Logins in first-run setup; restore role-specific clickable quick-fill buttons on the login screen; prevent demo bootstrap when Docs/Sheets exist.
- `lib/demo-access.ts` (new): Explicit demo access creation, account/data safety checks, shortcut eligibility tied to role, active status, and original credentials.
- `app/globals.css`: Style explicit test-account restore block and shortcut warning, preserve readable narrow-screen layout.
- `public/sw.js`: Bump PWA cache identity and prefer the latest deployment's JS/styles over stale cached bundles while online.
- `package.json`: Set version to 9.18.0; add v9.18 regression test to logic suite.
- `tests/v9.18-clickable-logins-smoke.cjs` (new): Covers no automatic seed, explicit role creation, no sample transactions/balances, no overwrites, changed-password and inactive-account restrictions, and UI wiring.
- `README.md`: Usage and security limitations.

## Login workflow
1. First-time empty browser: manually create a genuine Admin account as usual, OR use the explicit **Enable Demo Logins** testing option.
2. Demo action requires confirmation and creates only three browser-local test roles; no business rows or fund balances.
3. Login screen shows **Admin**, **Cashier**, and **Parts Buyer** shortcuts ONLY when those matching test accounts exist. Clicking fills credentials; the operator submits Sign in.
4. Existing real accounts remain untouched. If accounts were previously overwritten/deleted, restoring from a JSON backup is required to recover those historical account IDs.

## Validation
- `npm run test:logic`: PASS (all existing and new tests).
- `node scripts/check-components.cjs`: PASS, 79 local imports.
- `node scripts/check-view-maps.cjs`: PASS, both mappings.
- Source TypeScript / TSX syntax checks: PASS.
- Full Next.js production build: NOT VERIFIED (npm dependency cache incomplete in this environment).

## Security / scope
These demo passwords are intentionally public for frontend testing. Do not use demo logins to store real collections or treat them as authenticated cross-branch permissions. Vercel hosting does not make localStorage/shared auth secure. No ERP integration, no backend changes, no automatic business seed data.
