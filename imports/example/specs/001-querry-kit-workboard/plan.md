# Implementation Plan: Querry Kit Workboard

**Branch**: `1-build-the-querry-kit-workboard-example-monorepo` | **Date**: 2026-11-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-querry-kit-workboard/spec.md`.

## Summary

Build a private pnpm workspace with a NestJS/Fastify API, a Nuxt 4/Nuxt UI dashboard, and one shared Zod contracts library. Demonstrate read/query capabilities from all three Querry Kit packages over real, seeded PostgreSQL data. Support package development from local checkouts, an example-only Docker Compose build from pinned package source, and reuse as a copyable starter workspace.

## Technical Context

- **Language/Version**: TypeScript, Node `26.13.0`, pnpm `11.28.9` as the initial upstream-compatible baseline.
- **Primary Dependencies**: NestJS 12 with compatible Fastify adapter and Swagger, Prisma 7 with PostgreSQL adapter, Zod 4, CASL, Nuxt 4 and Nuxt UI 4. Use compatible versions locked during implementation.
- **Storage**: PostgreSQL 17; one API-owned Prisma schema, reviewed initial migration and transactional demo seed.
- **Testing**: Shared-schema unit tests, Fastify HTTP and real PostgreSQL integration, Vue component checks, browser journeys against the built stack, and dependency provenance checks.
- **Target Platform**: Local development and Linux containers; current desktop and mobile-width browsers.
- **Project Type**: Two private apps and one private shared library; no Nx, extra published package, or upstream changes.
- **Performance Goals**: Bound filter depth and batch sizes; load groups and records lazily; do not fetch aggregate metrics when disabled.
- **Constraints**: No domain writes, production auth, CRM dependency, Querry Kit registry packages, public service exposure, or package publication.
- **Scale/Scope**: One workboard, exactly three accounts (`user1`, `user2`, `admin`), eighteen seeded items and two Compose entry points.

## Constitution Check

**Before research**: `.specify/memory/constitution.md` is an unratified scaffold; no active constitutional rules are available to apply. Planning uses the explicit user constraints and coding workflow instead. Constitution ratification is not in scope.

**After design**: Two apps and one contract library; no new orchestrator, duplicate schema, unscoped API read, upstream write, or package publish step. No design exception requested. See [API contract](contracts/read-api.md), [data model](data-model.md), and [validation](quickstart.md).

## Project Structure

```text
specs/001-querry-kit-workboard/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/read-api.md
└── quickstart.md

apps/
├── api/                     # Nest modules, Prisma, seed, Dockerfile, API tests
└── app/                     # Nuxt dashboard, query UX, Dockerfile, UI tests
libs/contracts/              # Shared Zod wire schemas and inferred TypeScript types
vendor/{nest,nuxt,nuxt-ui}/   # Ignored staged source, never committed
scripts/                     # Source staging, builds, and provenance checks
README.md                    # Start here and follow one read request end to end
docs/coding-guidelines.md
docs/adopt-querry-kit.md     # Copy, adapt, or integrate into an existing app
pnpm-workspace.yaml
pnpm-lock.yaml
compose.dev.yml              # PostgreSQL only
compose.yml                  # PostgreSQL, API and Nuxt app
```

**Structure Decision**: A plain pnpm workspace is sufficient. Nuxt serves the CRM-inspired responsive dashboard shell, with sidebar, navbar, account switcher, task toolbar and table. Use `UDashboardGroup`, `UDashboardSidebar` and `UDashboardPanel`, sky/zinc semantic tokens, and Tabler icons. Site styles and data stay local; no CRM code, assets or dependency are needed.

## Design

### Package integration and Compose

Implement the [staged source strategy](research.md#local-package-provenance). Use documented sibling defaults plus optional explicit paths. Restaging may only replace owned vendor staging paths; never write to source checkouts. Fail on missing sources, wrong package IDs or unsafe/invalid refs. Use the example lockfile; dependency-manifest experiments may require an explicit local lock refresh and cannot silently change the Compose baseline. Treat watch/HMR as optional unless demonstrated; restage, rebuild and restart must work.

`compose.dev.yml` starts only PostgreSQL with a loopback port for host development. `compose.yml` builds both apps from the example checkout and pinned Git sources with a frozen lockfile, uses internal DB/API networking, and binds only the web port to host loopback. Use the Nuxt same-origin API proxy so sessions work without exposing the API or database ports. Do not pass the builder's absolute staging paths to runtime; smoke-test the final images for missing workspace exports. Run stack startup/seed/HTTP checks in GitHub Actions as validation for this private example, without a release or publishing job. No CI or release configuration exists yet in this repo.

### Query capability coverage

| Area | UI demonstration | Direct API verification |
| --- | --- | --- |
| Nest `ResourceQuery`, fields and Zod query helpers | Task list and detail; project, owner/profile and label projections | Requested vs default fields, nested/invalid fields, readable vs inaccessible ID, Fastify parser, generated OpenAPI; scoped `findOne`, `findUnique`, and unpaginated `findMany` alternatives covered at the service boundary without exposing redundant routes |
| Nest `QueryService`, CASL integration | Account switch: `user1` and `user2` see different owned rows; only `admin` sees all rows and internal columns | Scoped list/detail/lookup/count/aggregate/group; same-role cross-account denial; query operands and projection checked separately |
| Nuxt `createApiClient`, `useModuleApi`, `useTable`, `useAutocomplete` | Search, project lookup, AND/OR filters, multi-sort, column order/visibility/pinning, paged or infinite loading where supported | Typed request serialization, response validation, page totals and stable tie-breaking |
| Nuxt `useGroupedTable` and Nuxt UI toolbar/group components | Reorder status/priority levels, counts, expand/retry/load more, optional estimated-hour metrics | Nested branch filters, two-key grouping, `having`, group ordering/paging, count and all four optional metric operators |
| Nuxt UI table controls | Filter, sort, column options, page size, summary and pagination; use Nuxt UI `UTable` for rendering | Keyboard and responsive checks; controls reflect the active account |

Match the inspected public APIs; do not force every alias or internal helper into the demo. Link capabilities to examples or tests in the README. Keep the aggregate toggle app-owned, since the grouped composable does not expose arbitrary aggregate values on group nodes.

### Security and data boundaries

Use a signed short-lived demo session cookie, resolved server-side to the selected seeded account and CASL ability. Keep the demo identity provider separate from reusable policy and query wiring. Use Querry Kit CASL helpers where applicable to build the scoped Prisma conditions and filter projected output. Validate the original query's field and operator access before computing anything. Test allowed actions as well as denial, including inaccessible project/label lookup, nullable relations, and both same-role and cross-role account changes during in-flight requests. The UI's role-aware controls are not enforcement.

### Coding standards and acceptance

Apply the coding-guidelines baseline to new files: ESLint flat config with Vue/TypeScript parsing, Prettier with two spaces, single JS strings, semicolons, trailing commas, 120 columns and LF; Vue template/script/style block ordering and canonical attribute/tag formatting; JSDoc/TSDoc on handwritten functions, methods/callbacks/composables and exported types. Use real check-only `lint`, `format:check`, `typecheck` and `test` scripts separate from fixes; omit generated/vendor files. Verify formatter convergence on representative TS and SFC fixtures and document any manual documentation coverage. See [quickstart](quickstart.md) for runtime proof, including contract, database and Vue acceptance.

### Developer walkthrough and template reuse

- Favor descriptive names, small domain-focused files and explicit integration steps over generic factories or deeply nested chains. Keep the default query path easy to read; isolate setup, policy and grouping adapters behind named entry points.
- Add short comments above key integration blocks: explain why the block is needed, what the example owns, and what to change when adopting it. Use direct URLs in `@see` tags for documented declarations or adjacent comments for setup blocks. Do not narrate obvious lines or duplicate the guides.
- Link the README walkthrough to real source files in execution order: shared Zod contract → Fastify parsing/validation → CASL-scoped service and projection → Nuxt API client → table/group UI. Include a runnable request and expected result using the fixtures.
- In `docs/adopt-querry-kit.md`, cover both copying the workspace and integrating the same code paths in an existing project. Document rename/environment setup, pinned and local sources, changing a public field end to end, migration and check commands, and replacing demo identity, seed, secrets and local defaults before real deployment. No generator, GitHub template setting, or production auth implementation is needed.
- In review, have a developer follow the guide in a disposable copy. Check comment explanations manually and verify the direct URLs in comments and docs.

| Code block | Direct upstream references |
| --- | --- |
| Fastify query parsing, normalization and validation | [Bootstrap](https://querry-kit.github.io/querry-kit/docs/nest/guide/main-bootstrap/), [Query Transform](https://querry-kit.github.io/querry-kit/docs/nest/concepts/query-transform/) |
| Scoped reads, computed results and field projection | [Query Service](https://querry-kit.github.io/querry-kit/docs/nest/api/query-service/), [CASL](https://querry-kit.github.io/querry-kit/docs/nest/api/casl/), [Fields](https://querry-kit.github.io/querry-kit/docs/nest/concepts/fields/) |
| Transport and OpenAPI | [OpenAPI](https://querry-kit.github.io/querry-kit/docs/nest/api/openapi/), [Controller Contract](https://querry-kit.github.io/querry-kit/docs/nuxt/guide/controller-contract/) |
| Nuxt API client, table state and project lookup | [API Client](https://querry-kit.github.io/querry-kit/docs/nuxt/api/api/), [Table API](https://querry-kit.github.io/querry-kit/docs/nuxt/api/table/), [Autocomplete](https://querry-kit.github.io/querry-kit/docs/nuxt/guide/autocomplete/) |
| Toolbar and server grouping | [Toolbar](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/toolbar/), [Grouping](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/grouping/) |

## Complexity Tracking

Not applicable; no active constitution violations. Pinned staging plus one deliberate build-time dependency normalization avoids adding source copies or upstream maintenance to the example.
