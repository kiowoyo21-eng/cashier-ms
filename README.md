# Underchargers Cashier Management — Local-Only Rebuild

A newly implemented Next.js 15 / React 19 / TypeScript demonstration of the Underchargers and Mastermind cashier workflows. It is **not** the original Supabase application and is **not** production-ready for accounting, confidential customer information, or personnel records.

## Install and run

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. No `.env`, SQL database, Supabase project, API key, server CRUD endpoint, email configuration, or cloud storage is necessary. Run `npm run typecheck`, `npm test`, and `npm run build` after installing dependencies. For **GitHub-only publishing (without Vercel)**, follow [`GITHUB_SETUP.md`](./GITHUB_SETUP.md). The included GitHub Actions workflow builds a static export and publishes it to GitHub Pages.

## GitHub Pages publishing

The project includes `.github/workflows/deploy-pages.yml`, `next.config.ts` with `output: 'export'`, automatic GitHub repository subpath handling, and `.gitignore`. Upload **extracted project files**, not the ZIP, to the repository root; then set **Settings → Pages → Source: GitHub Actions**. GitHub builds and publishes `out/` automatically. No Vercel deployment or `.env` is needed. Refer to [`GITHUB_SETUP.md`](./GITHUB_SETUP.md) for the exact steps.

**Important:** This hosts only a static local-data prototype; every browser keeps its own transactions. GitHub is not an application database and does not synchronize data.

## Demo login accounts

| Username | Password | Role |
|---|---|---|
| cashier | cashier12345 | Cashier (UC Mandaluyong) |
| admin | admin12345 | Admin |
| pbacc | pb12345 | Parts Buyer (PB) |
| bm | bm12345 | Branch Manager (UC Mandaluyong) |
| accounting | accounting12345 | Accounting |
| president | president12345 | President |
| hr | hr12345 | HR |
| superadmin | superadmin12345 | Super Admin |

Quick account chips fill in the matching demo credentials on the sign-in screen. Accounts share a single browser-local dataset in the same browser profile. Refresh preserves data in `localStorage` (`uc_cms_local_v1`); sign-in lasts within the current browser session using `sessionStorage` (`uc_cms_session_v1`). Logging out and switching roles does not delete local data.

## Modules

| Screen | Functional operations |
|---|---|
| Dashboard | Branch-aware KPIs, daily signed cash tasks, recent POS and activity, live balances |
| POS | Customer & vehicle information, normalized plate lookup/autofill, service/part quotations, partial/mixed payments, COGS, expenses, controlled close, new transaction from previous plate, audited correction |
| Revolving Fund | Separate expense/replenishment, required signature, optional receipt photos, reviewer status and explanation loop, ledger, CSV |
| RFP | Parts-only supplier/vehicle/plate expense entry, mandatory proof/signature, once-only matching POS link, handover, edit requests and disbursements |
| Sales | Derived closed POS sales, net/gross, payment mixes, date filters, turnover history and CSV |
| Approvals | Cash status review; Accounting signs Verify → President signs Approve → Management Releases disbursement only once |
| BM Inbox | Review signed incidents and RFP change requests with reasons |
| Reports | Sales, Revolving Fund, Cashier Compliance, Turnover CSV and PDF preview/download |
| Suppliers / Vehicle Master | Master records, duplicate prevention, status toggle, export |
| Discrepancy | Super Admin recorded count-versus-ledger reconciliation |
| Audit Logs | Local actor/time/reason/events, selected before and after snapshots |
| User Management | Super Admin demo users, deactivate/reactivate and sample password resets |
| Settings | JSON backup / restore schema validation, full demo data reset |

Four actual branches: **Mastermind Mandaluyong**, **Underchargers Mandaluyong**, **Underchargers Las Piñas**, **Underchargers Quezon City**. Both Mandaluyong branches remain distinct. The initial demo contains **38 POS transactions**, **36 expense rows**, plus opening revolving/RFP balances, suppliers, vehicles, and all role credentials.

## Key behavior / practical workflow

1. Cashier: complete Sales Opening and Revolving Fund Opening from Dashboard → Daily Cash Tasks. Mismatch records signed incident for BM. Opening after 9:30 AM PHT creates late incident.
2. Cashier: add POS quotation, initial payment, services/parts, cost breakdown; pending stays open until fully paid; close posts to Sales automatically (not as an extra mutable sale).
3. Cashier: record signed Revolving expense/replenishment; BM/Admin reviews in Approvals. Approval changes status but never adds the cash twice.
4. Cashier: Revolving Fund Closing Count and signed Sales Turnover. Completing turnover locks further new POS for that branch/day.
5. PB: record Part expense with exact branch, vehicle plate, quantity, unit cost, voucher, supplier, signed entry, receipt image; BM/Admin approves. PB prepares disbursement using approved receipt-complete rows. **Old seed rows are intentionally proof-less and cannot be included in new disbursements**: create fresh RFP entries with uploaded proof to simulate the full workflow.
6. Accounting: verify request with signature. President: approve with signature. Admin/Super Admin: release. Each released request creates replenishment ledger rows exactly once, and locks the covered expenses.
7. Preview the two independent PDF documents before downloading them. Signing/photographing evidence is directly in browser; images may exceed browser storage quota.
8. Settings: export JSON periodically, and import later to restore to same or a different browser **manually** (not live synchronization).

## Architecture

- `app/page.tsx` — entry, demo login and route-by-role screen switching.
- `app/globals.css` — visual system, responsive rules, and print stylesheet.
- `components/Shell.tsx` — sidebar, header, and single notifications bell.
- `components/UI.tsx` — dialogs, signature pad, receipt image compression, fields, pagination, CSV.
- `components/PdfPreview.tsx` / `lib/pdf.ts` — browser-generated jsPDF report and previews.
- `features/*` — screens and guarded workflow mutations.
- `lib/types.ts` — typed schema, role access, branch list, monetary arithmetic, pure derived calculations.
- `lib/seed.ts` — deterministic fixture values and initial accounts.
- `lib/store.tsx` — versioned local repository, validation, session, transaction commits, audit, backup.
- `tests/` — lightweight integrity checks.

## Important limitations compared with source / future production needs

- No secure authentication or trusted role authorization: demo users/passwords are local, browser-controlled fixtures. Users can modify browser storage. UI permissions **do not provide actual security**.
- No cross-device uploads or remotely shared signed links. Real Gmail sending and camera URL flows are deliberately not simulated as successful network actions. Camera input works only on the same device running the app.
- Demo localStorage has a limited quota; receipt images are compressed and individually capped. When local storage is full, save errors are shown. No server backup or sync.
- PDF generation is client-side; its appearance and pagination should be reviewed with actual company documents before use. No validated or legally enforceable e-signature protocol is included.
- RFP weekly handover is a locally signed log, **not a live scheduled Friday-only delivery**. Seed historical entries use demo signature markers and no real receipt proof. They are ineligible for new receipt-required disbursements.
- No external banking or government integrations, no actual supplier bills/invitations, no transactional locking across browser tabs, no real business-grade audit immutability.
- POS/Sales correction is limited to non-financial fields when a transaction is closed. True monetary corrections require separate adjustment-ledger development.
- Daily closing reminders are displayed; the app does not initiate background push notifications while closed. Missed-day reconciliation is not automatically performed in a background task.
- Financial reports use selected date filters; advanced source-specific specialized report layouts and photographic receipt print packing remain simplified, and a legal/finance review is required for real use.

## Verification record

See `VERIFICATION.md` for checks completed and environment limitations. The package is provided as a code rebuild that requires installation and browser acceptance testing; do not interpret it as externally verified software.
