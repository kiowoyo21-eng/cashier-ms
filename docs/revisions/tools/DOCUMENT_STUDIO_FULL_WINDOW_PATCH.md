# HRMS Document Studio — Docs and PDF Form Workspaces (2026-10-19)

## Purpose and scope

A dedicated **Document Studio** module, opened from HRMS navigation in a separate browser window when the browser permits; otherwise a separate browser tab. The former Documents & Templates workspace remains in place for existing HR verification functions.

- Studio library: `/studio`
- Docs document editor: `/studio/docs/[id]`
- PDF form editor: `/studio/pdf/[id]`
- Spreadsheet workspace: `/spreadsheets` (retained from cumulative patch)

## Included capabilities

### Docs

- Rich-text editing powered by Tiptap/ProseMirror: text styling, font size, font face, text/background color, headings, paragraphs, bullets, numbering, quotes, links, images, tables (add/remove rows/columns), alignment, sub/superscript, horizontal rules, page breaks, undo/redo, keyboard shortcuts, word/character counts.
- Full-page editor UI, A4/Letter/Legal, portrait/landscape, configurable margins, header/footer text and outline.
- Search and replace (text-based), versions and restore, debounced autosave with optimistic version conflict checks and explicit Save.
- DOCX import (HTML conversion by Mammoth), DOCX export for common text/tables (docx), print / Save as PDF via browser print dialog.
- Reusable source templates with Employee 201 merge variables and custom fields; preview and batch-generate 1–100 employee documents atomically. Unknown/unfilled variables block batch generation.
- Source template states Draft/Approved Template/Archived; HR only generates from admin-approved templates. Original templates are never modified by the merge operation.

### PDF form editor

- Upload PDF as template; original bytes are in browser IndexedDB (up to 20 MB / 100 pages).
- PDF page rendering, multi-page navigation, zoom, placed/dragged text/date/checkbox/printed-name fields.
- Map fields to HRMS Employee 201 values or manual inputs; optional required-field validation.
- Detect existing AcroForm field names and fill them using pdf-lib, or overlay new text fields in a generated PDF; optional AcroForm flattening.
- Save mappings separately with approval and version/audit history; generate/download filled PDF without overwriting original.

### Permissions and audit (browser-demo rules)

- HR and Super Admin can view source documents. BM cannot open Studio.
- HR must request editing access **per document**, supplying a minimum 12-character reason.
- Super Admin may approve/deny/revoke. Approved HR edit access expires after 60 minutes.
- Save operation rechecks session, grant, and document version. Approvals/edits/generation/versions log to local-browser audit history.
- Super Admin may edit and create templates directly. Approval queue is in `/studio`.
- **CRITICAL:** Frontend-only authorization is not secure; localStorage and IndexedDB are browser-local and tamperable. No cross-device role verification, database, encryption at rest, or legally verifiable e-signatures. Do not use for real confidential employee/HR documents until backend security is implemented.

## Installation

1. **Create a backup / commit your current HRMS code.**
2. Extract the `hrms-document-studio-cumulative-patch-only.zip` into the HRMS project root, preserving directories and overwriting matching files.
3. Run `npm install` to fetch editor/PDF libraries added to `package.json`; then run `npm run dev`.
4. Log in to HRMS as Admin or HR and click **Document Studio** in the sidebar, or under **Documents & Templates → Open full Document Studio**.
5. Super Admin creates/imports templates. For docs, insert `{{employee.name}}`, `{{employee.position}}` or other merge variables in the editor. For PDF, import a PDF and position/match the fields.
6. Super Admin sets source template to **Approved Template** and saves. HR can auto-fill approved templates in Studio; for edits HR sends a request and Super Admin approves.

## Important limitations and upgrade path

- This is a broad, working **frontend editing feature**, but not an exact replacement for Google Docs, Adobe Acrobat, or Word. True real-time multiplayer editing, comments/suggestions, seamless Google Docs-quality pagination, arbitrary replacement of native PDF artwork/text, OCR, advanced DOCX round-trip layout fidelity, and certificate-based legal digital signatures are **not implemented**.
- DOCX export primarily preserves paragraphs, headings, basic inline formatting, lists, and tables; images, fonts, page setup and precise pagination may differ. Use PDF/print for higher visual fidelity and always review official forms before release.
- PDF overlays are visible text additions, not secure redaction: hidden original text may still be present. Do not use as a redaction tool. Embedded fonts support limited glyphs; review non-Latin names.
- The PDF preview/rendering is subject to browser memory limits; images in Docs are limited to 600 KB; browser localStorage has a small quota, so do not import large files as Docs templates.
- `npm install` and a full Next.js build **must be run in your local development environment**. The offline analysis environment could not install npm packages, so package-level/type/runtime integration has not been verified here.

## Patch contents

This ZIP is **cumulative**: previous Spreadsheet + Admin Approval patch files plus new/modified Document Studio files, and package.json. It contains **only changed/new files**, not the whole app, `node_modules`, or previously unmodified files.

## Test notes

- Static TypeScript/TSX syntax parse of all 86 source files passed.
- Relative import file-resolution validation passed.
- 16 focused browser-state logic checks passed (request, approval, scoping, expiry/revocation guard, stale-version guard, template creation, generation/HTML escaping).
- Full Next.js build, PDF browser rendering/printing, DOCX fidelity and clickthrough end-to-end QA are unverified until `npm install` and browser tests.
