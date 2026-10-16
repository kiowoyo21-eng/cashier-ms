# Underchargers CMS — Existing Full UI, Browser Local Preview

**Retained:** the original full CMS React screens/components (POS, RFP, RF, Sales, details, requests, approvals, suppliers, reports, daily tasks, notifications). Database runtime uses browser IndexedDB, not Supabase.

## Start

```bash
npm install
npm run dev
```

Open http://localhost:3000. Demo usernames/passwords:

- `cashier` / `cashier12345`
- `admin` / `admin12345`
- `pbacc` / `pb12345`

Demo accounts are hardcoded and are **not secure authentication**. Do not use real money or personal customer records. IndexedDB data is isolated to a browser profile and origin, persistent across refresh, **not shared** with other devices. Clearing website data clears this database. Export/backup workflows have not been validated.

## Local-specific behavior

- Core POS and RF/RFP entries are persisted in IndexedDB (`lib/localDb.ts`, `lib/backend.ts`). Some complex operational/approval flows use the local RPC adapter in `lib/supabase.ts`.
- Camera proof is captured on the same browser/device; cross-device QR photo upload is **not available** without a server. Old remote Supabase camera API routes were removed.
- Existing role views and report screens are retained, but not every complex workflow has been end-to-end tested. In particular accounting reconciliation, approval/reconciliation side effects, and report attachment preview require further testing.
- No Supabase keys or environment variables needed. This is an **offline-data development preview**, not a production finance application.

## Technical verification

Source and ZIP audited for structural integrity. `npm install` timed out in the build environment; a complete Next.js build and browser tests could not be completed. Do not assume all buttons work end to end until verified.
