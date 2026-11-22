# Querry Kit Workboard

A reference workspace for a NestJS/Fastify API and Nuxt 4 dashboard using Querry Kit. It uses a shared Zod contracts package.

## Try the standalone demo

From a checkout of this repo with Docker Compose and network access:

```sh
docker compose up -d --build --wait
```

Open `http://127.0.0.1:3201` to start as `admin`, or open `http://127.0.0.1:3201/docs` for the API reference. The stack runs PostgreSQL, Fastify and Nuxt; only the Nuxt port is exposed on loopback. No sibling checkouts or host Node/pnpm installation are needed. Set `WORKBOARD_APP_PORT` to use a different host port and open the matching `127.0.0.1` URL.

Use `docker compose down` to stop the stack while retaining the data. A normal restart does not add or overwrite fixtures.

## Bootstrap

Install Node.js 26.13.0 or a newer Node 26 patch, pnpm 11.28.9, and Git. Then run:

```sh
node scripts/stage-querry-kit.mjs
pnpm install --frozen-lockfile
pnpm build
```

Staging runs before the package manager because the workspace dependencies must exist before installation. It fetches the exact revisions in `scripts/querry-kit-sources.json` into the ignored `vendor/` directory. The example imports them via pnpm `workspace:` dependencies; it does not download Querry Kit packages from npm. Do not place personal checkouts in `vendor/`.

See the [Querry Kit documentation](https://querry-kit.github.io/querry-kit/) for package APIs.

Contributors: see the [coding guidelines](docs/coding-guidelines.md) for check and format commands.

## Start the API locally

After bootstrap, start the local database and the built API:

```sh
docker compose -f compose.dev.yml up -d --wait
pnpm --filter @workboard/api start
```

Only PostgreSQL runs in the development Compose file. The API applies the checked-in migration and seeds 50 projects and 1,000 tasks when all application tables are empty. It listens on `127.0.0.1:3101` by default; `GET /api/health/ready` confirms initialization. To change the database connection, set `DATABASE_URL` for the API and Prisma CLI.

## Demo accounts

New browser sessions start as `admin`. Use the navbar to switch between `user1`, `user2`, and `admin` without a password. The two regular accounts share a role but have different ownership scopes. Only `admin` can read internal notes and costs.

Use **Switch demo account** in the dashboard navbar. Switching closes details, clears the active project filter, and cancels reads from the previous account. Try the shared Workboard project under both regular accounts: they get different task IDs despite having the same role.

```sh
curl --fail --cookie-jar workboard.cookies \
  -H 'Origin: http://127.0.0.1:3201' -H 'Content-Type: application/json' \
  --data '{"login":"user1"}' http://127.0.0.1:3101/api/demo/session
```

`DEMO_ORIGIN` configures the browser origin accepted by the API. For local HTTP, `localhost` and `127.0.0.1` are both accepted on the configured port. All other origins must match `DEMO_ORIGIN` exactly. The session expires in 30 minutes and is invalidated on each API restart unless `DEMO_SESSION_SECRET` is configured. Passwordless persona selection is for synthetic local data only, not for production.

### Read a projected list

With the cookie from the previous request, ask for public fields on open tasks and a nested project title:

```sh
curl --fail --cookie workboard.cookies --get \
  --data-urlencode 'where={"status":"OPEN"}' \
  --data-urlencode 'fields=id,title,project{title}' \
  --data-urlencode 'perPage=10' http://127.0.0.1:3101/api/tasks
```

As `user1`, the list contains `u1-1` and `u1-2` with `meta.itemCount: 2`. `GET /api/tasks/count` returns the count as a JSON number. Use `/docs` to explore projections, lookups, and the validated query shapes.

### Read groups and metrics

Grouping returns only group keys unless you opt in to metrics. For example, request the two-level combination of status and priority, plus counts and estimated hours:

```sh
curl --fail --cookie workboard.cookies --get \
  --data-urlencode 'by[0]=status' --data-urlencode 'by[1]=priority' \
  --data-urlencode '_count[_all]=true' --data-urlencode '_sum[estimatedHours]=true' \
  http://127.0.0.1:3101/api/tasks/group-by
```

`GET /api/tasks/aggregate` accepts the same `where` filter and metric selectors without `by`. Both endpoints apply the active account's CASL scope before the database computes results.

On **Tasks**, use **Group by** to add one or more grouping fields, then expand a group. Select **Pagination** or **Infinite scroll** in the footer button group. Group counts and estimated-hour sums cover every matching authorized task.

### Open the dashboard

With the local API running, start the Nuxt app:

```sh
pnpm --filter @workboard/app dev
```

Open `http://127.0.0.1:3201` and switch to `user1` in the navbar. **Tasks** and **Projects** show 10 rows per page by default. Open **Projects** to search by title or slug, filter and sort by task count, or open a project’s task list. Counts include all tasks visible to the active account, regardless of task status. The **Tasks** toolbar provides search, structured filters, multi-sort, and column options. The project picker in **Filter** searches scoped server results and restores the selected project when you reload its URL. Open a row to see its projected details.

### Editing projects and tasks

On **Projects**, the admin can create projects and edit their titles and slugs. A project can be deleted once it has no tasks. On **Tasks**, choose **New task** to create a task, then open its details to edit or delete it. Regular accounts can manage their own tasks in projects they can see. The admin can manage any task, choose a demo owner at creation, and edit internal notes and costs.

The API provides `POST /api/projects`, `PATCH /api/projects/:id`, and `DELETE /api/projects/:id`, with the same operations under `/api/tasks`. Writes require the signed demo cookie and the configured `Origin` header. See `/docs` for request fields and responses.

The Nuxt server forwards `/api` and `/docs` to `NUXT_API_ORIGIN` (default `http://127.0.0.1:3101`). The browser always uses the Nuxt origin so the demo cookie can remain HttpOnly without a CORS setup.

## Develop against local Querry Kit packages

Place `nest`, `nuxt`, and `nuxt-ui` next to the example checkout, or set `QUERRY_KIT_NEST_SOURCE`, `QUERRY_KIT_NUXT_SOURCE`, and `QUERRY_KIT_NUXT_UI_SOURCE` to their repository directories.

```sh
node scripts/stage-querry-kit.mjs --local
pnpm install --frozen-lockfile
pnpm sources:build
pnpm sources:check
docker compose -f compose.dev.yml up -d --wait
pnpm dev
```

The staging script copies your current tracked and unignored edits without changing the source repositories. It builds Nest and Nuxt first, then Nuxt UI against the same local Nuxt package as the app. After a package edit, stop the apps, restage, reinstall and rebuild, then restart `pnpm dev`. Package hot reload is not required.

The pinned standalone build and its lockfile remain the baseline. If a local branch changes dependency manifests, the frozen install rejects lockfile drift. Use a separate example checkout and refresh its lockfile deliberately for dependency experiments; do not replace the pinned baseline with experiment results. `.npmrc` prevents Querry Kit from falling back to the public registry.

## Follow one read request

1. [`libs/contracts/src/tasks.ts`](libs/contracts/src/tasks.ts) defines the task filters and response. Both apps import the same Zod schemas and inferred types.
2. [`query-parser.ts`](apps/api/src/query/query-parser.ts) normalizes the Fastify query without turning opaque string values into numbers. [`query-docs.ts`](apps/api/src/query/query-docs.ts) builds OpenAPI from the same input and output schemas.
3. [`tasks.service.ts`](apps/api/src/tasks/tasks.service.ts) calls Query Kit's resource helper with a CASL-scoped service. [`task-projection.ts`](apps/api/src/tasks/task-projection.ts) maps the Prisma joins and removes unreadable fields.
4. [`querry-kit.ts`](apps/app/app/plugins/querry-kit.ts) configures the Nuxt client, validates incoming data and cancels account-bound reads when the user switches.
5. [`TaskTable.vue`](apps/app/app/components/tasks/TaskTable.vue) binds `useGroupedTable` to the Nuxt UI controls and loads groups on demand. [`ProjectLookup.vue`](apps/app/app/components/tasks/ProjectLookup.vue) handles scoped autocomplete.

Key integration blocks link directly to their Querry Kit docs. To use this repo as a starter or introduce Querry Kit into an existing app, see [Adopt Querry Kit](docs/adopt-querry-kit.md).

## Verify changes

After bootstrapping, run `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm typecheck`, and `pnpm sources:check`.

- `pnpm test:api` runs migrations, seed and live Fastify integration against a disposable PostgreSQL Compose project. It requires free loopback ports `55463` and `35463` (or `WORKBOARD_TEST_DB_PORT` and `WORKBOARD_TEST_API_PORT`).
- `pnpm test:web` runs Playwright against a running test stack initialized with `WORKBOARD_SEED_PROFILE=compact` on the API. Set `WORKBOARD_TEST_APP_URL` if the app URL differs from `http://127.0.0.1:3201`. Install Chromium first with `pnpm --filter @workboard/app exec playwright install --with-deps chromium` on supported Linux hosts.
- `pnpm test:compose` uses Docker, curl and jq to build the standalone stack without a Docker build cache, run browser tests, and compare seed IDs across a restart. It uses a separate volume and loopback port `35465` by default; override that port with `WORKBOARD_TEST_COMPOSE_PORT`.
