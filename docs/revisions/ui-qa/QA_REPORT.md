# HRMS UI Layout Recovery V1 — QA Report

## Checks passed

- TypeScript parser: 134 TS/TSX/JS source files parsed; zero parse errors.
- Relative static imports/exports: 393 checked; zero missing local paths.
- PostCSS parsing: the new `app/layout-recovery.css` parses without error.
- Static literal class inventory: after adding the recovery CSS, every simple literal className token found in the TSX source has a matching CSS class selector. This cannot establish coverage of dynamic class lists or imported third-party styles.
- Chromium layout smoke test (representative static markup, real `globals.css` + `universal-ui.css` + `layout-recovery.css`): 1440 x 900, 768 x 900, and 390 x 844 passed. Employee fields have 3/2/1 columns, label/value nodes do not overlap, report grids scroll horizontally within their panel, leave modal fits the viewport, and the body does not overflow horizontally in these fixtures.
- `ReportsLanding.tsx` TSX parses after mutually-exclusive table/worksheet update; pagination and CSV/export JSX blocks are still present.
- Source patch includes only new `app/layout-recovery.css`, modified `app/layout.tsx`, modified `components/ReportsLanding.tsx`, plus documentation.

## Not verified

- Full Next.js production build and TypeScript type-check against dependencies: **not available locally**. Attempted offline `npm install` and received `ENOTCACHED` for `@tiptap/core`.
- Actual HRMS React app running in a browser with logged-in users, real module navigation, or end-to-end button/modal tests.
- Pixel-perfect rendering on every device and module; limited representative static smoke tests are not a whole-site visual certification.

## Regression watch list

Check Employee 201 Full Record, Payroll attendance import and batch selection, Recruitment calendar, Leave dialog submission, incident and compliance overlays, spreadsheet worksheet UI, documents/PDF viewer, Ms Kate approval modal, and the Government Reports table/worksheet switch on Vercel.

**Deployment status:** Unverified until Vercel confirms a successful build and these browser paths are exercised.
