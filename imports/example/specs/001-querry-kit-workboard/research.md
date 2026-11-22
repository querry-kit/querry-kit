# Research: Querry Kit Workboard

## Reference application

**Decision**: Reuse the Workboard concept from `querry-kit/querry-kit/examples/workboard` and the dashboard composition from CRM `apps/tenant-web/app/layouts/default.vue` and `DESIGN.md`. Rebuild it around the new read contracts rather than transferring either workspace.

**Rationale**: Existing Workboard demonstrates a relational list and sibling links, but its API uses Express and separate seed commands. CRM supplies the desired shell, visual tokens and table patterns, not a dependency.

**Alternatives considered**: Copy existing Workboard or CRM wholesale; both bring requirements and implementation assumptions that do not fit this demo.

## Local package provenance

**Decision**: Stage sources under ignored `vendor/{nest,nuxt,nuxt-ui}` paths in a single example-owned pnpm workspace. Development stages the current sibling checkouts, including uncommitted source edits; Compose and CI stage the same paths from full Git SHAs in a versioned source manifest. Use `workspace:` for the three example dependency edges and normalize only the staged Nuxt UI dev dependency on `@querry-kit/nuxt` to `workspace:*`. Leave the peer range intact and supply the same Nuxt workspace package in the web app.

**Rationale**: `nuxt-ui/package.json` allows Nuxt `1.x` as a peer, but its build-time dev range is `^0.2.10`; ordinary auto-linking may resolve the latter from npm. Nest and Nuxt `dev` scripts check types without emitting the `dist` paths exported to consumers. Nuxt UI `dev` stubs output. Require an explicit restage/rebuild and restart baseline, not unverified hot reload. Build Nest and Nuxt first, Nuxt UI after Nuxt, and then consumers.

**Alternatives considered**: Global `pnpm link` or direct `link:` paths depend on independent installs and do not fix the UI dev edge; `file:` tarballs require rebuilding and reinstalling on edits and still need that edge fixed first; Git dependencies alone do not guarantee `dist`.

**Candidate source revisions** (observed local `origin/main`, subject to fetchability and combined-build proof): `nest@bbd356e3819dfe9a7585da5142c8ad700718ef77`, `nuxt@8de1b5e96d4d51c223747e98e2c0df00f4fcce33`, `nuxt-ui@772de56bc599631ff454703a5605360bce50e00e`. Use Node `26.13.0` and pnpm `11.28.9` as the initial compatibility baseline. Review upstream workspace overrides, build permissions and patches explicitly; nested workspace policies must not be assumed to carry over.

## Group branches and optional metrics

**Decision**: Drive the tree with `useGroupedTable` and Nuxt UI grouping primitives. Ask Querry Kit Nest for each branch's next scalar grouping level and `_count._all`. When metrics are enabled, show `_sum`, `_avg`, `_min` and `_max` of estimated hours for expanded groups via a scoped aggregate call using the group's typed path and the current filter.

**Rationale**: At the inspected Nuxt revision, `src/table/grouped.ts` sends `{ by: [field], _count: { _all: true }, take, skip }` and maps only the key and count into `GroupNode`. The Nest package separately exposes `groupBy`, `aggregate`, and `count`. A thin example adapter preserves the package behavior and lets the UI explain why counts stay visible with metrics off.

**Alternatives considered**: Client-side grouping (wrong across pages), parsing undocumented node metadata (unsupported), and modifying upstream (outside this plan).

## Contracts and read policy

**Decision**: Share strict, bounded Zod 4 contracts. Perform authentication, parser normalization, schema validation, explicit role-aware query checks, CASL-scoped database queries and output projection on the API. Document effective contracts in OpenAPI and compare real responses in tests.

**Rationale**: Applying CASL after the query would leave counts and other computed results outside the policy. In `nest/src/core/query.service.ts`, `aggregate(options)` does not take an ability, unlike `groupBy` and `count`; the example must pass an already CASL-scoped `where` to `aggregate`. Field-level restrictions must cover query inputs and output separately. Zod models transport; Prisma models storage. The Nest reference HTTP grouping test uses Express/class-validator, so Fastify parsing and Zod wiring require their own contract test. The upstream Zod aggregate schema leaves selector fields unknown and there is no exported Zod group schema at the inspected revision; the shared contracts must own those allowlists.

**Alternatives considered**: Accepting arbitrary Prisma arguments, validating only on the browser, or keeping duplicate class-validator and Zod contracts.

## Startup and test database

**Decision**: Use PostgreSQL 17 and Prisma 7 with a committed initial migration. Start the API only after DB health, deploy migrations before readiness, and check/insert seed data in one serialized transaction. Real integration tests use an isolated database.

**Rationale**: An empty-volume boot should work with no manual seed steps and a second boot must not recreate or overwrite data. A reviewed migration makes both paths use the same schema history.

**Alternatives considered**: `db push` for the demo startup, unconditional upserts, and creating fixtures from browser calls.
