# Frontend v5 — Revision Status

## Implemented in source

- Friday Sales Turnover only; removed separate Funds Turnover from user controls and report templates; kept historic data.
- Cashier automatic BOD navigation at/after 08:30 Manila time when today's BOD is absent; mandatory report lock takes precedence; 09:00 incident creation retained.
- Physical denominations-only BOD/EOD entry, auto-summed; no expected/duplicate amount entry during count; signature and post-submission discrepancy handling retained.
- POS and PB RFP parts forms use vehicle autocomplete with a single Brand & Model selector plus Year, with local reference catalogue. PB parts records store Car even before POS is linked, and can auto-populate Car from a matching POS visit.
- PB/Admin Monthly Parts Expenses tab, monthly default, date range option, table pagination, CSV and print; Car and Branch positioned after Plate Number.
- PB replenishment printable report: purchases since last approved disbursement *submission*, not its later decision time. Summaries/signatures share the final sheet where possible.
- Existing local demo data key, roles and responsive styles retained. Supabase not connected.

## Verified

- `npm run test:logic` passed including v5 revisions smoke tests (calculation, prior-disbursement cutoff, local catalogue, month ranges, print HTML, UI source assertions).
- Source TS/TSX transpile syntax checks passed for changed files.

## Not verified / limitations

- Full Next.js production build, interactive browser scenarios and mobile screenshots (npm registry unavailable in execution environment).
- Actual Chrome-generated PDF page-count verification for v5 templates (headless process timed out). Report CSS/HTML and page splitting still require browser print inspection.
- IndexedDB migration, secure authentication, multi-device sync, official complete car reference database and Supabase backend remain for future phases.
- Browser-local prototype, not suitable for real fund processing or multi-device reconciliation.
