# HRMS prototype roles and permissions

Current live permission source: [`lib/mock.ts`](../../lib/mock.ts), evaluated client-side.

| Role | Modules | Audit Log | Final approval |
|---|---|---|---|
| Super Admin | All current demo modules | Yes | General existing capabilities |
| HR | HR modules, grouped Requests/Reports/Tools | **No** | Existing HR review functions |
| Special Final Approver — Ms Kate | Normal HR modules + final-approval workspace | **No** | Ms Kate-specific final step |
| BM | Existing permitted BM modules, including HR Forms and Incidents inside Request and Reports | **No** | Existing branch workflow only |

This repository uses browser-local demo accounts and client permission checks, **not secure server authentication/authorization**. No real protection of sensitive data or tamper-proof audit is possible without a backend. The audit events continue to be recorded by the existing browser-local audit mechanism; the Audit Log viewer is Super Admin-only in this demo.

Cross-system disbursement model is **planned**, not live: CMS request -> Accounting first approval -> Ms Kate HRMS final approval -> release after approval. ERP is completely disconnected.
