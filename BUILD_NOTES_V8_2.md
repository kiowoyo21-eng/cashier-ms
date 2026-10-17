# Underchargers CMS PWA v8.2 — visible barcode scanner controls

- **Inventory screen**: `Scan with Camera` button immediately beside barcode/product search. Scanning searches inventory in the selected branch. Choose `Stock In` on the matched product to receive stock.
- **Register Product**: `Scan Product Barcode` launches camera scanner; successful scan fills the barcode field.
- **Cashier POS > Draft > Scan Consumed Product**: retains `Scan with Camera`, with instructions for external keyboard-wedge barcode scanners. Scanning only selects an item; quantity plus `Confirm & Lock Stock Out` is still required for stock deduction.
- **USB/Bluetooth external scanners**: standard scanner keyboard input works without integration; focus barcode field before scanning.
- **Camera**: uses native `BarcodeDetector` API when browser supports it, and requires HTTPS / browser camera permission; on unsupported browsers use an external scanner or enter barcode. This is not a guaranteed cross-browser camera decoder.
- **Backend**: no Supabase, retains browser-local demo data and existing branch separation / financial rules.
- **Testing**: source syntax and existing financial/inventory smoke tests. Full Next.js production build and physical scanner/camera tests still require deployment.
