# Demographics / Compensation / HR Forms — Data Dictionary and Future Integration

## Classification axes
**Job level** is distinct from **employment arrangement** and **employment lifecycle status**:
- Level: Rank-and-File; Supervisory; Managerial; Not recorded.
- Arrangement: Regular; Probationary (when explicitly assigned); Contractual; Project-Based; Seasonal; Casual; Fixed-Term; Other; Not recorded.
- Lifecycle status: existing HRMS `person.status` field; unchanged. Not every probationary employee is a contractual employee.

Both optional classification properties live inside the existing Employee 201 person record. Existing employees are not destructively migrated. Missing level is displayed as Not recorded rather than guessed from job title.

## Demographics for statutory filing preparation
- Current: branch, department, status, job level, employment arrangement, age band, tenure band, recorded Male/Female/Unspecified grouping, aggregate salaries and data completeness.
- Future verified source requirements: region/workplace-specific wage-order coverage and exceptions; effective dates; hours/days worked; gross/actual cash compensation; verified statutory contributions; disability or other protected-category reports only where specifically legally required and appropriately consented/authorized, with data minimization and privacy restrictions; historical snapshots and cutoff locking; reviewer signature/approval.
- Do not infer sensitive demographics from names or job titles; never fabricate missing sex/gender information or date-of-birth.
- `annualized` here means recorded basic monthly-equivalent rate multiplied by 12; it is not actual calendar-year gross payroll, nor an approved 13th-month or tax computation.
- A manually chosen minimum-wage reference only labels at/above/below that numerical daily amount; jurisdiction, coverage, exemptions, legality, and effective applicability need manual HR/legal verification.

## HR Forms
Request records: `id, kind, branch, employeeId, requestor, createdAt, updatedAt, fields, evidenceRefs, status, reviewer, remarks, history`.
Statuses: Draft → Submitted → Approved (Documentation Only) / Rejected / Returned for Revision; Returned may be edited and resubmitted. Role/branch and separate-reviewer constraints are applied in browser demo logic.

Actual supported templates: overtime authorization, internal work authorization, leave documentation, workplace dispute/grievance, employee document request, attendance correction, schedule change, incident statement, asset clearance, COE request, policy acknowledgment, Notice to Explain response, return-to-work clearance, official business/field assignment, separation/clearance request.

## Future shared database integration
- HRMS owns employee master data, classifications, approved document templates, and HR-form request/review UX.
- A real backend needs authentication, role-based row security, audit immutability, document storage/retention, signer identity, maker-checker enforcement, revision tracking, privacy access and deterministic status transitions.
- Integrate official Leave, Attendance, Payroll, Assets and Employee Lifecycle workflows only via explicit server-validated actions, never because a generic document was marked Reviewed.
- Accounting owns financial verification/release; Ms Kate's configured second-level final approval stays separate from ordinary HR document review. CMS owns its originated disbursement requests; no HRMS shadow master.
- ERP remains entirely standalone with zero connections.
