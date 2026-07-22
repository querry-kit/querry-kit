# Querry Kit <!-- omit in toc -->

Querry Kit is a set of complementary building blocks for relational, type-safe NestJS APIs and Nuxt interfaces. This repository is the project entry point and contains a complete, locally runnable reference application.

📖 Documentation: https://querry-kit.github.io/querry-kit/

## 🌐 Querry Kit Ecosystem

| Repository                                                     | Role in the reference application                                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [`@querry-kit/nest`](https://github.com/querry-kit/nest)       | NestJS controller helpers, `ResourceQuery`, DTO-backed `fields` projections, pagination, query pipes, and OpenAPI decorators |
| [`@querry-kit/nuxt`](https://github.com/querry-kit/nuxt)       | Axios client, typed resource clients, and the headless `useTable` composable                                                 |
| [`@querry-kit/nuxt-ui`](https://github.com/querry-kit/nuxt-ui) | Nuxt module with a toolbar, filters, sorting, column options, and pagination for Query Kit tables                            |

## 📚 Table of Contents <!-- omit in toc -->

- [🌐 Querry Kit Ecosystem](#-querry-kit-ecosystem)
- [📦 Install](#-install)
- [🧩 Usage](#-usage)
- [📖 Documentation](#-documentation)
- [🛠 Development](#-development)

## 📦 Install

Prerequisites: Node.js 24 and pnpm 11. The three core repositories must be available as sibling directories next to this checkout, as they are in the Querry Kit organization. The example packages intentionally use `link:` specifications so library changes are immediately available in the reference apps.

```sh
pnpm install

cd examples/workboard/api
cp .env.example .env
docker compose up -d
pnpm prisma:generate && pnpm db:push && pnpm db:seed
```

## 🧩 Usage

Workboard is a product-team workspace. Its data model connects:

- `Workspace` → `Project` → `Task` (two one-to-many relations)
- `Workspace` → `Member` (one-to-many)
- `Task` ↔ `Label` (many-to-many)

The Nest API follows a production-oriented `config`, `prisma`, and domain-module structure. It uses the dedicated Prisma model in `examples/workboard/api/prisma/schema.prisma`; the Nuxt app loads the project list with `useTable` and renders `QuerryKitTableToolbar` and `QuerryKitTablePagination`.

Start the API and web app in separate terminals:

```sh
pnpm --filter @querry-kit/example-workboard-api dev
pnpm --filter @querry-kit/example-workboard-web dev
```

| Application | API                     | Web                     | OpenAPI                      |
| ----------- | ----------------------- | ----------------------- | ---------------------------- |
| Workboard   | `http://localhost:3101` | `http://localhost:3201` | `http://localhost:3101/docs` |

For a separately deployed API, set `NUXT_PUBLIC_API_BASE=https://api.example.test` in the corresponding web package.

## 📖 Documentation

- [Querry Kit overview](https://querry-kit.github.io/querry-kit/)
- [@querry-kit/nest documentation](https://querry-kit.github.io/nest/)
- [@querry-kit/nuxt documentation](https://querry-kit.github.io/nuxt/)
- [@querry-kit/nuxt-ui documentation](https://querry-kit.github.io/nuxt-ui/)

Run the VitePress website locally:

```sh
pnpm docs:dev
```

Build the website:

```sh
pnpm docs:build
```

## 🛠 Development

```sh
pnpm lint
pnpm docs:build
pnpm examples:check
pnpm examples:build
```

The Workboard API includes a PostgreSQL Compose service, a Prisma schema, and an idempotent seed for local development.
