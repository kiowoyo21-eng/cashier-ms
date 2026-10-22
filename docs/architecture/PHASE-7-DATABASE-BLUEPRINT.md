# Phase 7 — Future IR Data Model (Planning Only)

Proposed entities: `incident_cases`, `incident_participants`, `incident_evidence`, `incident_route_history`, `incident_notices`, `incident_responses`, `incident_conferences`, `incident_decisions`, `incident_corrective_actions`, `incident_deliveries`, `incident_followups`, `incident_audit_events`.

Every case links to legal entity, branch, reporter, respondents, confidentiality classification, authorized handler and immutable timestamps. Case routing should be enforced on the server and in RLS—not just through the frontend. Notices and decisions require document versioning, acknowledgments, and checks against applicable procedural due process. HR needs visibility into BM-handled cases but BM-related complaints must remain inaccessible to the reported BM. No SQL has been created yet.
