# Tools

Grouped navigation in [`GroupedWorkspace.tsx`](../../../components/GroupedWorkspace.tsx) preserves existing live components: DriveWorkspace, SpreadsheetPageClient, and StudioIndex (Document Studio). Their historical standalone routes are unchanged.

Existing local records are **not migrated, reset, or deleted** by the navigation refactor. Role checks in the individual apps are retained; Ms Kate's special HR role is accepted by StudioGate.

Known prototype limitations: file editing approvals and storage use browser-local/session mechanisms, not production secured shared storage.


**Batch 04:** See [`Tools changelog`](../../changelogs/tools/CHANGELOG.md). Direct browser interactions and data persistence beyond source inspection still require QA.
