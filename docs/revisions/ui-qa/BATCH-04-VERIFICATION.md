# HRMS Batch 04 — QA evidence and remaining checks

**2026-10-22. Scope: source-level verification only; runtime/browser verification blocked by missing project dependencies.**

## Passed in this environment

- TypeScript/TSX syntax parser: 135 files, no parse errors.
- Relative file imports: 392, none unresolved.
- PostCSS parser: 12 `.css` files, no parse errors.
- Markdown local links: 48, none broken.
- Permission-config checks: Super Admin is the only current demo role with `audit`; HR, BM and Ms Kate lack `audit`. Ms Kate satisfies `isHrRole()` and retains normal HR module groups.
- Grouped navigation checks: `Request and Reports`, `Reports & Analytics` and `Tools` visible in HR role; old constituent items hidden from sidebar but preserved as legacy targets.
- Leave source check: three KPI cards with separate icon, label, count; search includes credit ID; branch-exact employee resolution and branch-specific approved leave usage; empty state distinguishes filtered/nonexistent records.
- No files deleted relative to Batch 03; no changes to employee/payroll state and storage libraries.

## Not passed / not performed

- `npm run lint` invokes `tsc --noEmit` but fails due missing `next`, `react` and JSX types. This does **not** establish TypeScript semantic correctness.
- `npm run build` fails because `next` executable is not installed.
- Browser QA: no live authenticated sessions or reliable tablet/mobile screenshots could be produced here.
- Full modal/popover focus, escape, overlay bounds and stacking across **all** modules are not certified.
- File editors, exports, forms submissions, incident stages and per-role approval persistence could not be clicked end-to-end.

## Required browser QA in actual development workspace

1. `npm install`, `npm run lint`, `npm run build`, `npm run dev` from repository root.
2. For Super Admin, HR, BM, Ms Kate: visit sidebar, try legacy tab actions, type/paste unauthorized audit page/action; confirm HR module access for Ms Kate without admin audit access.
3. Leave: check top KPI number/labels and click each filter; search by known credit ID; clear empty filters; create SIL/VIL credit; verify approval applies once only and does not apply before effective date; verify decision note is required and recorded. Test two same-name employees in different branches and ensure leave balances do not cross.
4. Requests & Reports: open both internal tabs, create/send/review a fictional form, export unsigned text, route a fictional incident BM↔HR, open attachments/print history (and confirm session-only attachments are labeled accurately).
5. Tools: test Drive preview/download (view-only), Spreadsheet workbooks/open-save-export in authorized roles, Document Library template/auto-fill read-only vs Super Admin edit grants, and legacy standalone routes. Verify no browser-storage records disappear on switching tabs.
6. Check desktop (~1440px), tablet (~820px), mobile (~390px) and both orientations: component positioning changes without tiny text or forced width stretch; scroll is internal to tables and calendars. Confirm no horizontal page overflow or invisible popovers/modals.
7. Re-run unrelated Employee 201, Hiring, Payroll, Dashboard, Reports and audit regressions from Batches 01–03.
8. Do not use real employee data or statutory identifiers until a secure backend with server-checked roles is built.

Any check performed later should be added with a date and evidence. Do not change these items to *verified* without actually running them.
