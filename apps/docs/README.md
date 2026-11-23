# Querry Kit documentation

This private workspace app serves the [documentation site](https://querry-kit.github.io/querry-kit/). Edit package guides under `content/docs/` and interactive demos under `app/`. Open documentation issues and PRs in [the monorepo](https://github.com/querry-kit/querry-kit/issues); send security reports through the [central security policy](../../SECURITY.md).

From the workspace root, install with `pnpm install --frozen-lockfile` and build the local packages with `pnpm build:packages`. Run `pnpm docs:lint`, `pnpm docs:typecheck` and `pnpm docs:test` before submitting a change. The browser suite exercises the generated site under its `/querry-kit/` Pages prefix on desktop and mobile.

<!-- Temporary post-rule docs-only verification. -->
