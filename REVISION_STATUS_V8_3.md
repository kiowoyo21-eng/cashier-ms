# Underchargers CMS PWA v8.3 — Inventory role ownership

## Implemented (browser-local frontend)
- **Exactly three roles:** `admin`, `cashier`, `pb`. No Super Admin role.
- **Admin only:** register new inventory products, assign or scan their barcodes, select the target branch, and edit existing product master data including barcode, product name, category, unit, prices and reorder alert level.
- **Cashier:** view/search/scan assigned-branch stock, receive Stock In for existing products, and issue locked Stock Out against an open POS; may request returns with Admin approval. Cashier cannot open the Register/Edit Product dialogs or call the product mutation functions.
- **PB:** unchanged Parts Fund (RFP) functionality. No Inventory product registration or editing.
- Product-registration and update functions check actor role in `lib/data.ts`, **not just** hiding UI buttons. Product barcodes are unique within the branch; editing a product does not change its branch or existing quantity/stock ledger. Changes create an audit entry with original and new field values. Previous Stock Out records retain their snapshot unit costs.
- Admin can register products while the Inventory page is filtered to `All Branches` by choosing a specific branch in the registration form.
- Existing v8.2 browser-local storage key is retained; sample inventory, transactions and existing accounts are not intentionally reset.
- Mobile, tablet and desktop remain supported. The camera/USB/Bluetooth barcode input behavior from v8.2 is retained.

## Tests
- `npm run test:permissions`: Admin-only register/edit, Cashier/PB denied, barcode collision, branch isolation, unchanged stock movements and append-only audit.
- `npm run test:logic`: prior v1–v8 financial, report, POS, inventory and Stock Out tests plus new permissions test.
- `app/page.tsx`, `lib/data.ts` TS/TSX syntax transpilation checked.
- A **complete Next.js production build and physical barcode/camera testing are not verified** in this environment because project dependencies are unavailable.

## Security / backend reminder
This is **frontend local-storage demo**, so client-side checks are not production security controls. When Supabase is integrated, Admin-only product registration/edit and branch permissions must be enforced on the server with authenticated identities and Row Level Security. No Supabase connection has been made.
