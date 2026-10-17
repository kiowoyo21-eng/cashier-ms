# Version 8.0.1 — Vercel TypeScript Fix

- Fixed `app/page.tsx` `changeStatus()` at former line 161. A previous `item.kind === 'replenishment'` guard already returns from the function, so TypeScript correctly narrows that kind away. The later repeated comparison against `'replenishment'` was unreachable and failed TS2367.
- Removed only that redundant comparison. The replenishment permissions guard and admin explanation restriction are unchanged.
- Package version changed from `8.0.0` to `8.0.1`.
- Frontend-only; Supabase is not connected.
- Manual Vercel deployment test is still recommended.
