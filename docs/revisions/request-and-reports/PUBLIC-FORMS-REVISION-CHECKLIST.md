# Public Incident Report & Hiring Application — Frontend Patch

## Completed

- [x] Preserve existing HR modules, navigation, and frontend review records.
- [x] Public incident report remains at `/report` without sign-in.
- [x] Replace **Download Draft** with **Submit Report**.
- [x] Keep required incident information, reporter full name, and valid phone/email checks.
- [x] On valid Incident Report submission, show a native browser alert **explicitly stating the report was NOT submitted**.
- [x] Retain intended privacy routing: BM complaint → HR only; other staff → BM with HR CC; unclear → HR screening.
- [x] Add public hiring page `/apply` without sign-in.
- [x] Include applicant name, email, phone, desired role, branch, and optional short introduction/experience.
- [x] Require a Resume/CV file selection in **PDF, DOC, or DOCX** format, non-empty and at most 10 MB.
- [x] Display selected CV filename/size and clear invalid selections.
- [x] On valid hiring form submission, show a native browser alert **explicitly stating the application/CV were NOT uploaded or sent**.
- [x] Add public application link to login page and Recruitment & Hiring workspace.
- [x] Keep existing site theme and responsive single-page form layout.
- [x] Source syntax / local import checks and ZIP integrity checks (see release notes).

## Backend work required before accepting actual reports or applications

- [ ] Secure upload storage for applicant CV/resume, file type/size validation **on the server**, antivirus/malware scanning, access restrictions and retention.
- [ ] Actual incident report submission, unique case reference/receipt and safe handling of confidential reports.
- [ ] Server-side BM/HR routing based on authorized case/branch directory, with appropriate confidentiality and HR-only exception handling.
- [ ] Authentication and access control for internal recruiters/HR; public form abuse protection (rate limiting / spam defense).
- [ ] Applicant receipt, recruitment pipeline integration, deduplication and data privacy notices/consent as applicable.
- [ ] Real delivery receipts, secure file handling, audit logs and error handling.
- [ ] Full npm/Next.js production build plus manual desktop/mobile form testing on deployed website.

**Security note:** Both public forms currently remain frontend prototypes. The user must never mistake a browser alert for a sent report, received application, or uploaded CV. Do not collect real confidential personal data on the preview site.
