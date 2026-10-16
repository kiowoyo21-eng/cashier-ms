# Rebuild verification notes

- Static TypeScript/TSX parser/transpilation check with available global TypeScript: **PASSED** (no parse diagnostics).
- Runtime smoke test of transpiled pure domain/seed logic: **PASSED** (38 POS, 44 cash entries, 8 users, four branches, positive balances and derived sales).
- `node --test tests/*.test.mjs`: **PASSED** (3 source-structure checks).
- No database, `.env`, external API or Supabase runtime dependency declared in `package.json`: **MANUALLY CHECKED**.
- `npm install`: **NOT VERIFIED**. This environment cannot retrieve dependencies from npm registry and its cache lacks React/Next.js packages; offline install reported `ENOTCACHED`.
- `npm run typecheck`: **NOT VERIFIED** (dependencies unavailable).
- `npm run build`: **NOT VERIFIED** (dependencies unavailable).
- End-to-end browser interaction, layout at requested widths, generated PDF pages, image uploads and all role workflows: **NOT VERIFIED**. Please run in a Node 20+/npm-network-enabled computer and verify before treating the prototype as stable.

This is a best-effort new implementation, not a certified one-to-one recreation. See README limitations.

## GitHub Pages adaptation

- Added Next.js `output: export` and `trailingSlash`, unoptimized image mode, repository-prefixed `basePath` via workflow-provided environment variable.
- Added GitHub Actions workflow using `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, and `actions/deploy-pages@v4`.
- Added a GitHub-only, step-by-step deployment guide and `.gitignore`.
- These deployment configurations were statically inspected, but no GitHub Actions run or live site was executed here. GitHub Actions build may expose install/type errors not visible in static checks.
