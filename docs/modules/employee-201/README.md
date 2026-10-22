# Employee 201 — working UI and data (Batch 03)

Current source: `components/EmployeeWorkspace.tsx`, `components/workspace/EmployeeFullRecord.tsx`, `lib/hrState.tsx`, `app/globals.css`.

## Employee Full View

One **Employee Information** parent houses exactly four independently clickable compact cards in desktop 2×2 reading order:
Personal Information, Emergency Contact, Employment & Assignment, Government & Statutory. On narrow screens they stack. Compensations & Premium Rates and separate Performance/History/Assets sections remain outside this information group, preserving prior actions and records.

Card headers and bodies open corresponding existing portal-based detail dialogs; Escape, close button and backdrop can dismiss them. Editing mode retains current field editing in the four cards and uses the existing Save Profile Changes action. Current complete field values are shown in dialogs; summaries are intentionally abbreviated to reduce whitespace.

### Histories

- Employment & Assignment reuses persisted `person.assignmentHistory` records, with effective dates and memo links. Current assignment remains separately visible when no historical records exist. Earlier browser records with no history show an explicit empty state, rather than invented transitions.
- Personal, Emergency, and Government detail dialogs surface **actual matching employee update events** from the existing browser-local audit trail, including actor, time and changed **field names only**. When none exist, a truthful "No field-change history recorded" message appears. No before/after values are fabricated and older edits may be absent.
- Existing overview/history, documents, assessments, payroll and employee lifecycle actions remain unchanged.

### Confidentiality

SSS, PhilHealth, Pag-IBIG and TIN are masked in **read-only summary/detail views**. Authorized HR profile editing retains existing browser-stored values so it can save without data loss; this browser-only demo is not production-secure. Real identifiers require server authorization and encryption before launch. Do not enter real government identifiers into the demo.

Browser/history regression testing remains necessary before calling this fully verified.
