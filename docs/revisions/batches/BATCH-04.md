# Batch 04 — Leave / Requests / Tools / Final QA

**Status: source implemented with verification limitations**, 2026-10-22. This report distinguishes edits from unverified browser behavior.

## Scope and actual files

| Requirement | Status | Actual source paths | Verification |
|---|---|---|---|
| Leave metrics icons/counts/labels | Implemented (browser QA pending) | `components/LeaveManagementWorkspace.tsx`, `app/globals.css` | Static syntax and semantic source checks |
| Leave filters, CSV, modal, credit review | Existing preserved; branch name-match fixed | `components/LeaveManagementWorkspace.tsx` | Source-level guard and handler assertions; click tests pending |
| Leave table + no-matching-records feedback | Implemented (browser QA pending) | `components/LeaveManagementWorkspace.tsx`, `app/globals.css` | Static source checks |
| Request and Reports internal tabs | Implemented in Batch 01; preserved | `components/GroupedWorkspace.tsx`, `app/page.tsx` | Navigation/permissions static checks |
| HR Forms compact review register | Implemented (browser QA pending) | `components/HRFormsRequestsWorkspace.tsx`, `components/HROperationsExtras.module.css` | Scoped style and existing workflow source checks |
| Incident cards / compact filters | Implemented (browser QA pending) | `app/globals.css`, existing `components/IncidentWorkspace.tsx` | Existing stages and routes source check |
| Tools tabs / storage / permissions | Implemented in Batch 01; preserved | `components/GroupedWorkspace.tsx`, `components/workspace/DriveWorkspace.tsx`, `components/SpreadsheetPageClient.tsx`, `app/studio/page.tsx` | Static wiring and route check; runtime open/save pending |
| Audit Log + Ms Kate guard | Implemented in Batch 01; no newly granted access | `lib/mock.ts`, `app/page.tsx`, `components/studio/StudioGate.tsx` | Static role checks only; not production auth |
| Four-batch subject-based Markdown docs | Implemented | `docs/readme/`, `docs/architecture/`, `docs/modules/`, `docs/revisions/`, `docs/changelogs/`, `docs/workflows/` | Relative link audit |
| Global modal/popover, all roles, responsive screenshots | **Not browser verified** | Across `app/`, `components/` | Requires installed dependencies, build and running browser |

## Important unchanged behavior

- The `leave` and `leave-credit-requests` browser-storage keys and record schemas, SIL/VIL leave-credit computations, salary/payslip algorithms and existing approval history remain unchanged.
- The exact matching of a paid-leave applicant now requires both name and branch; a same-name different-branch Employee 201 record cannot be silently used for the leave balance check, and only same-branch approved leave days reduce that employee's allowance.
- Forms are documentation-only and Incident attachments may include session-only bytes; neither becomes secure document storage.
- ERP is **disconnected**. CMS→Accounting→Ms Kate sequencing is documented as a future handoff, not a live transaction.

## Production and QA limitations

- Auth, branch restrictions and audit events run in the browser; only a backend can enforce true server-side permissions, immutable logging and private employee records.
- This source handoff is **not** deployment-ready until dependencies are installed, `npm run lint` and `npm run build` succeed, and real desktop/tablet/mobile behavior and role flows are tested.
- See the external `HRMS_Batch_04_Implementation_Report.md` for the exact environment test commands and their results.

## Verification matrix

See [Batch 04 QA matrix](../ui-qa/BATCH-04-VERIFICATION.md).
