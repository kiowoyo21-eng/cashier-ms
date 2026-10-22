# Phase 5 — Incremental Payroll Database Blueprint (Design Only)

No Supabase tables or SQL migrations are created by this phase.

## Candidate entities
- `payroll_periods`: organization_id, branch_scope, start_on, end_on, status, approved_by, approved_at.
- `employee_compensation_rates`: employee_id, salary_type (`DAILY` / `MONTHLY`), base_rate, valid_from, valid_to, approval_id.
- `rate_profiles`: organization_id, branch_id (nullable), department_id (nullable), category, multiplier, valid_from, valid_to.
- `employee_rate_overrides`: employee_id, profile_category, multiplier, valid_from, valid_to, approval_id.
- `work_schedules`: employee_id, effective dates, workdays, restdays, assigned shift.
- `attendance_imports`: source, filename, checksum, uploader, mappings, status, period_id.
- `attendance_entries`: employee_id, date, punch times, source/import_id, verification_status, adjustment_history.
- `holiday_rules` and `holiday_dates`: classification, region/branch scope, premium profiles, applicable dates.
- `payroll_runs` and `payroll_lines`: computed earning/deduction components, snapshot of inputs and rule versions.
- `statutory_rate_tables` and `statutory_rate_brackets`: agency, effective dates, imported version, approval metadata.
- `deduction_schedules`: employee_id, type, amount, recurrence, effective start, loan/cash advance reference.
- `payroll_approvals`: run, decision, reason, approver, timestamp.
- `payment_disbursements`: run/employee, amount, channel, reference, release status.
- `payslips`: run/employee, PDF document id, signature request id, issued date.
- `payroll_audit_events`: logical view over immutable central audit events, filtered by module and period.

## Must confirm before SQL
1. Distribution of fixed monthly salaries across weekly payouts (4- vs 5-cutoff months).
2. Treatment of absences, holiday/rest-day premiums, and monthly-paid equivalent rates.
3. Statutory table sources, employee exemptions, employer share, deduction and remittance schedule.
4. Salary profiles by legal employer, branch, role/group, and individual override.
5. Payroll approval chain, disbursement methods, correction policy, negative-pay handling.
6. Official timekeeping CSV/XLSX format, employee matching rules, and calendar conventions.
7. 13th month policy within statutory obligations, paid leave rules, bonus classifications.

## Safety
Money must be handled as integer centavos or decimal values, never binary floating point for real runs. Finalized runs are immutable; corrections create versioned adjustment runs. Enforce approval and employee/branch access at the database and server layers.
