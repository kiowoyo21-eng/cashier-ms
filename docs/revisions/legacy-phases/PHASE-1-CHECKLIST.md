# Phase 1 — Frontend Foundation Checklist

Status: Frontend prototype created; no real database or authentication.

- [x] Next.js + TypeScript app structure
- [x] Responsive white/yellow design and dashboard
- [x] Demo role selector through development credentials
- [x] Sidebar, route-like module navigation, per-module task counters
- [x] UC/MM four-shop selector (BM restricted to demo branch)
- [x] Account settings and signature preview (not persisted)
- [x] Grouped audit log mock view and module filter
- [x] Module search/urgency filter UI
- [x] PWA manifest + install-oriented metadata
- [ ] Configure secure authentication with Supabase Auth (later phase)
- [ ] Real Supabase database tables and RLS (later phase)
- [ ] Real payroll, documents, IR, compliance, and notifications (later phases)
- [ ] Complete install/offline service-worker support and production icons (later phase)
- [ ] End-to-end tests and production security audit (later phase)

## Database blueprint starter

Define and review entities incrementally as screens are finalized:

- Organizations / legal employers and branches
- Profiles, roles, scoped permissions and branch assignments
- Employees, employment appointments, effective-dated salary rates and benefit entitlements
- Documents, versions, templates, signature requests and approval events
- Grouped audit events: module, record ID, actor, branch, action, result, timestamp
- Tasks, priorities, deadlines, resolution status and notification events

No SQL migrations are run in Phase 1.
