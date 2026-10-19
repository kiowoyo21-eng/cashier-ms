# Underchargers Fund Management System — Frontend PWA v9.2

Next.js / React / TypeScript responsive PWA for Admin, Cashier, and Parts Buyer. This is a **browser-local frontend prototype**. No Supabase connection, trusted server, multi-device synchronization, or tamper-resistant access control exists yet.

## Controlled inventory workflow (v9.2 UI)

### 1. Product setup (Admin)

1. Go to **Inventory → Add Product** or **Bulk Scan**. Register barcode, name, branch, category, unit, tracking type, and reorder threshold.
2. New products begin with **zero available stock**. **Cost Configuration** sets unit COGS without manufacturing any physical quantity for new products.
3. Subsequent physical stock must enter the separate receiving workflow below. Existing historical v9.1 pending-initial records are retained for migration; see caveats.

### 2. Inbound delivery: Cashier / Admin submits, separate Admin verifies

1. Open **Inventory → Add Stock · Single/Bulk Scan** or a product's **Add Stock** button.
2. Scan the registered product barcode; set actual units (duplicate scans do **not** silently increase quantities). For serialized items, enter each unique unit code.
3. Enter a delivery/supplier reference; upload delivery photo or PDF (max 1.5 MB), and optionally add condition/notes.
4. Submit: the receipt becomes **Pending**. Available stock **does not change**, including if Admin prepared the receipt.
5. A **different Admin** visits **Approvals & Exceptions → Stock In — Physical Verification Queue** and selects **Open Independent Count**.
6. Independently rescan each product barcode, enter physical quantities and serialized unit codes as applicable, review evidence, check acknowledgment, and write verification findings.
7. If actual quantity differs, **Reject** and create a corrected new receipt. Original and rejection remain in history; no rewriting or quietly editing posted quantities.
8. Only a matching, independently verified approval creates branch-specific Stock In movements.

### 3. Outbound stock: POS-linked request and Admin authorization

1. Create an **existing, open POS Draft** with a real customer and vehicle plate before requesting inventory. The scanner no longer silently creates a dummy POS for a release.
2. Cashier opens **Request Stock Release** (from POS or Inventory), scans product(s), specifies physical quantities/unit codes, and explains the customer job/reason (required).
3. The request remains **Pending**. It **reserves** quantities against other requests but **does not deduct stock**; items **must not physically leave** while Pending.
4. Admin checks **Approvals → Stock Release Requests**, confirms physical items and the POS/job, rescans product barcodes and serial numbers if applicable, enters count and findings, then **Authorize & Deduct** or **Reject**.
5. Approval atomically deducts Stock Out from branch ledger with a POS link, request ID, reviewer identity, and notes. A rejected request leaves stock unchanged. POS cannot be closed with a pending release.
6. Return of a previously posted Stock Out continues via a separate request and Admin physical check. Original Stock Out remains in movement history.

Inventory now displays **Available / Pending In / Pending Out** separately, and POS shows its pending/approved/rejected issue requests.

### Why physical controls still matter

The frontend demo **cannot prevent someone from altering browser localStorage, using a shared Admin login, forging uploads, editing timestamps, bypassing role checks through code, or physically removing an item without scanning**. Also, legacy API helpers and old pending-initial records are retained to preserve existing demo integrations; do not regard them as production-secure inventory posting pathways.

Before live deployment, move the final transition/approval logic into an authenticated backend with a database transaction, row-level permissions, immutable append-only audit logs, protected uploads, and independent stocktake/variance reconciliation. Require unique individual accounts, not shared Admin passwords. A physical cycle-count program, stockroom handoff controls, and periodic discrepancy reviews are essential to detect concealed shrinkage.

## Start locally

```sh
npm install
npm run dev
npm run test:logic
npm run build
```

Open http://localhost:3000. Default demo users: `admin/admin12345`, `cashier/cashier12345`, `pbacc/pb12345`. These credentials are for **demo only**.

### Validation for this bundle

- Existing and new **logic smoke tests** passed, including v9.2 controlled inventory tests.
- `lib/data.ts` passed standalone TypeScript type checking; changed TSX files passed TypeScript parsing/transpilation.
- Full Next.js build and actual camera/barcode hardware testing **were not performed**: npm dependencies could not be installed in this environment.
- To carry over old local demo data, use the same browser and domain and **do not clear localStorage**. Export a backup using Settings before upgrading.

## Spreadsheets & Documents (v9.4)

Choose **Spreadsheets** or **Documents** directly from the main sidebar, or use the separate shortcuts on **Reports & Exports**. Each is a standalone workspace with its own file list and create action. Create editable spreadsheet reports or formatted documents, optionally starting from a filtered transaction report snapshot. Staff can submit finished reports for Admin review; submitted and approved copies are locked. Spreadsheet formulas and CSV export, document formatting and Word-compatible .doc export, and print/PDF preview are supported. A spreadsheet can also be converted directly into the Documents workspace.

Use the **trash icon** beside an individual saved file or **Delete File** in its editor to remove files you own in **Draft** or **Changes Requested** status. Deletion always requests confirmation. Submitted/approved files cannot be deleted in this frontend workflow to preserve the review trail.

**Demo limitations:** Files are stored only in this browser (`uc_report_studio_v1`) and do not sync across machines. Report drafts do not affect source ledger records. Spreadsheet CSV export and Word-compatible `.doc` export are provided; native `.xlsx`/`.docx` and secure backend approvals are not implemented. See `REVISION_STATUS_V9_4.md` for the separate workspaces and deletion policy.
