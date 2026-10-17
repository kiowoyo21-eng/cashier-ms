# v8.4 — Empty Inventory + Visible Admin Product Registration

- New browser demo databases start with **no registered inventory products**. Product masters are created **only by Admin**.
- For existing v8.x browser-local data, on load the system removes only the **12 untouched generated demo products** (the original 3 sample items per branch), recognized by exact barcode and seed attributes. Legacy samples referenced by stock movements are **archived and hidden from active Inventory/Stock Out** instead of deleted, protecting transaction/COGS history. Admin-edited and Admin-created products remain.
- Admin now has an explicit **Add Product** quick action on **Dashboard**, an **Add Product** button on **Inventory**, and a guided **Add Product** empty state.
- Cashier can scan/search existing products and Stock In authorized quantities; no product-registration access. PB cannot register products.
- All three original roles remain Admin/Cashier/PB.
- Browser local data key retained; Supabase not integrated.
- Export a JSON backup before deploying.
- Manual hardware/interactive browser testing and full Next.js production build are not verified until run on Vercel or with dependencies.
