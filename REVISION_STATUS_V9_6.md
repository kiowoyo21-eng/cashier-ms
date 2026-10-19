# v9.6 — Vercel URL and canonical Docs/Sheets route update

- Standalone pages at `/docs`, `/docs/[fileId]`, `/sheets`, `/sheets/[fileId]` (same-origin relative navigation for Vercel).
- Cashier sidebar, Reports-connected files, create/duplicate/convert navigation and login return paths all use canonical `/docs` and `/sheets` routes.
- Old `/documents` and `/spreadsheets` links redirect in Next.js config, retaining file IDs.
- Browser storage format and ownership/approval/delete controls unchanged.
- Bumped PWA service worker cache namespace to v9.6 to flush old cached navigation.
- Vercel deploy needed for user-facing production availability; no cloud synced files in frontend version.
