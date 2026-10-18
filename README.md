# Underchargers Fund Management System — Frontend PWA v9.1

Responsive Next.js / React / TypeScript PWA frontend for Admin, Cashier, and PB. Supabase is **not connected** yet; test data persists only in the same browser's local storage.

## Latest Inventory Registration Sequence

1. **Admin → Inventory → Add Product** (single) or **Bulk Scan** (many).
2. Scan unique product barcodes; give **each product a name**, category, physical quantity (1 by default; Multiple Units option), unit and tracking method.
3. Click **Submit Product** or **Submit All**. Products are saved under **Pending Stock · Needs Cost**, with **0 available units**; no cost entry at this stage.
4. Open **Admin → Inventory → Cost Configuration (COGS)**, or use the button in Admin Dashboard. Set actual unit cost (COGS) only, then **Save Unit Cost** or **Save All Costs**. No permanent selling price is registered in Inventory.
5. Saving verified unit costs posts the Admin-physically-counted initial units in the branch Stock In ledger. Only then can Cashier consume the product into POS COGS.
6. Later Stock In receipts of previously registered/cost-configured items use the existing Admin direct receive or Cashier pending-verification workflow. Previous transactions are retained.

Barcode repeats in registration are ignored; they never imply another physical unit. Serialized/high-value items require unique codes per unit. Each POS quotation sets its own selling price per transaction; inventory never determines the customer charge. The existing separate Cashier single/bulk scanning, POS draft creation, PB/RFP auto-linking, and Funds modules are retained.

## Local Development

```
npm install
npm run dev
npm run test:logic
npm run build
```

Open http://localhost:3000. Sample demo logins: admin/admin12345, cashier/cashier12345, pbacc/pb12345.

Production build and real hardware/camera scanning were **not verified** here because npm registry dependencies could not be installed. Verify in Vercel before relying on this version.

Before upgrading, use the Settings JSON export for a local-data backup. Do **not** clear local storage unless you intentionally want to reset your demo records. Demo approval/security controls are not a substitute for Supabase policies.
