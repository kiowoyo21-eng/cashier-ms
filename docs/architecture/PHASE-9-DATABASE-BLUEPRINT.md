# Phase 9 Incremental Database Blueprint — not implemented

- report_definitions: id, legal_entity_id, owner_user_id, name, module, columns, visibility, created_at, updated_at
- report_filters: id, report_id, field, operator, value, boolean_join, sort_order
- report_runs: id, report_definition_id, actor_id, requested_at, status, source_snapshot_reference, generated_file_id
- documents: id, employee_id, document_type_id, title, signature_status, version, storage_path, created_at
- document_types: id, display_name, canonical_name, organization_id, active
- payroll_periods, payroll_lines, compensation_components and employee history: existing planned entities supplying report views
- audit_events: subject, actor, action, legal_entity, branch, timestamp, reason, source

Design constraints: server-enforced row-level security; no employer/branch data leaks via counts, exports or saved presets; historical as-of views; masking sensitive salary, medical and IR data; exports require permissions and audit logging; avoid raw arbitrary SQL from user-configured filters.
