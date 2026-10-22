# Phase 3 — Recruitment & Hiring Frontend

## Implemented in this prototype
- [x] Integrated Recruitment workspace into Employee Life Cycle sidebar module
- [x] Applicant table, keyword search, branch and stage filtering
- [x] Hiring pipeline overview and stage progress indicator
- [x] Manual mock applicant entry with duplicate email detection
- [x] Sample requirements checklist with status selections
- [x] HR-editable stage and notes (in-memory only)
- [x] Branch Manager read-only demo restriction
- [x] Google Forms connection placeholder
- [x] Responsive desktop/mobile UI

## Not implemented yet
- [ ] Real Google Forms/Sheets integration and inbound webhook
- [ ] Supabase persistence, authentication, RLS, immutable logs
- [ ] Real file uploads and signing links
- [ ] Automatic 30-day reminders and document validation
- [ ] Applicant-to-Employee 201 backend conversion
- [ ] Interviews calendar, evaluator assignments and approval engine

## Incremental Database Blueprint (planning only)
`applicants` (id, organization_id, intended_branch_id, email, contact, source, source_submission_id, status, timestamps); `recruitment_stage_events` (applicant_id, from_stage, to_stage, changed_by, changed_at); `application_documents` (applicant_id, document_type_id, storage_object_id, verification_status); `interviews` (applicant_id, type, scheduled_at, evaluator_id, outcome); `hiring_checklists` (applicant_id, requirement_id, status, deadline); `applicant_employee_links` (applicant_id, employee_id). These are conceptual only and need approval prior to migrations.

**Do not use real candidate data in this frontend demo.**
