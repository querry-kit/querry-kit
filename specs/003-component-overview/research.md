# Design decisions

- **Index, not ten new pages.** `packages/nuxt-ui/src/module.ts` registers ten components; the six current guides already cover them. Linking to their relevant sections avoids duplicating examples and reference tables.
- **Use the existing content route.** The package catch-all checks `documentationRoutes` before querying content. `apps/docs/nuxt.config.ts` also prerenders from that list with link crawling disabled. A Markdown page alone would not ship a working route; a separate custom page would duplicate the docs shell.
- **Static previews, not live demos.** The reference groups controls by purpose. Schematic previews let readers distinguish similar grouping controls without competing keyboard shortcuts, nested controls or data dependencies. The detail pages already host working demos.
- **Verify the deployed base.** The docs default to `/querry-kit/`; the existing desktop and mobile Playwright projects serve generated files at this base. Checking only a local root-mounted dev server would miss broken production links.
