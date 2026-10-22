# Request and Reports

Sources: [`components/GroupedWorkspace.tsx`](../../../components/GroupedWorkspace.tsx), [`components/HRFormsRequestsWorkspace.tsx`](../../../components/HRFormsRequestsWorkspace.tsx), [`components/IncidentWorkspace.tsx`](../../../components/IncidentWorkspace.tsx), [`lib/hrForms.ts`](../../../lib/hrForms.ts), [`lib/incidentRecords.ts`](../../../lib/incidentRecords.ts).

The **Request and Reports** sidebar entry has two separate functional tabs: **HR Forms & Requests** and **Incident Reports**. Historical module IDs `hr-forms` and `ir` map into these tabs instead of losing existing notifications/deep links.

- **HR forms**: draft, submit, edit, reviewer approve/return/reject documentation, status and search filters, unsigned `.txt` export, saved review history and existing browser audit events. New compact, controlled-width two-column register: request list on the left, selected details on the right at desktop widths; panels reposition on narrow screens.
- **Incidents**: active and archived registers, routed HR/BM cases, stages, investigation notes, evidence metadata, temporary file previews, case histories and print summaries. Existing documents and recorded attachments are preserved, including their stated limitation that attachment bytes may be session-only.
- Cards/icons, table/search controls and modal positioning follow the Batch 04 consistent compact layout CSS without rebuilding business workflows.
- Ms Kate's normal HR role access remains. Cross-system CMS / Accounting routing is still **planned**, not live.

Do not submit real sensitive complaints to local browser demo storage. Full browser QA of approval and document interactions remains unverified.
