---
title: Example
description: Run Workboard with Docker Compose or develop against all three Querry Kit packages in one checkout.
---

# Workboard example

Workboard combines a NestJS/Fastify API, PostgreSQL, shared Zod contracts, and a Nuxt dashboard. Explore the Projects and Tasks tables, account-scoped reads, searchable filters, sorting, grouping and aggregates, or create and update demo records.

## Try the dashboard

**Next (workspace preview):** These examples run the libraries at the checked-out revision. Use the [package changelog](/docs/nuxt-ui/changelog) to check what is available in a published release.

Open **Tasks** or **Projects**. Both start with 10 rows per page. The breadcrumb bar contains the create action when your account can create records. Below 640 px it becomes a plus icon, and search becomes a magnifier. On a task detail page, the **Tasks** breadcrumb takes you back to the same project filter.

- **Find and configure rows:** Press **Shift+/** to search, **Shift+F** to filter, **Shift+S** to sort, or **Shift+O** for column options. **Shift+N** opens the create dialog when available. Try the [interactive toolbar](/docs/nuxt-ui/components/toolbar).
- **Group tasks:** Press **Shift+G** and choose **Status**, then **Priority**. Expand a group to see its tasks. Group counts and estimated-hour sums cover the full matching group. Grouping columns stay pinned on desktop and scroll with the table below 640 px.
- **Act on a selection:** Select a row or a task group. A separate toolbar shows the selected count on the left and bulk actions on the right. Deletion requires confirmation.
- **Change how rows load:** In the Tasks footer, choose **Pagination** or **Infinite scroll**. The **Items per page** menu changes the page size. The footer keeps the controls on one line and shows the row range when it fits.

## Docker Compose quick start

Install Git and Docker with Compose. Clone the monorepo and start the full stack:

```sh
git clone https://github.com/querry-kit/querry-kit.git
cd querry-kit/example
docker compose up -d --build --wait
```

Open the [dashboard](http://127.0.0.1:3201) or the [API reference](http://127.0.0.1:3201/docs). The app starts as `admin`. Switch to `user1` or `user2` in the navbar to explore scoped data. The container stack contains the database, API, and dashboard. Set `WORKBOARD_APP_PORT` before starting Compose to change the host port.

Stop the stack while keeping its database volume:

```sh
docker compose down
```

## Run the development stack locally

From the checkout, install Node.js 26.13.0 or a newer Node 26 patch and the pnpm version pinned in `package.json`. Docker Compose runs PostgreSQL. Stop the standalone stack first if it is already using the dashboard port.

```sh
pnpm -w install --frozen-lockfile
pnpm -w build
docker compose -f compose.dev.yml up -d --wait
pnpm --filter @workboard/api start
```

The API uses the workspace packages, applies migrations and seeds an empty database, then listens on `127.0.0.1:3101`. Open another terminal in `example` and start Nuxt:

```sh
pnpm --filter @workboard/app dev
```

Use the same dashboard and API reference links. To stop development, exit both app processes with Ctrl+C and run:

```sh
docker compose -f compose.dev.yml down
```

For local library development, alternate ports, and CI commands, see the [Workboard README](https://github.com/querry-kit/querry-kit/tree/main/example#readme). See the [Nest](/docs/nest), [Nuxt](/docs/nuxt), and [Nuxt UI](/docs/nuxt-ui) references for the integration APIs.
