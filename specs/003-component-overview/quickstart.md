# Validate the component overview

Use Node 26.13+ (26.x) and the repository-pinned pnpm. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm build:packages
pnpm docs:lint
pnpm docs:typecheck
pnpm docs:test
```

The docs test command generates the site and runs desktop and mobile Playwright projects. Install the matching Chromium browser if missing (`pnpm --dir apps/docs exec playwright install chromium`).

On the generated site, open `/querry-kit/docs/nuxt-ui/`, follow “Browse components”, then reload. Confirm all ten named cards appear in three categories. Use the sidebar (or mobile navigation) to return. Open each card, verify the heading/fragment, and navigate back. Tab to a card and press Enter: the focus ring must be visible and the link must work. Inspect previews in light and dark mode and at a 390px viewport; check contrast, clipped names and horizontal overflow. Verify the generated sitemap includes the catalog URL.
