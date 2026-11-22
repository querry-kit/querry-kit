# Querry Kit <!-- omit in toc -->

Querry Kit is a set of complementary building blocks for relational, type-safe NestJS APIs and Nuxt interfaces. This repository is the project entry point and contains a complete, locally runnable reference application.

📖 Documentation: https://querry-kit.github.io/querry-kit/

## 🌐 Querry Kit Ecosystem

| Repository                                                     | Role in the reference application                                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [`@querry-kit/nest`](packages/nest)       | NestJS controller helpers, `ResourceQuery`, DTO-backed `fields` projections, pagination, query pipes, and OpenAPI decorators |
| [`@querry-kit/nuxt`](packages/nuxt)       | Axios client, typed resource clients, and the headless `useTable` composable                                                 |
| [`@querry-kit/nuxt-ui`](packages/nuxt-ui) | Nuxt module with a toolbar, filters, sorting, column options, and pagination for Query Kit tables                            |

## 📚 Table of Contents <!-- omit in toc -->

- [🌐 Querry Kit Ecosystem](#-querry-kit-ecosystem)
- [📦 Install](#-install)
- [🧩 Usage](#-usage)
- [📖 Documentation](#-documentation)
- [🛠 Development](#-development)

## 📦 Install

Install Node 26.13+ (26.x) and the pnpm version pinned in `package.json`. From the monorepo root:

```sh
pnpm install --frozen-lockfile
pnpm build
```

## 🧩 Usage

[Workboard](examples/workboard/README.md) runs PostgreSQL, a Nest/Fastify API and a Nuxt dashboard for account-scoped projects and tasks. From `examples/workboard/`, run `docker compose up -d --build --wait`; open the [dashboard](http://127.0.0.1:3201) or [OpenAPI reference](http://127.0.0.1:3201/docs). The same README describes running the API and app on the host with a separate development database.

For the original workspace/member/task/label graph and its UUID API, see the [project projection lesson](apps/docs/content/docs/nest/guide/example-app.md#historical-workboard-project-projection).

## 📖 Documentation

- [Querry Kit overview](https://querry-kit.github.io/querry-kit/)
- [@querry-kit/nest documentation](https://querry-kit.github.io/querry-kit/docs/nest/)
- [@querry-kit/nuxt documentation](https://querry-kit.github.io/querry-kit/docs/nuxt/)
- [@querry-kit/nuxt-ui documentation](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/)

Run the central Nuxt documentation website locally:

```sh
pnpm docs:dev
```

Build the website:

```sh
pnpm docs:build
```

The documentation is a statically generated Nuxt 4 application in `apps/docs`. It contains the canonical documentation for `@querry-kit/nest`, `@querry-kit/nuxt`, and `@querry-kit/nuxt-ui` under `/docs/nest`, `/docs/nuxt`, and `/docs/nuxt-ui`.

### Package changelogs

The docs build reads `packages/{nest,nuxt,nuxt-ui}/CHANGELOG.md` from the same commit as the site. Generated copies are ignored.

## 🛠 Development

```sh
pnpm lint
pnpm docs:lint
pnpm docs:typecheck
pnpm docs:test
pnpm docs:build
pnpm examples:check
pnpm examples:build
```

The Workboard API includes a PostgreSQL Compose service, a Prisma schema, and an idempotent seed for local development.

Documentation browser tests use the emulated browser's user agent to select the search shortcut (`Meta+K` on macOS, `Control+K` otherwise), independently of the test runner's operating system.

Dependency maintenance updates supported versions and reuses the Nuxt UI security patches for the docs toolchain. The workspace also pins patched versions of Effect for Prisma and of glob, minimatch, and node-forge for the toolchain.

The docs workspace pins fixed transitive dependencies and restores the legacy `simple-git` default export for Nuxt Devtools while retaining version 4 security guards.

The docs theme restores saved settings before persisting changes and works when browser storage is unavailable. Querry Kit packages do not require a direct TanStack Table peer; table renderers own their version. Query parsing and CASL field filtering reject prototype paths and respect explicit field denials.

## Development toolchain

Use Node.js 26.13.0 LTS and the pnpm version pinned in `package.json`. Changesets versions the three libraries independently; documentation, Workboard and contracts stay private. Pull requests run lint, type checks, documentation tests and the static build before deployment.

### Dependency maintenance

Documentation and examples use Nuxt 4.6.4 and Vue 3.5.46; the Workboard API uses NestJS 12.6.0 and Swagger 12.1.2. Nuxt 4.6.4 tightens production error disclosure and Nitro caching rules; see the [upstream behavior changes](https://github.com/nuxt/nuxt/releases/tag/v4.6.4).

Dependency refreshes retain pnpm 11.28.9, the existing TypeScript 6/7 split, and security overrides. Candidates published less than 24 hours ago are deferred; dependency major migrations are outside this update.

## Group-by documentation

The grouped-table demo exercises local library builds using synthetic records and an in-browser Axios adapter. It does not require a Workboard database. Run `pnpm build:packages` after a library edit, then `pnpm docs:test` to exercise the change in the browser.
