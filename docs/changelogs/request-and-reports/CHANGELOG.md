# Request and Reports changelog

## 2026-10-22 — Batch 04 (source implementation, browser QA pending)

- `components/HRFormsRequestsWorkspace.tsx` plus `components/HROperationsExtras.module.css`: added a forms-register-specific style scope, compact left-hand request list and right-hand detail/review pane; responsive stack below tablet threshold. No changes to stored form shape, review guards, status transitions or exports.
- `app/globals.css`: matched incident landing cards to compact uniform action-card treatment while retaining its staged case records and existing report controls.
- Verified at source level that the grouped Request and Reports tabs use existing implementations and current local-storage repositories. No new or live Accounting integration.
