> Historical reference only. The current public form behavior is in `PUBLIC-FORMS-REVISION-CHECKLIST.md`: `/report` has a Submit Report validation alert instead of a draft download, and `/apply` is the hiring form.

# Public Incident Reporting Patch — Completion Checklist

## Completed in the frontend
- [x] Public `/report` route usable without entering the demo login.
- [x] Workplace concern form with mobile-friendly field groups.
- [x] Branch selection for UC Mandaluyong, UC Las Piñas, UC Quezon City and MM Mandaluyong.
- [x] Routing preview: BM-related -> HR ONLY, non-BM -> branch BM with HR copied; uncertain -> HR screening.
- [x] Incident category, optional reported person/date/location/witnesses, narrative, required reporter full name and at least one phone/email.
- [x] Required fields, contact format and narrative-length validation in a one-page form; no duplicated review screen.
- [x] No-account link in HR login screen and Open/Copy Public Link actions inside Incident Reports.
- [x] Optional personal draft download clearly marked NOT SUBMITTED.
- [x] Responsive layout, descriptive guidance, no misleading success confirmation.
- [x] Shared routing presentation helper (with warning that server must enforce policy).
- [x] Privacy/security and manual testing documentation.

## Intentionally NOT implemented until secure backend approval
- [ ] Receive reports centrally from users on different devices; persistent case ID.
- [ ] Send actual notifications to HR and branch-specific BM recipients.
- [ ] Restrict confidential BM-related cases with server-side authorization and secure storage.
- [ ] File/evidence upload and secure signing.
- [ ] Submission acknowledgment/tracking, anti-spam/rate limiting, audit trail.
- [ ] Live integration of public cases with HR Incident Reports dashboard.
- [ ] Deploy route on the company's desired domain and verify end-to-end.
- [ ] Full `next build` with real React/Next dependency packages in CI/Vercel.

## Privacy caution
No actual report is transmitted, and the draft is never written to browser storage. Do not ask employees to use this form for real incidents yet. Client-side routing is information only and must never substitute for server-side access controls.
