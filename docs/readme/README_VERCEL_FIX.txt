UCMM HR MANAGEMENT SYSTEM — OCT 14, 2026 VERCEL BUILD HOTFIX
==========================================================
Consolidated complete source update — unzip first, then copy extracted project
files into the ROOT of your existing GitHub repository with the same paths.
Do not upload this ZIP directly to GitHub: GitHub/Vercel will not unpack it.

Changes:
1. components/WorkflowSigning.tsx
   - Declares optional documentFile (PDF/image) and documentText props.
   - Previews the available source document, then requires acknowledgement
     before the same-session demo signature pad can be used.
   - Does NOT claim to save, transmit, or authenticate digital signatures.
   - Addresses Vercel error in components/IncidentWorkspace.tsx:101.
   - Also supports the already-existing Recruitment and Payslip callers.
2. lib/documentWorkflow.ts
   - Restored helper omitted from previous consolidated source archive.
3. components/FrontendQACenter.tsx
   - Mapped outdated internal QA navigation IDs to real sidebar routes.
4. Keeps previous EmployeeWorkspace.tsx salary-view type narrowing fix.

Validation performed:
- TypeScript/TSX syntax parsed across entire source successfully.
- CSS parsed successfully.
- Relative source imports resolved, including the restored helper.
- Local type-simulation with available mock declarations found no further
  source-level incompatibilities. This is NOT an official TypeScript build.

Limitations:
- npm registry access is unavailable in this runtime (EAI_AGAIN), so
  real dependency installation / `npm run build` was NOT verified.
- Deployment, application behavior and security must still be tested in Vercel.
- Browser-local signatures are only demos, not verified electronic signatures.

GitHub instructions:
1. Download ZIP and extract in Finder.
2. Copy extracted app/, components/, lib/, public/ and config files to the
   existing repository root, replacing files with matching paths.
3. Commit/push all changes in one commit.
4. Check latest Vercel deployment, and report any TypeScript build errors.
