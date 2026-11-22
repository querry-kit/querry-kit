# Adopt Querry Kit

The Workboard is a copyable starter, not a production authentication template. It uses two apps and a shared validation library. Start with the [README walkthrough](../README.md#follow-one-read-request) to see how a request crosses those boundaries.

## Copy the workspace

1. Clone this repository into a new directory and point the copy at your own Git repository. Keep a copy of the original as a working reference.
2. Run the [standalone demo](../README.md#try-the-standalone-demo) before changing the code. Verify that you can switch to `user1` in the navbar, browse a task, and open the API reference.
3. Rename the workspace and apps in `package.json`, `apps/api/package.json` and `apps/app/package.json`. If you rename `@workboard/contracts`, update its directory manifest, imports and workspace dependencies together. Update the `--filter` names in root scripts, Dockerfiles and any CI definitions; regenerate the lockfile with `pnpm install` and check it in.
4. Set environment variables for the API and Nuxt server. See [API defaults](../apps/api/.env.example) and [Nuxt defaults](../apps/app/.env.example). The committed Compose files deliberately use local defaults and publish the demo only on loopback.
5. Keep the [pinned or local source workflow](../README.md#develop-against-local-querry-kit-packages) while developing the Querry Kit packages. `pnpm sources:check` verifies that the app and Nuxt UI share the same workspace Nuxt package.

## Replace the demo-only pieces

| Example code                                              | What to change for your application                                                                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/demo/` and `apps/app/app/components/demo/`  | Replace passwordless personas with your authentication provider. Keep the separation between server-verified identity, role, and account or tenant scope.                       |
| `apps/api/src/auth/workboard-ability.ts`                  | Replace ownership and field rules with your policy. Apply row rules before querying; reject unreadable filter, sort, group, and metric operands. Do not rely on hidden columns. |
| `apps/api/src/database/fixtures.ts` and `seed.ts`         | Remove demo data from normal application startup. Introduce your domain migrations and a separate test-fixture workflow.                                                        |
| `compose*.yml`, cookie settings, and `.env.example` files | Replace local credentials, ports, origins and secret handling with your deployment setup. Do not expose the demo selector publicly.                                             |

Keep the [coding guidelines](coding-guidelines.md), shared transport validation, request-to-response checks, and scoped query examples as starting points.

## Change one public field end to end

Try this in a disposable copy with its own PostgreSQL instance. Seed data is added only to an empty database.

1. Follow [Bootstrap](../README.md#bootstrap) in the copy. Start its database using a fresh Compose project, volume and unused port. Set `DATABASE_URL` for the API and Prisma CLI. Run `pnpm --filter @workboard/api db:migrate` to establish the baseline without running the API or seed.
2. Add an optional `summary String?` to `Task` in [schema.prisma](../apps/api/prisma/schema.prisma). From the workspace root, review the SQL Prisma would produce:

   ```sh
   pnpm --filter @workboard/api exec prisma migrate diff \
     --from-config-datasource --to-schema prisma/schema.prisma --script
   ```

   Create a new timestamped migration under `apps/api/prisma/migrations/` containing the reviewed `ALTER TABLE "WorkItem" ADD COLUMN "summary" TEXT;` statement. Do not edit the applied migration or reset the database. Run `pnpm --filter @workboard/api db:migrate`.

3. Add a `summary` value in the [fixture builder](../apps/api/src/database/fixtures.ts) for a visible sample such as `u1-1`. In [session.ts](../libs/contracts/src/session.ts), add `summary` to the supported projection fields. In [tasks.ts](../libs/contracts/src/tasks.ts), add `summary: z.string().nullable().optional()` to `taskSchema`. `null` means the record has no summary; absent means the caller did not select the field.
4. Allow `summary` in the [CASL public field rule](../apps/api/src/auth/workboard-ability.ts). Add `summary: true` to the [projection schema](../apps/api/src/tasks/task-projection.ts) and map `summary: row.summary` into its DTO. If you only intend to display the field, do not add it to the filter, sort or grouping schemas.
5. Add a `summary` column with `id` and `accessorKey` set to `summary` in [TaskTable.vue](../apps/app/app/components/tasks/TaskTable.vue). Its visibility then drives the API field selector. Add a read assertion for `fields=id,summary` while signed in as `user1`.
6. Run `pnpm build`, `pnpm lint`, `pnpm format:check`, and `pnpm typecheck`. Start `pnpm dev` with the copy's database settings. Switch to `user1` in the navbar, verify the summary on the visible row, and confirm that a user2-owned row is still unavailable. The field requires no changes in any upstream package checkout.

## Bring the integration into an existing app

1. Pick one resource and define its request, projection and response schemas in a framework-independent Zod module. Import that module from the server and browser.
2. Adapt the [Nest read service](../apps/api/src/tasks/tasks.service.ts) to your resource delegate. Keep normalization and validation before the query, CASL scope in the query, and explicit mapping/projection before returning data. See the upstream [Query Service](https://querry-kit.github.io/querry-kit/docs/nest/api/query-service/), [Fields](https://querry-kit.github.io/querry-kit/docs/nest/concepts/fields/) and [CASL](https://querry-kit.github.io/querry-kit/docs/nest/api/casl/) docs.
3. Register the [Nuxt UI module](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/guide/getting-started/) and connect [the Nuxt API client](../apps/app/app/plugins/querry-kit.ts) to your transport. Keep the default `/api/v1` base when that is your contract; Workboard overrides it because its demo API is unversioned.
4. Render `useTable` state with your own table component and the [toolbar controls](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/toolbar/). Use the [project lookup](../apps/app/app/components/tasks/ProjectLookup.vue) for autocomplete. Add [server-backed grouping](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/grouping/) only after the list and account boundaries work.
5. Test the actual client/server wire format, including requested nested fields, absent versus null properties, invalid inputs, inaccessible IDs, and requests completing after an identity change.
