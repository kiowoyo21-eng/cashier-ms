# Cashier System v9.13 — POS Delete Draft

## New UI
- POS & Sales → Drafts: **Delete** action on each open POS draft alongside **Open Draft**.
- POS transaction details: **Delete Draft** action, with guarded confirmation modal.
- Requires reason (5+ characters), displays customer vehicle/plate, sale total and snapshot count.
- Admin Reports & Audit contains a read-only **Deleted POS Draft Archive** with reason, actor, Philippine timestamp, and original draft revision snapshots.

## Safeguards
- Only an active branch-assigned Cashier may delete an open draft.
- Cannot delete Closed POS, paid/part-paid drafts, any terminal event, stock movement, stock release request (including rejected), stock correction, linked Parts Buyer purchase, or parent POS with a child transaction.
- Removed from active POS and released from unit lock, while retaining a deleted draft tombstone with complete original POS and version history in browser-local database.
- Audit entry records POS number, branch, plate, actor and reason.
- `nextNumber` uses both active and deleted POS numbers to prevent number reuse.
- Deletion is refused if `storeDB` cannot persist the archive, to avoid displaying false success.
- Old browser records migrate with an empty optional deletion archive; original data and existing reports are preserved.

## Validation
- Existing logic smoke suite plus v9.13 deletion smoke tests passed.
- Local import resolution and navigation map checks passed.
- Full Next.js production build not verified (npm dependencies unavailable in current offline environment).

## Production warning
- All records/audit archives are browser-local. They cannot provide true immutable auditing or secure role authorization until a centralized backend, authenticated users and atomic inventory/payment constraints are added.
