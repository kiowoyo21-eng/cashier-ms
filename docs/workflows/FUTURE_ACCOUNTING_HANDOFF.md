# Future shared-database Accounting handoff contract — NOT IMPLEMENTED

- **Source:** HRMS employee lifecycle + HR Payroll final-pay preparation. HRMS owns the preparation record and version; Accounting owns financial validation and disbursement decision.
- **Proposed payload:** immutable preparation revision ID; employee and branch IDs; offboarding case ID; last working date; monetary line items with currency; supporting document IDs and verification status; prior payroll releases and loans reconciliation references; checker user/time; source hash; originating system `HRMS`.
- **Routing:** a submitted HRMS-originated disbursement request is reviewed by Accounting (first approval), then by Ms Kate in HRMS **only if this request type is configured to require final approval**. No funds released on Accounting approval alone for the configured final-approval path.
- **Decision state:** Accounting and Ms Kate statuses are separate, versioned and server-enforced; return or material amendment invalidates prior approvals and requires appropriate resubmission.
- **Server controls:** real identity provider, RBAC/branch RLS, maker-checker, database transactions/idempotency and optimistic concurrency, content-addressed attachments, auditable Philippine timestamps, minimal PII.
- **DO NOT:** create an HRMS master copy of CMS-originated requests, assume live integrations exist, post payments from this frontend demo, or connect to ERP.
