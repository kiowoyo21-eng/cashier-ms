# Employee 201 — Directory & Profile Display Update

## Updated
- Employee Directory default 10 employees per page; choices **10, 20, 50** (removed 5).
- Accurate displayed record ranges and previous/next page controls; pagination resets when filter or page size changes.
- Expanded directory columns: employee/ID, branch, department and position, gender, status, hire date, salary type, document progress and View 201.
- Branch, department, employment-status and search filters, plus simple sorting.
- Four directory summary cards: employees, regular, probationary and missing-document counts.
- Dedicated profile tabs display full work details: Overview, Personal, Employment, Compensation, Documents, Evaluations, History, and Clearance.
- Personal tab now has view mode and explicit **Edit Details / Save Changes / Cancel**, with new fields for birth date, civil status, residential address and emergency contact.
- The Add Employee form captures the same contact and emergency fields and requires a branch.
- Compensation displays the current individual premium rate profile from the shared payroll state.
- Documents shows verification status and any pending submissions; Clearance shows assigned company equipment.
- Existing HR action workflow remains separate from profile information. BM role still cannot open Employee 201.
- Shared browser-persisted HR state remains compatible with existing sample employee records through optional added fields.

## Constraints
- Frontend-only; browser localStorage is not a secure HR database. Do not enter real employee personal details, salaries or government IDs.
- No production payroll, actual signed document storage, real HR authorization or Vercel build certification.
- Historical/real employee records need a backend integration and privacy review before production use.
- Full Next.js build was not available because dependencies could not be installed in this environment (npm registry DNS error).
