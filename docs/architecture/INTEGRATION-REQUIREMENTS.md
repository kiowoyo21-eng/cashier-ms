# Future Three-System Integration Contract (NOT ACTIVE)

## Ownership and boundaries
- **CMS** owns PB/Cashier-originated disbursement creation and editable request master records (source ID, revision, maker, branch, category, amount, supporting document refs). HRMS must not create a second CMS request master.
- **Accounting** owns first-level review, maker-checker validation, financial verification, bank/disbursement processing, and reconciliation. A valid Accounting approval must refer to an *exact* version/fingerprint of the source request.
- **HRMS** owns Ms Kate role/assignment, the final-approval interface, and append-only final decisions pointing back to source request IDs and revision. Some HRMS request categories may opt into her final approval by policy; do not apply to all HRMS transactions.
- **Release** must be gated by current Accounting approval **and** current final approval **and** source revision equality. HRMS never directly releases funds merely because a local badge says `Approved for Release`.
- **ERP stays completely standalone**; no integration, API, sync, import, database dependency, or status update to/from ERP.

## Proposed minimal shared schema (conceptual; do not deploy as-is)
1. `cms.disbursement_requests`: CMS-owned master, primary key `request_id`, immutable `source_revision`/`material_fingerprint`, requestor identity, branch, amount/currency, documents and timestamps.
2. `accounting.request_reviews`: `request_id`, `source`, `source_revision`, `material_fingerprint`, reviewer principal, decision/remarks, server-approved timestamp. Reject/return must block Kate queue.
3. `hrms.final_approval_policies`: request category/branch/originator scope, assigned approver principal(s), `requires_final_approval`; explicitly opt-in other HRMS request types.
4. `hrms.final_approval_decisions`: append-only `decision_id`, `request_id`, `source`, `source_revision`, `material_fingerprint`, `accounting_review_id`, assigned approver/principal, status, remarks, server timestamp, correlation ID; unique effective decision for each request/revision.
5. `accounting.disbursement_releases`: actual release records with transactionally verified current Accounting review, current final-approval decision, unchanged source revision and separation of duties.
6. `audit.events`: immutable event journal with actor identity, before/after, approvals, Philippine timezone display, UTC storage, secure retention, origin and correlation IDs.

## Required server-side workflow
1. CMS PB/Cashier submits source request → Accounting sees submitted request, verifies, approves/rejects/returns with a signed-off revision reference.
2. After Accounting approval, shared database/authorized event makes a **read-only reference** available to Ms Kate's HRMS queue; no divergent local master copy.
3. Ms Kate accesses authorized details and documents via short-lived signed URLs, records approve/reject/return with server-side policy, idempotency, role/assignment checks, maker-checker restrictions and transactional optimistic concurrency.
4. Rejection/return routes the request to its originating owner via shared status/events. Any material change increments revision, invalidates stale Accounting AND Kate decisions, and requires configured reapproval.
5. Accounting release checks all active approvals again **atomically** before the disbursement and reconciliation. Never treat client/HRMS cached status as authorization.

## Production requirements
- Authentication via a real identity provider; server-side role/permission policy, row-level security for branch and documents, no demo credentials in production; optional MFA for final approvers.
- DB constraints, transactional idempotency/unique effective approvals, nonrepudiation, signature/retention policy, auditable immutable append-only timeline, backup and access review.
- Shared storage service/authorized document previews; never trust document names or URL supplied by a browser as proof of evidence.
- Durable notifications and audit outbox for status changes and returns, recipient targeting and reapprovals.
- Cross-app integration contract/versioning tests with CMS and future Accounting before activation.

## Current demo assumptions
No live database, CMS connection, Accounting review API, ERP link, real file content, release action, or synchronized status is present. `lib/finalApproval.ts` demo fixtures exercise pure approval guards; `canAuthorizeDisbursementRelease` is a predicate only, not a payment command.
