# Leave Management and Incentive Leave Approval

Primary source: [`components/LeaveManagementWorkspace.tsx`](../../../components/LeaveManagementWorkspace.tsx). Display styles: [`app/globals.css`](../../../app/globals.css). Data source: `useLocalRecords("leave")` and `useLocalRecords("leave-credit-requests")` with `useHR()` for SIL/VIL employee allocations.

## Working behavior (frontend prototype)

- Three navigable leave work areas: **Pending Leave Requests**, **Incentive Leave Approval**, **Leave History**; the all-requests filter is also available through metric shortcuts.
- Distinct counts: pending leave applications (`Pending`/`For Review`); approved leave applications; approved **SIL/VIL credit proposals**. Credit approvals are not counted as ordinary approved leave applications.
- Metric cards are compact, clickable **filters** with consistent icons, labels and numeric values. Search, CSV export, status/type/date filters, pagination and View Details retain existing logic. Credit-reference IDs are searchable.
- Approval of leave requires a written reason/confirmation. Existing SIL/VIL availability calculation is preserved and now requires a matching **employee name AND branch**, preventing cross-branch same-name fallback. Approved days deducted from that balance are also scoped to the same branch.
- Credit proposals do not change Employee 201 allocations until approved; future-dated credits cannot be approved early; only pending credits may be decided once.
- Two read-only/detail portal dialogs, entry dialog, Escape/backdrop/close handlers, decision histories and existing audit mechanisms are retained. The empty state distinguishes no records from filtered-out records.
- Branch filter restricts listed requests and eligible credit proposals to the chosen Employee 201 branch.

**Security:** This is browser-local demo state. Role controls and branch filtering are client-side only; real security, approvals, audit integrity, and durable storage require a backend. Seed sample leaves may appear and are not real approvals.

**Validation:** source-level checks were run in Batch 04. End-to-end clicking, responsive screenshots and server-side auth were **not browser verified** in this environment; see [`Batch 04`](../../revisions/batches/BATCH-04.md).
