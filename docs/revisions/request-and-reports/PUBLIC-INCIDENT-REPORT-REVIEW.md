> Historical reference only. The current public form behavior is in `PUBLIC-FORMS-REVISION-CHECKLIST.md`: `/report` has a Submit Report validation alert instead of a draft download, and `/apply` is the hiring form.

# Public workplace incident reporting — frontend patch

## Available UI
- `/report` public page in the Next.js app; no login needed to view or complete draft fields.
- Entry from HR login page and Incident Reports > Open Public Form / Copy Public Link.
- Branch selection, target classification, issue type, incident date/location, description, and witnesses; **required reporter full name and at least one valid contact method (phone or email)**.
- Responsive single-page form, required field checks, and a personal text draft download; no duplicate review screen.
- Explanatory routing: reports involving a Branch Manager -> HR only (exclude BM); reports involving other employees -> assigned branch BM as primary handler and HR copied; unclear identity -> HR first for safe screening.

## Critical limitation: NOT a live reporting system
This is a frontend review prototype. No report is transmitted or saved to a server or shared inbox. No case number, recipient notification or evidence upload is created. Public forms must never claim success or confidentiality without the backend enforcing those guarantees. Review the form using invented scenarios only. Refreshing or navigating away clears the entries.

## Required secure backend work before launch
1. Public server-side submission endpoint with schema validation, length limits, rate limits, abuse protection, fraud/spam defense and a privacy notice.
2. Secure database and encrypted private storage with record-level permissions. Do not store confidential case content in public localStorage, query strings or analytics.
3. Routing calculated SERVER-SIDE using the relevant branch and reported-person role. The client-submitted target classification is a hint, not authoritative. If an allegation involves the recipient BM, or is uncertain, HR must screen it privately. Prevent any implicated BM from receiving emails, accessing cases, audit content, notifications or file attachments.
4. Branch-specific BM user mapping and correct HR recipient directory maintained by HR, with staff changes reflected. HR CC is an actual authorized access/notification, not simply a UI label.
5. Audit trail of access, changes, attachments, screening, escalation, decisions and delivery; confidential event metadata should itself be protected.
6. Review and escalation protocol for emergencies and serious allegations. Allow reporter to request HR-only escalation if BM handling is inappropriate, even if the named respondent is not a BM.
7. Acknowledgment/reference only AFTER verified server receipt. Avoid promising anonymity since narrative details and technical access logs can identify someone.
8. File uploads: virus scanning, limited MIME/size, access control, metadata hygiene and private attachment lifecycle.
9. Retention, information notices, applicable Data Privacy Act requirements, documented HR/legal review and notifications only via trusted services.
10. E2E tests with separate browsers/accounts: BM allegation invisible to BM at URL/API/notification level; normal case visible to assigned BM and authorized HR; unrelated BM cannot view either; unknown respondent routed to HR.
11. Underchargers corporate domain: configure the route where intended (e.g. a mapped HR subdomain or the main site proxy). `/report` currently means the same domain as this PWA.

## Manual frontend review
- Open `/report` in an incognito window; no sign-in is requested.
- Pick each target option and check exact routing copy.
- Confirm branch, role, category, narrative (30+ characters), full name, and at least one valid contact method.
- Check name is required, no anonymous option remains, and mobile layout works.
- Download a draft; it must explicitly state NOT SUBMITTED.
- Open HR workspace > Incident Reports and use both Open Public Form and Copy Public Link.
- Do NOT test with personal/sensitive employee records.

## Earlier modules
All previous source modules are preserved. Public cases are intentionally **not** injected into the internal case list or local review store; that could leak allegations across users on a shared browser and would falsely imply server delivery.
