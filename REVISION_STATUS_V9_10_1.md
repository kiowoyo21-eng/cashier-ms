# v9.10.1 — Vercel View mapping build hotfix

- Fixed the missing `terminal` field in `subtitles: Record<View,string>` in `app/page.tsx`.
- Added `scripts/check-view-maps.cjs` and wired it into `prebuild` to catch future missing view descriptions before Next.js compilation.
- Kept v9.10 POS UI/UX, Terminal Tracker, Stock approvals, Docs and Sheets unchanged.
- The source build still requires dependency installation (`npm install`) followed by `npm run build`; production compilation cannot be verified in this offline environment.

> Vercel log referencing package version 9.8.0 means the deployed repository code has not yet been updated to v9.10. If updating a v9.8 checkout, apply the separate v9.8-specific hotfix or replace repository source with the complete v9.10.1 package; do not overlay the v9.10 `app/page.tsx` onto v9.8 alone.
