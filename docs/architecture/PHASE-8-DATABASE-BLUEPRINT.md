# Phase 8 Incremental Database Blueprint (Planning Only)

No database migrations are applied.

Proposed entities: `compliance_agencies`, `compliance_requirement_templates`, `compliance_applicability_rules`, `compliance_schedules`, `compliance_instances`, `compliance_assignments`, `compliance_approvals`, `compliance_evidence`, `compliance_notifications`, `compliance_calendar_versions`, `compliance_history`.

Fields to consider: legal employer ID, shop/branch ID, task owner, frequency, official-source URL, due-date method, compliance calendar year, jurisdiction, applicability flag, effective dates, document references, approver, approval timestamp, notification levels, agency acknowledgment number, remittance reference, verification timestamp.

Constraints: no approval by an unauthorized role, no status of `Verified` without required evidence when applicable, revision history for deadline amendments, immutable submission evidence, event-idempotency for recurring task generation, historical schedule versioning. Company-specific applicability must be approved before scheduling reminders. Audit events are classified by agency, module and record; searchable by actor, date, branch, and action.

Important distinction: compliance dates shown in frontend are examples, not official filing deadlines. Confirm actual legal entities and current regulatory obligations before production release.
