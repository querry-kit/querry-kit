# Tasks: Nuxt UI component overview

Input: [Plan](plan.md), [reader scenarios](spec.md), [destinations](contracts/catalog.md).
No setup dependency beyond the existing docs workspace. Deliver in this order:

- [x] T001 [US2] Prepare distinct section targets for `QTableGroup` and `QTableGroupLoadMore` in `apps/docs/content/docs/nuxt-ui/components/grouping.md`. Retain the combined reference heading ID. Verify all three fragments on the generated guide in `apps/docs/tests/docs.spec.ts`.
- [x] T002 [US1] Add `apps/docs/content/docs/nuxt-ui/components/index.md` and the docs-only `apps/docs/app/components/component-catalog.vue`. Render the ten entries grouped as specified, with short descriptions, decorative static previews and base-aware links. Register the sidebar route in `apps/docs/app/utils/docs.ts` and update the landing CTA in `apps/docs/content/docs/nuxt-ui/index.md`. In `apps/docs/tests/docs.spec.ts`, verify both entry points, direct reload, catalog membership and each resolved destination against the contract. Depends on T001.
- [x] T003 [US3] Verify mobile navigation, keyboard activation, focus visibility, contrast in both themes, and long component names at 390px. Add navigation and overflow regression coverage in `apps/docs/tests/docs.spec.ts`; fix any catalog layout issues in `apps/docs/app/components/component-catalog.vue`. Run the [validation guide](quickstart.md) and confirm the generated sitemap contains the route. Depends on T002.

Each task includes its own validation and forms one reviewable commit. The first two tasks deliver the catalog; the final task checks it across the supported viewports and input methods.
