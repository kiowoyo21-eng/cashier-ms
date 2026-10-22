# UCMM HR: Demo Leave Requests + Official Government Holiday Calendar (13 Oct 2026)

### Modified files
- `components/LeaveManagementWorkspace.tsx` — 12 additional demo leave requests, covering pending, for review, approved, cancelled, and rejected; existing 3 demo records retained. A one-time browser-local migration adds missing new demo records without overwriting old decisions or user-entered leaves. All sample requests link to the current 12 demo Employee 201 records. When Employee 201 gets the planned 35-person replacement, revise leaves accordingly.
- `components/PayrollOperationsHub.tsx` — shows official government holiday references alongside company-entered holidays, with official-source link; references are read-only. Payroll still needs attendance and eligibility verification; dates and baseline percentages do not issue pay.
- `lib/officialHolidays.ts` — source-linked 2026 and 2027 national holidays plus NCR-only 16–18 Nov 2026; excludes undeclared 2027 Eid dates and locality-specific holidays outside known branches.

### Source proclamations
- [2026 Proclamation 1006](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/7/99678)
- [2026 Eid'l Fitr Proclamation 1189](https://pco.gov.ph/news_releases/palace-declares-march-20-regular-holiday-nationwide-for-eidl-fitr/)
- [2026 Eid'l Adha Proclamation 1264](https://pco.gov.ph/news_releases/palace-declares-may-27-as-a-regular-holiday-for-eidl-adha-observance/)
- [NCR 49th ASEAN Summit, Proclamation 1449 & DOLE Advisory 16](https://dole.gov.ph/news/dole-issues-pay-rules-for-ncr-special-non-working-days-during-49th-asean-summit/)
- [2027 Proclamation 1427](https://pco.gov.ph/news_releases/pbbm-declares-2027-regular-and-special-holidays/)

### Known limitations
- These dates are static official references, not an automatic government-sync feed. Later proclamations require a code/reference update or authenticated HR action.
- All data remains browser-local frontend review/demo. Existing stored leaves are preserved by ID, not forcibly reset.
- Government holiday references do NOT establish entitlement or automatically generate pay; inspect rest day, worked/not worked, legal eligibility, overtime and any local declarations.
- NCR-only dates are labeled and only apply to NCR branches; no assumption of coverage for future non-NCR branches.
