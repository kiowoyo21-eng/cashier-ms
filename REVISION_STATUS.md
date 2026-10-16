# v2 Frontend Revision Checklist — Underchargers CMS

Implemented in **source**, pending full browser and multi-viewport runtime verification:

| Priority | Requested | v2 source status / note |
|---|---|---|
| High | Complete RFP Request Edit | Requested part name, supplier, plate, quantity, unit cost, computed amount and matching POS; branch change via dedicated action; Admin old/new comparisons; restrictions after pinning. |
| High | Plate Number Matching | Normalized plate + branch matching, newest visits first, explicit date/customer choices for repeat visitors, one-time pin rule. |
| High | RF Expense Categories | Official 11 categories, compact form maintained, category filter and totals, preserve legacy category descriptions. |
| High | POS Detail Popup | Related POS/extension history, additional items/payments/COGS while Pending, linked new transactions. |
| High | BOD/EOD | Existing 9 AM required report / 4 PM warning / 6 PM EOD deadline, new auto explanation popup and cash discrepancy confirmation, mandatory lock. **Offline background deadline alerts not implemented.** |
| High | Approvals | Status filter, expense approve/reject/report-required, approval review, old/new RFP values. |
| High | Disbursement | Branch summary with starting fund, expenses, approved replenishments, remaining and amount requested (prototype formula). |
| High | Reports | A4 landscape print preview, 30 lines per printed page, separate receipt image print view (save as PDF in browser). **Imported PDF receipt originals aren't merged**, template fidelity still to be reviewed. |
| High | Friday Turnover | Friday-only confirmation, signature pad, unturned closed cash sales, duplicate-day guard. **Exact cash settlement/cutoff policy still needs confirmation.** |
| Medium | Dashboard | Clickable financial summaries, branch filters, separated role access, existing tasks and alerts. |
| Medium | Suppliers | Auto-suggest and reuse from RFP purchases; local only, not centralized master data. |
| Medium | UI | Login grid fix, compact summary/filter layouts and responsive CSS, POS details improved; no Vehicle Master in navigation. |
| Medium | Settings | Password change (INSECURE demo only), local reset, JSON backup and restore, approved category edit. |

## Not production-ready

Browser-local demo state is *per device and browser*. Roles, permissions, credentials, approvals, data uniqueness, audit and deadline alerts are not trusted or centrally enforced until Supabase backend integration. Never enter real financial data or sensitive credentials in the demo.

## Verification

- TypeScript/TSX parse diagnostics: 0 on `app/page.tsx`, `lib/data.ts`, `lib/print.ts`.
- `tests/logic-smoke.cjs`: PASS.
- `tests/revisions-smoke.cjs`: PASS.
- Next.js runtime/build, browser responsiveness and interactive E2E: **NOT verified** (dependency download blocked in this environment).
