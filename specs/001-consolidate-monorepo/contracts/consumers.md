# Workboard, docs and Pages contract

## The embedded example's exit test

Inventory `examples/workboard/{api,web}` before moving it. Its four routes are `GET /api/v1/projects`, `GET /api/v1/projects/:id`, `POST /api/v1/projects` and `PATCH /api/v1/projects/tasks/:id`; the last returns a task, despite its old Swagger annotation. Preserve the [original source](https://github.com/querry-kit/querry-kit/tree/34b2dca/examples/workboard) for historical references.

Move the following exact lesson into a Nest guide plus a tested fixture, including the DTO selection and frontend column-to-field mapping:

```text
/api/v1/projects?fields=items{id,name,workspace{name},tasks{title,status,labels{name}}},meta{page,itemCount,pageCount}
```

Expected: `Spring launch` belongs to `Product studio`; `Refine product brief` has labels `Product` and `API`; `Document API contract` has an empty labels list. Assert requested `meta`, parent, child and many-to-many fields only; unselected fields do not leak. Cover nullable task assignee and workspace member projections where the old DTO teaches them. Record the old create example's pre-write selection and post-write projection. Do not offer this query against the canonical project lookup.

Replace active paths/anchors in the root README, example READMEs, package scripts, adoption guide, docs `/example` and package source badges. Preserve link meaning: point legacy-schema references to the fixture or pinned source; canonical clone instructions to the monorepo. The Nuxt example guide refers to an absent `examples/nuxt` mock: retain the guide URL and identify a real matching demo. Closure requires a destination and passing check for every unique teaching case. A retained private legacy executable needs its own ports, storage, owner and exit criterion.

## Canonical Workboard

Keep three private package names `@workboard/api`, `@workboard/app`, `@workboard/contracts`. Preserve existing `/api` routes and cookie/origin behavior for readiness, persona switching, task reads/aggregates, scoped project and label lookup, project table, and task/project writes. Verify same-role users see different task IDs; only admin sees internal notes/costs. Serve `/docs/openapi.json` through the Nuxt origin.

- **Standalone:** `compose.yml` starts PostgreSQL 18, API and app; only the app is exposed on loopback (default 3201). Docker build context is the workspace root. Keep generated Prisma client/engine, CLI, migrations and valid runtime dependency links in the API image; deploy Nitro output for the app. Exclude nested `dockerdata`, env files, host dependencies, cookies and vendor copies.
- **Development:** `compose.dev.yml` starts only PostgreSQL; host API/app run at 3101/3201 by default. Keep distinct fresh storage for development and demo. Legacy PostgreSQL 17 uses a different data directory and destructive seed. Both dev DBs default to port 54329: changing only the Compose project name does not isolate a host port or bind mount. Do not reuse, mount, migrate or reset existing volumes during import.
- **Build:** Remove vendor scans/staging and stale nested registry policy; verify app and UI resolve the same local Nuxt build. Point Workboard's Tailwind scan at the built UI runtime, retain module order and its `/_workboard_icon` endpoint.
- **Verify:** Compare compact seed IDs across restarts. Test projected fields, auth-scoped group totals, restored URL filters, CRUD and account switching. Preserve 375/768/1280 layouts, mobile dialog close/focus and grouped resize checks.

## Docs and Pages

Keep `https://querry-kit.github.io/querry-kit/` with `/example` as a documentation page, not a hosted database-backed app. Preserve package guides, all three changelogs, the non-sidebar `/docs/nest/api/decorators-pipes-utils` compatibility route, sitemap/search, icons and working source links. Keep static demos independent of Workboard's database. Check grouped totals (26 details, 351 hours), null versus zero, mobile keyboard/focus, scrolling and icons.

Read `packages/{nest,nuxt,nuxt-ui}/CHANGELOG.md` locally; validate package headers and first version headings before writing existing generated content. Compare old/new output at the same revision, accounting for the documented deployment lag. Remove cross-repo token dispatch and scheduled fetch only after parity. Replace physical `node_modules` type imports with public exports, preserve Tailwind scanning and static Lucide/Tabler icons without a runtime API fallback.

Production release labels must correspond to the versions readers can install; mark workspace-only behavior “Next” and show which released version is demonstrated. Serve the actual generated artifact under `/querry-kit/`; test direct reload, search/navigation, CSS, favicon, all changelog headings and interactive controls on desktop and 390×844 mobile. Verify those same URLs after deployment independently of npm publishing.
