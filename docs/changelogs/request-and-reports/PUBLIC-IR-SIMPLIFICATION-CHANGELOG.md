> Historical reference only. The current public form behavior is in `PUBLIC-FORMS-REVISION-CHECKLIST.md`: `/report` has a Submit Report validation alert instead of a draft download, and `/apply` is the hiring form.

# Public Incident Report — Simplicity and Required Identity Patch

## Completed
- [x] Single-page public `/report` form. No duplicate review-answer screen or step tracker.
- [x] Full name is mandatory (minimum two characters after trimming); no anonymous submission path.
- [x] Phone and email are separate inputs, with **at least one required** and both validated if supplied.
- [x] Mandatory branch, respondent role, incident category, and incident description.
- [x] Optional reported person's name, incident date, location, and witnesses.
- [x] Removed duplicate “short subject,” contact preference, urgency, follow-up request, repeated routing paragraphs, and full-page answer duplication.
- [x] Short, conditional routing notice uses existing `getIncidentRouting`: BM -> HR only; other staff -> BM with HR copied; unsure -> HR screening.
- [x] Still available without login at `/report`; existing HR portal and Incident Reports public links remain.
- [x] A local plain-text report **draft** is downloadable after validation, explicitly marked NOT SUBMITTED.
- [x] No secrets, fake confirmation numbers, emails, notifications, or persistent storage.
- [x] Responsive form UI and form-control focus treatment.

## Deferred until authorized secure backend development
- [ ] Actual secure submission and case reference number.
- [ ] Confidential server-side routing and role authorization; excluded BM must never receive access to reports about them.
- [ ] Private and validated attachment storage, malware scanning, size limits, evidence access controls.
- [ ] Rate limiting, abuse/spam controls, CAPTCHA as appropriate, and audited submissions.
- [ ] Data retention, privacy notice/consent, transport security and reporter identity verification strategy.
- [ ] Case receipt, tracking, notifications and integration with the HR case management module.

## Manual QA / security checks
1. From an incognito session, `/report` loads without login.
2. Missing full name blocks draft download.
3. Both phone and email blank blocks download; malformed provided value blocks download.
4. Select Branch Manager: routing says HR only, BM excluded.
5. Select Other Staff: routing says BM handles and HR is copied.
6. Select Not sure: routing says HR screens first.
7. Missing branch/category/role or narrative under 30 characters blocks download.
8. A complete form downloads a UTF-8 text file explicitly labeled NOT SUBMITTED; no network request should be made.
9. Check mobile widths and keyboard navigation.

**Caution:** This is a UI prototype. Do not use it to collect real confidential employee reports. A name and contact field does not itself verify identity.
