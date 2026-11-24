# Feature specification: Nuxt UI component overview

**Status:** Draft for review | **Date:** 2026-11-24

## User scenarios and acceptance

- **P1 — Discover a control.** From the package landing page, select “Browse components”. A catalog displays all ten public components, organized by purpose. Each card has the exact component name, a short English description and a recognizable preview.
- **P1 — Find the right reference.** Select a card. It opens the matching existing reference, including the relevant section when several components share a page. A reader looking for `QTableGroupLoadMore` should not have to scan the grouping guide.
- **P2 — Browse from any screen.** Open the catalog from package navigation on a phone or desktop. Cards fit the viewport and can be reached and activated using the keyboard alone.

## Requirements and success criteria

1. `/docs/nuxt-ui/components` opens directly and after reload on the deployed site.
2. Every public component registered by `@querry-kit/nuxt-ui` appears exactly once; internal controls are excluded.
3. All ten links resolve, including section targets. Existing guide URLs and published fragment links keep working.
4. Previews illustrate the controls without adding a second interactive action inside a card. Names and descriptions convey purpose independently of color or imagery.
5. Keep the existing docs theme and English language. No new component APIs or replacement guides are required.
