# Guidance and retired configuration inventory

| Old path (under each package unless noted) | Active replacement or disposition |
| --- | --- |
| `.github/workflows/build.yml`, `lint.yml` | Root `.github/workflows/ci.yml`: native lint, type and builds; `packed` exercises declared ESM/CJS entrypoints. |
| `.github/workflows/test.yml` | Native coverage and Nest optional validation peers run centrally. Keep nested test references until native coverage artifact upload and the old Nuxt UI version-matrix checks are accounted for; hosted root CI currently does not upload native coverage. Nested YAML is not active CI. |
| `.github/workflows/changesets.yml`, `release.yml` | Root `version.yml` and protected `publish.yml`. Scoped tags, verified bytes, independent versions and central Pages supersede legacy tag names, per-repo releases and cross-repository docs dispatch. |
| `.github/dependabot.yml` | Root `.github/dependabot.yml` covers npm workspace and Actions. |
| `example/.github/workflows/ci.yml` | Root `consumers` checks local sources, lint, format, builds, types, Fastify/Postgres and cold Compose. Source staging no longer applies. |
| `packages/nuxt-ui/patches/`, root unused patch files | Root `pnpm-workspace.yaml` and lock reference only root `patches/braces@3.0.3.patch`; preserve this active patch. Remove unreferenced standalone copies. |
| Package badges, private advisory URL, example contribution guide | Root Workspace CI, central private vulnerability reporting, package directories and root issue tracker. Immutable migration snapshots and historical changelogs remain readable. |
