# Notification coverage and scope

## Existing action sources shown in the new global center

| Module | Pending-action examples | Population timing |
|---|---|---|
| Employee 201 | Submitted documents awaiting verification | HR workspace state on login |
| Payroll | Attendance cutoff reminders, payroll reviews, salary rate changes, acknowledgment references and loan review when available | Cutoff monitor runs globally; payroll-specific items may populate after opening Payroll |
| Assets | Pending turnover, return and inspection | HR workspace state on login |
| Employee Documents | Submissions awaiting HR review | HR workspace state on login |
| Recruitment | Applications, upcoming interviews, screening and onboarding | When Recruitment has been opened |
| Leave | Leave requests and incentive credit approvals | When Leave has been opened |
| Incident Reports | Authorized unresolved case alerts | When Incident Reports has been opened; incident privacy rules still apply |
| Government Compliance | Recorded upcoming/overdue review tasks | When Compliance has been opened; sample deadlines are not officially verified |

## Modules without an action publisher yet
Dashboard, Submit Employee Documents, Reports & Analytics, HRMS Drive, Spreadsheets, Document Library, Audit Logs, and Settings do not automatically create new pending-action alerts solely because their page is visited. The bell still appears on these screens and the **All Modules** tab shows known actions elsewhere. This patch deliberately does not manufacture task alerts.

## Important limits
- Pending-action indicators **are not delivered notifications**. No SMS, email, push, desktop alerts, or read/unread sync exists.
- Alert state lives only inside the current browser session; the underlying demo records are browser-local. Separate devices will not synchronize.
- Some alert sources initialize only after the corresponding module is opened; therefore an empty center does **not** certify that no real task exists.
- The UI role and branch filters are **not a production access-control boundary**. Secure backend authorization is necessary for real employee data.
- Clicking an item in the topbar center opens its module; the existing in-module notification control may provide more precise record navigation.
