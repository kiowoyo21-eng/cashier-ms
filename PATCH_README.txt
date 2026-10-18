CASHIER SYSTEM – FRONTEND LOCAL DEMO CORE PATCH

BASELINE: cashier-ms-vercel-alias-fix.zip (which adds the @/* tsconfig mapping).
This is a changed-files-only patch. Copy app/page.tsx and lib/backend.ts into the project root, preserving paths.

WHAT THIS PATCH CHANGES
- The root app opens via a local role chooser instead of Supabase email/password.
- POS and Cash/Funds ledger basic create/review/payment/close logic uses browser localStorage.
- There is no server database in those implemented core flows.
- Browser storage is per device/browser, not shared across people or locations.

LIMITATIONS — NOT A FULL FRONTEND-ONLY MIGRATION
- Other screens and components still use Supabase APIs and may be incomplete/non-functional without a backend.
- BOD/EOD, reporting, branch-controlled data, RFP approvals, signatures/camera links,
  vehicles, suppliers, audit logs, user management and notifications are NOT fully converted.
- Demo role chooser is NOT real security and must not be used for real records.
- Existing app/api, lib/supabase.ts and supabase/ SQL remain in the repository but are not used
  by the local core adapter. This patch does NOT remove all Supabase files/imports.
- Build compilation and full browser regression testing have not been completed here.

Do not deploy as a fully completed Cashier System; core-demo migration only.
