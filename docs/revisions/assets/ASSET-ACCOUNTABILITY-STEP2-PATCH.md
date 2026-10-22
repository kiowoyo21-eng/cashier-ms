# Assets & Devices — Accountability and Turnover UI (frontend review release)

## Implemented
- Three-step **Assign Device** procedure (Assignment Details → Accountability Form → Turnover Confirmation); no “Wizard” title.
- Searchable employee selection; each device belongs to one accountable employee (branch is reference only).
- Device condition, accessories, assignment date and optional handover notes recorded in Step 1.
- Step 2 automatically displays the employee ID, name, branch, device name, asset ID, serial, condition and accessories.
- Step 2 includes an inline company-form preview and a **separate print-ready A4** document, rather than printing the application page.
- Signing methods: **Phone / QR Code**, **Sign on This Device** (temporary drawing pad), **Print for Physical Signature**.
- Step 3 includes issuing officer, physical handover confirmation and method-specific acknowledgment/evidence controls.
- Phone/QR pathway is held as **Pending Turnover**, with no invented link and no fake completed signature.
- Devices with a Pending Turnover record are unavailable for reassignment, but can be resumed.
- Optional local preview completion for on-device handwriting or selected physical signed-file **only** when the officer and physical handover fields are completed.
- Retains retrieval and inspection screens. Device registration remains available to HR and Super Admin.

## Important limits / intentionally pending
- This is still a **frontend prototype**. Status updates live in this browser, not in a shared server.
- Canvas drawings are transient and **are not attached to stored documents**. Selecting a signed PDF/image does not save/upload the file itself; the UI may retain only its filename.
- There is **no secure signing service, QR link, employee verification, evidence vault, or permanent signed-document archiving** yet.
- “Assigned” after temporary evidence in the review UI is not proof of a completed, verified real-world turnover.
- Do not enter real personal employee data, sign real employment documents, or treat these records as official.

## How to review
1. Open **Assets & Devices**, leave the default status on Available.
2. Choose an available device → **Assign**.
3. Search/select the specific employee, review condition/accessories/date → Continue.
4. Verify auto-filled fields, open **Preview Accountability Form**, try **Print / Save as PDF**.
5. Select each signing method and note how the screen changes.
6. Continue to Turnover Confirmation. Without a backend, Phone/QR can only be saved as **Pending Turnover**.
7. Return to the Pending Turnover list and **Continue Turnover**. Try the printed or on-device review-only route with an officer and physical handover confirmation.
8. Verify the device is not shown as Available after Pending Turnover/Assigned.
9. For an already assigned device, test **Retrieve** → **Inspection**.

## Change scope
- `components/AssetWorkspace.tsx`
- `lib/hrState.tsx` (asset type additions; optional fields preserve old browser records)
- `app/globals.css` (responsive accountability UI)
- README and this checklist

## Build verification
Static JSX/TypeScript syntax and local import resolution verified. Full Next.js dependency-backed production build not run because node_modules is not installed in this environment. Vercel deployment and interaction testing are still needed.
