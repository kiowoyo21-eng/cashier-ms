# GitHub-only upload and hosting (no Vercel)

This project is ready for a **GitHub repository** and **GitHub Pages** static-site deployment. No backend, database or hosting account outside GitHub is required.

## Upload using the GitHub website

1. Create a GitHub repository, e.g. `underchargers-cashier` (the exact name can differ).
2. Unzip the package on your computer. Open the extracted directory and upload the **contents**, not the ZIP itself and not an enclosing parent folder, into the **root of the repository** using **Add file → Upload files**. Retain subfolders and hidden `.github/workflows/deploy-pages.yml` and `.gitignore` files. On macOS Finder, use **Command + Shift + .** to show hidden items if necessary.
3. Commit to the repository's **main** branch (or **master**).
4. Open **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
5. Open **Actions**, then select **Publish Cashier System to GitHub Pages**. It runs when you push to `main`/`master`, or choose **Run workflow** to trigger manually. Wait for GitHub to report a successful build/deploy. If it fails, open the workflow logs to see the first failing step; the source has not yet completed a full install/build/browser test locally.
6. Find the site URL under **Settings → Pages** once deployed. Normal repositories generally get `https://<github-username>.github.io/<repository-name>/`. Special `<github-username>.github.io` repositories publish at the domain root.

Do **not** upload only the ZIP file as a repository item. GitHub Pages cannot run raw Next.js source without building it, which is why the `.github/workflows/deploy-pages.yml` workflow is included.

## Local preview before upload

```sh
npm install
npm run typecheck
npm test
npm run build  # creates out/ for static hosting
npm run dev    # browse http://localhost:3000
```

The workflow calculates the static `basePath` automatically from the repository name, so **no editing or custom secrets are required** for the standard GitHub Pages URL.

## GitHub storage is not an application database

The published site uses each visitor's own `localStorage`, so POS records are **not** stored in GitHub, and different computers/browsers cannot see or update the same transactions. The included demo accounts are **not secure authentication**: do not use this GitHub Pages build for live cash, customer data, signatures, or payroll information. JSON Export/Import can move test data manually between devices. Hosting this prototype on GitHub does not add a server.

For a private, multi-user live system, an authenticated backend and database will be necessary later.
