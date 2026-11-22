# Quickstart and Acceptance: Querry Kit Workboard

These are the command contracts for implementation. The scripts and Compose files do not exist yet.

## Standalone test stack

Prerequisites: Git, Docker with Compose v2, and network access to pinned Git sources and third-party dependencies. Do not mount sibling checkouts or use an existing package cache for the cold-build proof.

```bash
docker compose config
docker compose up --build --wait
curl -fsS http://127.0.0.1:3201/api/health/ready
```

Open `http://127.0.0.1:3201`, select `user1`, and confirm the three Compose services are running but only the app is exposed to the host. Open `/docs` to inspect the API contract. Stop and start the same stack and verify fixture IDs and counts are unchanged. Exercise failed seed and restart against an isolated dataset, not a shared database. Test a nonempty custom fixture separately: initialization must neither overwrite nor append demo rows.

## Local package development

Prerequisites: Node `26.13.0`, pnpm `11.28.9`, Compose, and checked-out sibling `nest`, `nuxt`, and `nuxt-ui` directories (or explicit alternative source paths).

```bash
node scripts/stage-querry-kit.mjs --local
pnpm install --frozen-lockfile
pnpm sources:build
docker compose -f compose.dev.yml up -d --wait
pnpm dev
```

Use the corresponding bootstrap command documented in the implementation README if staging needs to run before dependencies are installed. `pnpm dev` starts both apps, with migration and seed completed by the API before readiness. The development Compose file must contain only `db`. Verify an observable change from each sibling reaches the consumer after restaging, rebuilding and restarting; do not require watch or HMR. Check the lockfile and install trace, reject registry resolutions or requests for `@querry-kit/*`, and verify the frontend and Nuxt UI resolve the same staged Nuxt package. Confirm the standalone build runs end to end with cold storage and no sibling checkouts.

## Validation cases

| Case | Expected evidence |
| --- | --- |
| Relational list and detail | See owner profile, containing project and reused labels. Test nested projection, missing and null fields, select/order/hide/pin columns, stable sort and page totals across page changes. |
| Filter and autocomplete | Combine scalar and relation filters, AND/OR and multi-sort; search for a visible project and rehydrate its selected value. Null assignees and empty results render correctly. |
| Row and field security | `user1` and `user2` each see six distinct owned IDs; `admin` sees all eighteen rows. Verify same-role cross-account denial and scoped project/label lookups. Both detail routes return `404` for missing or inaccessible rows. Neither user can project, sort, filter, group or calculate metrics on admin-only fields. Verify raw HTTP and positive admin controls, not only the UI. |
| Groups without metrics | Group by status, then priority, reorder and expand, and load more at root/child/leaf. Counts cover the authorized filtered dataset. Validate both pagination and incremental loading. No extra metric request when disabled. |
| Groups with metrics | Enable metrics, expand `OPEN`, and check the independent fixture counts/totals in [data-model.md](data-model.md). Verify narrowing filters changes both counts and metrics. Direct HTTP tests cover two-key group, `having`, and field denial. |
| Login and stale requests | Anonymous returns `401`; only the three login names are accepted. Switch `admin` → `user1` and `user1` → `user2` while queries are pending and verify that no stale rows, metrics, columns, options or selection survive. Check error/retry and rapid-switch serialization. |
| Runtime contract | Assert Fastify parsing, Zod input/output, emitted OpenAPI definitions and actual Nuxt serialization against the same request matrix; include malformed requests and recognized forbidden operands. |
| UI acceptance | Verify keyboard role selection, focus and labels, group retry, empty/pending/error states, light/dark and widths 375, 768 and 1280 px. Only the table may scroll horizontally at narrow widths. Use English labels; do not add a locale for testing. |
| Developer adoption | In a disposable copy, follow `docs/adopt-querry-kit.md` to adapt a public field through storage, the shared Zod schema, projection and UI. Run the documented checks without editing upstream. Review the README trace and open each linked upstream page from its source comment. Confirm the guide distinguishes demo auth and seed from reusable integration code. |

Planned project checks: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm build`, real PostgreSQL integration and browser E2E against the Compose stack. Validate positive and negative lint/format fixtures; two fix passes must converge byte-for-byte. Review the initial migration SQL, test constraints and data preservation on restart. Do not count mocked DB/API tests as runtime evidence.
