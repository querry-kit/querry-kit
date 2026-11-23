# Implementation plan: Querry Kit monorepo hardening

**Issue:** [#59](https://github.com/querry-kit/querry-kit/issues/59) · **Issue branch:** `59-monorepo-hardening-fix-consumer-behavior-and-improve-release-and-ci-reliability` · **Feature:** `002-monorepo-hardening` · **Date:** 2026-11-23 · **Input:** [feature specification](spec.md) · **Reviewed tree:** `37ee387` (PR #58). Planning commit is based on `main` at `fcbcee5`, after the example move merged.

## Summary

Deliver the twelve review findings in four waves. First remove the vulnerable transitive resolution and fix incorrect table updates. Next make publishing tolerant of registry propagation and enforce the existing CI result. Then repair public library and example behavior. Finally replace migration-era gates with ongoing consumer contracts and simplify CI, Pages and guidance. A failing downstream gate blocks only changes that depend on it.

## Technical context

- Eight pnpm projects; exactly three public, independently versioned libraries. Node 26.13+ within 26.x for the private workspace, pnpm 11.28.9, existing split TypeScript toolchains. Keep public engine floors and peer ranges unless a separately reviewed change justifies a change.
- Nest/Fastify and Prisma/PostgreSQL; Vue/Nuxt and Nuxt UI; example transport via Axios and private Zod contracts. No application schema change, database migration or new service planned.
- Proof: package-native Jest/Vitest, isolated tarball consumers, real PostgreSQL and Playwright for Workboard, static Pages-prefix browser tests, release rehearsals with simulated registry responses. No live npm publication in tests.
- Operational surfaces: GitHub branch rules, Actions, Pages artifacts, npm registry and provenance. Repository-admin operations require explicit approval and before/after evidence; planning grants none.

## Constitution check

The root bootstrap's constitution is an unratified template. Its examples are not adopted principles. Use the actual package `AGENTS.md` files, `apps/docs/AGENTS.md`, package manifests, central Changesets configuration and the accepted #53 invariants as gates. Before research: preserve publication identities, contracts, optional peers and scoped data handling. After design: no new public package or shared service, no changes to protected publisher bindings, no weaker verification or test thresholds. Public behavior changes get package-appropriate Changesets and docs; private maintenance alone must not cause an npm release. **Design gates pass**; branch protection and any SemVer-impacting change remain delivery approvals.

## Project structure

- `packages/nuxt/src/{table,autocomplete}/`, `packages/nest/src/{core,query-service}/`, `packages/nuxt-ui/src/runtime/components/table/options/`: library behavior and native regressions.
- `example/apps/web/app/{plugins,composables}/` and existing account-switch/browser tests: read cancellation and write coordination.
- `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `scripts/release/`, `scripts/verify-packages.mjs`, `scripts/test-packed-consumers.mjs`, `tests/packed/`, `.github/workflows/`: dependency, delivery and consumer gates.
- `apps/docs/`, root/package security policies, contribution guides and migration evidence: public guidance. Proposed design artifacts: [research](research.md), [model](data-model.md), [behavior contract](contracts/behavior.md), [delivery contract](contracts/delivery.md), [validation guide](quickstart.md).

## Delivery sequence and acceptance gates

| Wave | Reviewable increments | Dependency and exit |
| --- | --- | --- |
| 1. Immediate fixes | **F01** Target the affected 1.x dependency line and verify the lockfile. **F02** Include row identity in field selection and guard `updateRow`. | Separate PRs, independently revertible. Frozen install, no affected 1.x resolution; two-row regression with hidden/custom identity passes. Confirm alert closure after merge. |
| 2. Release reliability | **F03** Bounded, read-only confirmation after accepted publication. **F04** Require the stable `Workspace checks` status on `main`. | F03 must pass a delayed-registry rehearsal. For F04 use observed GitHub Actions check identity, preview the ruleset and keep existing protections. Confirm a full and a docs-only PR emit the required context before enforcement. |
| 3. User-facing correctness | **F05** Independent retry states. **F06** Consistent scoped distinct pagination. **F07** Separate read cancellation from mutation settlement and persona switching. **F08** Distinct accessible switch names. | Four independently reviewable changes. F06 requires a contract and SemVer review before modifying public behavior. F07 must pass a delayed-write browser scenario and existing isolation checks. F08 must retain translations and keyboard behavior. |
| 4. Sustainable delivery | **F09** Maintained package contracts independent of archived evidence. **F10** Normal peer resolution and typed usage. **F11** Path-to-job mapping and promotion of tested Pages bytes. **F12** Central reporting links, obsolete config inventory, #53 closeout evidence. | Design F09/F10 together; land their gates before pruning CI jobs. Deliver F11 in two increments: artifact identity first, job selection second. F12 may start after active replacements are verified; keep historical links and the old example-path README. |

## Verification, rollout and rollback

Keep a red regression or a dated external observation for each defect, then record the green test, reviewed SHA and owner where applicable. Run affected consumer checks as well as native tests. When layouts, release tooling or shared dependency policy change, run the full matrix. No measured runtime speedup is claimed: for F11 compare redundant builds and CI job durations on comparable revisions; correctness and an always-reported result are the gate.

Stop on an unresolved peer incompatibility, inaccurate pagination total, unverifiable archive/provenance, missing owner approval or any path that deploys untested bytes. Revert independently before release; restore a branch rule from the saved before-state if required; redeploy the last verified Pages artifact if necessary. After an npm publish, never overwrite or republish the version. Use the existing same-SHA recovery process.
