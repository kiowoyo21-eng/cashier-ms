# Navigation / grouped workspace modules

Primary source: [`lib/mock.ts`](../../../lib/mock.ts) (module registry and permissions), [`app/page.tsx`](../../../app/page.tsx) (sidebar, nav target and session), [`components/GroupedWorkspace.tsx`](../../../components/GroupedWorkspace.tsx) (internal tabs).

- **Request and Reports**: Forms & Requests (`hr-forms`) plus Incident Reports (`ir`).
- **Reports & Analytics**: reports (`filters`) plus independent Demographics (`demographics`) section.
- **Tools**: actual Drive, Spreadsheet and Documents Library components; standalone routes `/drive`, `/spreadsheets`, `/studio` and `/document-library` are preserved.
- **Recruitment & Hiring** precedes **Employee 201 Files** in the sidebar.
- **Payroll** and **Leave** remain distinct in Batch 01; no speculative consolidation of unlike financial workflows.

Legacy IDs remain in the module registry for action handlers and notifications, but redundant sidebar entries are hidden. Navigation maps a legacy target to the corresponding grouped tab.

Viewer is client-guarded. This does not secure data without server-side authorization.
