# Payroll Management — Loans & Cash Advances Integration

This patch relocates Loans & Cash Advances inside **Payroll Management** as its own visual workspace card.

## Changed paths
- `components/PayrollOperationsHub.tsx` — seventh card and embedded loan workspace
- `components/PeopleOperationsWorkspace.tsx` — embedded rendering avoids a second notification bell
- `components/ModuleAlerts.tsx` — shows legacy loan alerts under Payroll in the bell and Dashboard
- `app/page.tsx` — removes old standalone loan page; includes loan counts with payroll
- `lib/mock.ts` — removes standalone sidebar navigation while keeping internal loan alert ID for compatibility
- `lib/payrollConfig.ts` — registers `loans` as a Payroll workspace

## Record compatibility
The existing browser-local loans ledger and SOA review functionality continue to use the same `uc-hr-ui-loans` key. No migration/deletion is performed. Existing records are preserved in the same browser.

## Current limitation
The loan ledger is **not** automatically wired into real payroll deductions. Loan repayment amounts must be reviewed with the employee deduction configuration before any sample payslip release; secure approval, file storage, accounting and auditing require backend implementation.

## GitHub instructions
Upload the changed files to the matching folders in your existing repository; no need to delete the old `PeopleOperationsWorkspace.tsx`. Loan records display inside Payroll after this patch.
