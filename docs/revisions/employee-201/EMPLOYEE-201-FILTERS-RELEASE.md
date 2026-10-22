# Employee 201 — Filter Correction Checklist

## Implemented in this frontend patch

- [x] Existing Search / Branch / Employment Status / Department / Sort retained
- [x] Quick presets: All, Probationary, Missing Documents, Pending Verification, New Hires (last 90 days)
- [x] Advanced fields: Gender, Position, Salary Type, Hire Date From/To, Document Status, Minimum and Maximum Basic Rate
- [x] Salary range only enabled when a salary basis is chosen; compares like-for-like basic salary amounts
- [x] Guided descriptions and example; advanced filters collapsed by default
- [x] Search and advanced filters applied together, with counts and removable filter chips
- [x] Clear All, useful empty state and date/rate mismatch warnings
- [x] Search and filter changes reset pagination to page 1
- [x] Pagination choices: 10, 20, 50; default 10
- [x] Salary / Type cell retained: amount bold above Daily/Monthly secondary label
- [x] Employee 201 still restricted to HR/Super Admin within frontend UI
- [x] `/report` and `/apply` public pages retained

## Not implemented by this patch

- [ ] Secure backend permissions and records across devices
- [ ] Real payroll processing and government-ready reporting
- [ ] Verified full Next.js/Vercel build until dependencies become available

## Verification suggestions in Vercel

1. Log in as HR. Open Employee 201; check quick search and branch/status/department filters.
2. Expand Advanced Filters; choose Female + Monthly, then inspect matching records.
3. Set Pay Type to Daily and rate min/max; verify matching staff and that page resets.
4. Use Pending Verification preset; clear with its filter chip.
5. Change rows to 20 or 50; then change filter and verify page 1.
6. Open an employee: the Salary / Type cell must have amount on top and type below.
7. Verify BM cannot access 201, but can open Employee Document Submission.
8. Open `/report` and `/apply`; previous public forms must still render.
