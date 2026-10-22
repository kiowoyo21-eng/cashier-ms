# PERMISSION MATRIX — HRMS Frontend Demo

| Feature | Super Admin | HR | Special Final Approver — Ms Kate | BM |
|---|---|---|---|---|
| Normal HR modules | Existing full access | Existing HR access | **Same as HR** | Only existing BM modules |
| Ms Kate final-approval dashboard | Overview | No | **Yes (assigned queue/actions)** | No |
| Accounting-first, maker-checker final approval | No direct final authority | No | **Yes, subject to guards** | No |
| Document / Spreadsheet request to edit | Super Admin grant authority | May request | **May request, same as HR** | No |
| Approve or revoke editor grants | **Yes** | No | **No** | No |
| Approve source document templates | **Yes** | No | **No** | No |
| Release actual disbursement funds | Not implemented | Not implemented | Not implemented | Not implemented |

These are browser-local review behaviors and are not a production authorization policy.
