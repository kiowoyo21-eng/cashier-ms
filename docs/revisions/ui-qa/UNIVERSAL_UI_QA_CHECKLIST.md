# HRMS Universal UI QA — Master Revision List (2026-10-20)

**Goal:** All HRMS modules should have consistently usable, predictable controls. This applies to Super Admin, HR, BM, narrow/mobile screen sizes, desktop browsers and browser zoom.

## Fixed / guarded in Docs V6 (code-level; browser confirmation pending)
- Document Library auto-fill overlay now uses a body-level portal; avoids being laid out under cards or clipped inside scrolling/stacking parents. Escape, backdrop dismiss and body scroll locking included.
- Docs menu raised within the editor header's stacking context and constrained to viewport height.
- Document Operations old session-only template listing redirected to central Studio so users do not see two different template datasets for the same concept.
- Studio external launch uses a normal new-tab link, not forced popup-window sizing.
- Preflight rejects missing or invalid form data, avoids duplicating generated placeholders, and keeps approved template contents/version history distinct.

## Cross-module QA backlog (NOT yet marked fixed)
1. **Dialogs and dropdowns:** Verify overlay portals, `position:fixed` vs `position:absolute`, scroll containers, stacking contexts, viewport/zoom handling, keyboard and outside-click closing, correct focus/scroll restoration. Include date pickers and selects in Employee 201, Payroll, Leave, Recruitment, Incident Reports, Assets, Compliance, Drive, Docs, Sheets.
2. **Nonfunctional actions:** Verify every visible button has correct handler; no silent dead controls; disabled states have contextual reason; unsupported frontend/backend features are labeled rather than silently acting successful.
3. **Data correctness:** Check wrong employee/branch/batch identity, stale data after changes, inconsistent mock vs current browser-storage state, accidental fallback to unrelated records, fake default values, 'random' rows. Make empty states truthful.
4. **Duplicates/repetition:** Verify stable IDs/keys, one row per logical entity, no duplicate cards after filtering/import/refresh, no duplicated tabs, template lists or repeated generated outputs.
5. **Permissions/audit:** Test Super Admin/HR/BM visibility, request/expiry/revocation, confirm view-only pages do not enable edits through keyboard shortcuts or other hidden controls.
6. **Responsive consistency:** At 360/390/768/1024/1440px and 100/125/150% zoom, ensure menus/modals/tables are usable and interactive elements do not appear below the main page or behind fixed headers.
7. **End-to-end regression:** Smoke test sign-in, core modules, workbook navigation, Docs, Drive, payroll batches, file import/export, print/PDF and reload. Compare real screenshot before/after and record first build/runtime error.

## Reproduction template for future issues
- Module / URL:
- Demo role / branch:
- Browser, viewport, zoom:
- Action taken:
- Expected vs actual (screenshot or screen recording):
- Does refresh or another role reproduce it?:
- Error from browser console (if any):

**Rule:** Never claim the entire universal UI is bug-free based only on static source checks. Fix reproducible issues in small batches, then verify Vercel and real browser rendering.
