# Implementation baseline — #59

`main` at `fcbcee5ff11e2783ec8c95b0ae86c30e3869a7c5` contains #58 and `example/apps/web/package.json`. The issue branch starts with planning commit `a782369`. Spec Kit resolved the 002 feature and its tasks, research, contracts, model and quickstart. No feature checklist or implementation hooks were present.

Node `26.13.1`, pnpm `11.28.9`. `pnpm -r list --depth -1 --json` reports eight projects: private root, docs, Workboard API, app and contracts; public `@querry-kit/nest`, `@querry-kit/nuxt` and `@querry-kit/nuxt-ui`.

T002: frozen install, `pnpm build:packages` and `pnpm verify:release-plan` passed. Rehearsal uses temporary Git copies, offline lock refresh, fake registry dispositions and no remote tag writes; publication tokens were unset. Runtime coverage: Nuxt requires 100% lines, UI 100% statements/lines, 80% branches, 50% functions; Nest reports V8 coverage without a numeric Jest threshold. Entry points: package-native `test:coverage`, `pnpm verify:packages`, `pnpm examples:test:api`, `pnpm examples:test:compose`, `pnpm docs:test`. Other suites were not rerun at baseline.

- `@querry-kit/nest@2.1.2`: `.`, `./object`, `./fields`, `./dto`, `./pagination`, `./query-service`, `./casl`, `./decorators`, `./pipes`, `./zod`, `./core`.
- `@querry-kit/nuxt@1.1.2`: `.`, `./api`, `./table`, `./autocomplete`, `./types`, `./utils`.
- `@querry-kit/nuxt-ui@4.3.1`: `.`, `./types`.

Known pre-existing external failure: Dependabot #79–81 for `brace-expansion@1.1.18`; captured separately from baseline build results.
