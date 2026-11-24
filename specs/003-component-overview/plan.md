# Implementation plan: Nuxt UI component overview

**Feature:** `003-component-overview` | **Planning checkout:** `chore/setup-spec-kit` | **Date:** 2026-11-24 | [Specification](spec.md)

## Summary

Add a categorized, responsive card catalog at `/docs/nuxt-ui/components`, inspired by the [Nuxt UI catalog](https://ui.nuxt.com/docs/components). Keep the current six reference pages as destinations. The catalog answers “which control do I need?”; examples and API tables stay on the detail pages.

## Technical context and implementation sequence

1. **Content and targets.** Create `apps/docs/content/docs/nuxt-ui/components/index.md` in the existing Nuxt Content collection. Use English section headings and short category introductions. Reuse existing anchors or add stable component-specific headings for shared references; retain the current combined heading for inbound links. See [catalog contract](contracts/catalog.md).
2. **Cards and previews.** Compose the overview with native Nuxt UI cards/grid inside the existing docs layout. Use a small docs-only Vue component for repeated card/preview markup where needed. Use static, theme-aware illustrations (e.g. ordered sort fields, an expanded branch, a row-count footer); do not mount ten interactive demos. Render links and text in generated HTML. Use one focusable link per card, with previews hidden from assistive technology.
3. **Discovery and static delivery.** Add Overview as the first Table Controls item in `apps/docs/app/utils/docs.ts`. This feeds the route allowlist, navigation, prerender and sitemap. Update “Browse components” in `apps/docs/content/docs/nuxt-ui/index.md` with a base-aware internal link. Check both direct loads and client navigation under `/querry-kit/`.
4. **Acceptance.** Extend `apps/docs/tests/docs.spec.ts` to verify both entry points, ten distinct named links in the catalog, destination pages and actual target IDs in rendered HTML. Exercise desktop and mobile layouts, keyboard activation, theme contrast and absence of horizontal overflow. Run the [validation guide](quickstart.md).

## Constraints and constitution check

Nuxt 4, Nuxt Content 3, Nuxt UI 4, Vue 3, TypeScript and existing Playwright projects; static GitHub Pages hosting. All changes belong in `apps/docs`; no runtime or package API changes, external preview services, new dependencies or persistent data. Before research and after design: package boundaries preserved, existing links retained, user-facing behavior covered by docs checks. No exceptions required.

## Supporting artifacts

[Design decisions](research.md) · [Content model](data-model.md) · [Catalog contract](contracts/catalog.md) · [Validation](quickstart.md)
