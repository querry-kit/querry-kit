---
description: "Ordered implementation tasks for the Querry Kit Workboard"
---

# Tasks: Querry Kit Workboard

**Input**: [Specification](spec.md), [plan](plan.md), [research](research.md), [data model](data-model.md), [HTTP contract](contracts/read-api.md), and [quickstart](quickstart.md).

**Tests**: Add focused regression checks with each increment; write behavior assertions first where feasible. Validate and commit each task separately before starting its dependents.

## Format: `[ID] [P?] [Story] Description`

`[P]` marks a possible parallel increment after its prerequisites when files do not overlap. Paths are relative to the repository root unless they link to a design artifact.

## Phase 1: Setup

- [X] T001 Bootstrap the private pnpm workspace in `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` and `.gitignore`; stage pinned sources with `scripts/querry-kit-sources.json` and `scripts/stage-querry-kit.mjs`; scaffold buildable app and library entries in `apps/api/src/main.ts`, `apps/app/app/app.vue` and `libs/contracts/src/index.ts`. Gate: frozen install from verified Git pins, correct Nuxt UI peer/build resolution, workspace exports and both app builds. Document bootstrap in `README.md`.
- [X] T002 Configure standards in `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `package.json` and `docs/coding-guidelines.md`, including TS/Vue format, SFC block and attribute order, and JSDoc/TSDoc coverage. Gate: positive/negative TS/Vue fixtures, two identical fix passes, lint/format/typecheck and documented manual exceptions.

## Phase 2: Foundation

- [X] T003 Add PostgreSQL-only `compose.dev.yml`, Prisma/migrations in `apps/api/prisma/schema.prisma` and `apps/api/prisma.config.ts`, transactional initialization in `apps/api/src/database/seed.ts`, and readiness in `apps/api/src/health/health.controller.ts`. Implement the canonical [data-model.md](data-model.md#canonical-schema-field-names) fields: `Account.id`, `Account.login`, `Account.role`, `Profile.accountId`, `Profile.displayName`, `Project.id`, `Project.slug`, `Project.title`, `Task.id`, `Task.projectId`, `Task.ownerId`, `Task.assigneeId`, `Task.title`, `Task.status`, `Task.priority`, `Task.estimatedHours`, `Task.internalNote`, `Task.internalCostCents`, `Task.createdAt`, `Label.id`, `Label.slug`, `Label.displayName`, `TaskLabel.taskId`, and `TaskLabel.labelId`. Gate in `apps/api/test/database.integration.spec.ts`: reviewed migration, deterministic fixtures, 1:1/1:n/m:n constraints, empty startup then restart, nonempty preservation and failed-seed rollback in disposable PostgreSQL. Document startup.
- [X] T004 Add shared session/error schemas in `libs/contracts/src/session.ts` and `libs/contracts/src/errors.ts`, signed demo login in `apps/api/src/demo/demo-session.controller.ts`, and account-based CASL wiring in `apps/api/src/auth/workboard-ability.ts`. Isolate demo identity from policy, explain the integration with direct docs links, and document the local-only auth boundary. Gate in `apps/api/test/session.integration.spec.ts`: anonymous/invalid requests, three allowed logins, cookie replacement and same-role owner conditions against fixtures.

## Phase 3: User Story 1 - Explore relational tasks (P1)

**Independent check**: Boot from the example checkout and empty volume; select `user1`, look up a project, filter, sort, change columns, page and open details.

- [X] T005 [US1] Implement shared read schemas in `libs/contracts/src/tasks.ts` and `libs/contracts/src/lookups.ts`, Fastify normalization in `apps/api/src/query/query-parser.ts`, and scoped projected list/detail/count and lookups in `apps/api/src/tasks/tasks.controller.ts`, `apps/api/src/tasks/tasks.service.ts` and `apps/api/src/lookups/lookups.controller.ts`. Link upstream docs in comments, publish OpenAPI and document runnable read requests. Gate in `apps/api/test/reads.integration.spec.ts`: Fastify/Zod/OpenAPI and client round-trip, nested fields, autocomplete selection, supported read variants at the service boundary, scope and stable pagination.
- [X] T006 [US1] Implement CRM-inspired dashboard, automatic admin session and navbar switcher, typed validated client and read UI in `apps/app/app/layouts/default.vue`, `apps/app/app/plugins/querry-kit.ts`, `apps/app/app/pages/index.vue`, `apps/app/app/pages/tasks/[id].vue` and `apps/app/app/components/tasks/TaskTable.vue`. Explain `useTable`, `useAutocomplete` and Nuxt UI integration blocks with direct docs links. Gate in `apps/app/test/workboard.spec.ts`: filters, multi-sort, columns, pages, project selection rehydration, projections and pending/empty/error states. Document the demo flow.
- [X] T007 [US1] Build the standalone three-service stack with `compose.yml`, `apps/api/Dockerfile`, `apps/app/Dockerfile` and `apps/app/server/api/[...path].ts`; proxy API and docs through the web origin and bind only the web port on loopback. Gate: cold example-only build, frozen install, ready stack, seeded reads and restart without data changes. Document startup in `README.md`.

## Phase 4: User Story 2 - Compare access rules (P1)

**Independent check**: Compare results for all three accounts, including same-role denial and identity changes during pending requests.

- [X] T008 [US2] Add navbar switching in `apps/app/app/components/demo/AccountSwitcher.vue` and identity-keyed session/query isolation in `apps/app/app/composables/useDemoSession.ts`. Clear or invalidate stale data, requests, projections, filters and selections; explain the account boundary and document comparison examples. Gate in `apps/app/test/account-switch.spec.ts` and `apps/api/test/access.integration.spec.ts`: `admin` → `user1` and `user1` → `user2` during loading, distinct owned IDs, cross-account detail/lookup denial, forbidden query operands and positive admin fields.

## Phase 5: User Story 3 - Compare grouping and reported totals (P2)

**Independent check**: Under each account, group by status/priority, page through branches and compare optional metrics with the independent `OPEN` totals.

- [X] T009 [US3] Add strict grouping/aggregate schemas in `libs/contracts/src/grouping.ts` and scoped Fastify routes in `apps/api/src/tasks/task-groups.controller.ts`. Pass already-scoped `where` to `QueryService.aggregate`, explain why in source with direct docs links, and document query examples. Gate in `apps/api/test/grouping.integration.spec.ts`: count/group/aggregate parity across accounts, `having`, two-key grouping, typed inputs, pagination, denied operands and exact fixture totals.
- [X] T010 [US3] Wire group UI and separate metrics in `apps/app/app/components/tasks/TaskTable.vue` and `apps/app/app/composables/useGroupMetrics.ts`, with direct docs links, boundary comments and a usage example. Gate in `apps/app/test/grouped-tasks.spec.ts`: branch expansion, both row loading modes, local retry, metrics toggle, no metric requests when off, filters and account changes.

## Phase 6: User Story 4 - Develop against local packages (P2)

**Independent check**: For each sibling, make one temporary observable edit and prove it reaches its consumer after restage/rebuild/restart without registry access or writes to siblings.

- [X] T011 [P] [US4] Add sibling mode and explicit source paths in `scripts/stage-querry-kit.mjs`, dev scripts in `package.json`, and provenance checks in `scripts/check-querry-kit-sources.mjs`. Document commands, missing-source errors and lockfile drift in `README.md`. Gate: compare cold pinned/local resolution, prove all three local edits reach consumers, no upstream checkout writes, no `@querry-kit/*` registry requests, one shared Nuxt package identity. Depends on T007.

## Phase 7: User Story 5 - Adopt Querry Kit in another application (P2)

**Independent check**: From a disposable copy, follow the guide to add one public field through storage, contracts, projection and UI without editing upstream.

- [X] T012 [US5] Publish a source-linked read walkthrough in `README.md` and copy/integrate guides in `docs/adopt-querry-kit.md`. Cover rename/environment, field extension and replacement of demo-only auth, seed, secrets and local settings. Audit source comments against the [direct-link map](plan.md#developer-walkthrough-and-template-reuse). Gate: reviewer completes the field extension, passes documented checks, verifies comment/doc links and identifies demo-only code.

## Phase 8: Cross-cutting validation

- [X] T013 Add `.github/workflows/ci.yml` and `tests/e2e/workboard.spec.ts`; run lint/format/typecheck/test/build, cold Compose provenance, seeded restart, real HTTP contracts and browser flows at 375, 768 and 1280 px with keyboard and light/dark checks. Document verified commands and remaining evidence gaps in `README.md`. Do not add publishing or release automation.

## Dependencies & Execution Order

Recommended commit order: T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013.

- US1 depends on the foundation; T007 is the standalone MVP checkpoint.
- US2 extends the US1 app and does not require grouping.
- US3 uses scoped reads and the US2 account switch. T010 depends on T009.
- US4 can proceed after T007, in parallel with US2 or US3 if README edits are serialized.
- US5 documents real source paths and depends on T008–T011; T013 validates the complete feature.

## Implementation Strategy

Deliver the standalone read journey first, then same-role isolation, grouping, local development and adoption. Keep tests, readable code, source comments and documentation in each matching increment. Run integration and full acceptance only after focused task checks have passed.
