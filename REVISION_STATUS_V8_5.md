# v8.5 — Admin Bulk Scan + Empty Inventory

- Official label: **Bulk Scan** (not shotgun mode).
- Admin → Inventory → Bulk Scan. Scan continuously with USB/Bluetooth scanner (keyboard + Enter), manual barcode entry, or compatible mobile camera.
- Duplicate barcode scans within one batch create no new row **and do not increase quantity**. Already registered barcodes in the branch are skipped with a message.
- Review the queue of distinct barcodes; enter product name, category, unit, unit cost, selling price, initial stock quantity, and low-stock alert per unique product; **Register All** creates the whole batch at once.
- Bulk registration is Admin-only and atomic; invalid entries or duplicated barcodes reject the batch instead of partially saving.
- Branch selection is explicit; changing the branch clears the unsaved queue to prevent accidental assignment.
- New installations start with zero products. Untouched old generated sample inventory products are removed from local saved data; used demo product history is preserved by archiving referenced items. Existing Admin-created inventory and posted Stock Out history are preserved.
- Cashier and PB cannot register product masters. Stock In and POS Stock Out remain separate flows with existing role permissions and locked-out accounting rules.
- Camera scanning depends on browser BarcodeDetector support; hardware scanning needs a scanner presenting as a keyboard and submitting Enter. Full production build and device testing remain to be completed on Vercel.
- Supabase not connected; same browser-local storage key as previous versions.
