# Employee 201 — Compact Profile, Locked Hire Date, Employee Actions, A4/Letter Document Preview

## Delivered (frontend only)

- **Employee Profile / Documents** remains the two-tab structure. Employee Details and Employment Details appear side by side on wide screens, with compact two-column facts and smaller spacing. They stack vertically on smaller screens.
- Salary & Benefits remains full width, retains the existing sample-ledger dynamic Total Salary Received, gross and deductions, released salary history, pay premiums and the year/month/all-time selector.
- Performance Reviews, Employment History and Clearance & Assigned Assets remain in the one-scroll profile. Repetitive copy and bulky data cards have been condensed.
- **Employee Actions** is now a separate section after Clearance & Assigned Assets, separated by space and a divider. The section is visible in authorized HR profile view or edit modes. The actions launch the existing controlled workflows, and direct device/rate actions preserve employee preselection.
- Employee Actions shows Record Assessment, Regularize (only probationary), Promote, Transfer, Adjust Pay Rate, Assign Device, and Process Offboarding (Resignation, Termination, Contract Completion, End of Project, Retirement). Employment actions are unavailable when the employee is at Clearance Pending. Existing Offboard checks still block approval with outstanding assigned assets.
- **Hire Date is not editable in an existing Employee 201 profile**, even with Edit selected. The initial hire date may be set when first registering the employee as part of onboarding/record creation, and the profile then preserves that date when other details are saved. In a future backend, only the hiring/onboarding flow should be authorized to set this field before activation, with permission and audit enforcement.
- The Documents viewer offers **A4 / Letter preview frame selector** with proper page proportions. The preview is still approx 35% of the two-pane file workspace, with next/previous pages and files and full-screen expansion.

## Important frontend limitations

- Preview paper size changes only the UI page frame; it does not convert or resize an existing uploaded PDF or force a printer's paper setting.
- Existing sample document checklist entries have no actual file bytes. Uploaded files remain temporary in the browser session; no secure file storage is connected yet.
- HR actions and their reviews remain browser-local demonstrations without legal approvals, authenticated signatures, or server-side permissions.
- This package has been offline syntax/type/CSS validated. An actual `next build` on Vercel is still required before accepting it as production-build verified.

## Testing after deployment

1. Employee 201 > View: see the compact two-column profile on a desktop and one-column on mobile.
2. Employee 201 > Edit: see Hire Date as a **read-only fact** (lock icon). Change an allowed field, Save, and confirm Hire Date is unchanged.
3. Employee 201 > Add Employee (initial registration): enter Hire Date before record creation, then verify it locks in Edit afterwards.
4. Scroll after Clearance & Assigned Assets: find separate Employee Actions. Test regularization only for a probationary person; check Offboarding Separation Type and approval prerequisites.
5. From Employee Actions, test Assign Device preselection and Payroll rate editing.
6. Documents > choose folder/record: switch A4 / Letter and compare frame proportions. Test Prev/Next Page, Prev/Next File and Enlarge Preview.
7. Check existing Hiring shortlist, payroll tabs, leave details, government compliance workspaces, public /apply and /report routes for regressions.
