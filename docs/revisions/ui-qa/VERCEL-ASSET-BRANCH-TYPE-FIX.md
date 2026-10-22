# Vercel build fix — 2026-10-12

## Failure from Vercel
`components/AssetWorkspace.tsx` (Add Device branch selection) failed TypeScript validation because the `newDevice.homeBranch` initial state was inferred as a narrow union of branch-name literals, while the `<select>` DOM change event provides `event.target.value` typed as `string`.

## Fix
- Specify the Add Device draft state object explicitly with `homeBranch: string`, matching the HTML select's value type. The branch choices are still restricted to configured options and the submit routine continues to validate authorized branch scope.
- Include `branchFilter` and `branch` in the memoized device inventory's dependency list, so changing the branch dropdown updates the table immediately.

No other module features are removed or redesigned in this patch. This is a targeted fix applied on top of `Underchargers_HR_PWA_System_Wide_Module_UI_UX_Revision.zip`.

Validation notes: offline source syntax and module import checks can be run without dependencies. Full `next build` must still be run in Vercel or an environment with npm dependencies installed.
