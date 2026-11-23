# Tasks: Querry Kit monorepo hardening

Inputs: [spec](spec.md), [plan](plan.md), [research](research.md), [state model](data-model.md), [runtime](contracts/behavior.md) and [delivery](contracts/delivery.md) contracts, and [validation guide](quickstart.md). Paths are relative to the monorepo. This backlog authorizes neither implementation nor production changes.

The specification identifies twelve independently acceptable findings rather than numbered stories. US1–US4 below group them by the approved delivery waves. Keep fixes independently reviewable, particularly F01 and F02. New evidence and test paths below are proposed files. Treat a regression and its fix as one green mergeable increment; the order below is the order of work, not an instruction to merge red tests.

## Phase 1 — Setup

Confirm the delivery base; do not attach implementation to the example-layout PR.

- [X] T001 Confirm PR #58’s merge `fcbcee5` is in the implementation base and `example/apps/web/package.json` is present on updated `main`. Record base SHA, Node/pnpm versions, eight workspace members and three publishable packages in `specs/002-monorepo-hardening/evidence/baseline.md`. If the move is still pending, defer branch-dependent implementation.

## Phase 2 — Foundation

Capture the shared validation baseline before changing any gate.

- [X] T002 Using `specs/002-monorepo-hardening/quickstart.md`, record the frozen install, native/consumer check entry points, current package exports and coverage thresholds in `specs/002-monorepo-hardening/evidence/baseline.md`. Save existing failures separately. Confirm the release rehearsal uses disposable copies without publish credentials; keep the frozen #53 evidence read-only.

## Phase 3 — US1 (P1): safe dependencies and predictable row updates

Independent proof: the 1.x graph is safe without other major-line churn; a hidden custom key updates the correct one of two rows. Each fix can ship alone.

- [X] T003 [P] [US1] F01: Verify advisory bounds and registry age, replace the stale 1.x override in `pnpm-workspace.yaml` with the scoped `>=1.0.0 <1.1.22` → `1.1.22` resolution if still appropriate, and regenerate `pnpm-lock.yaml` with pinned pnpm. Compare `pnpm -r why brace-expansion` before/after and run a frozen install. Leave `braces` and the 2.x/5.x rules untouched.
- [X] T004 [P] [US1] F02: In `packages/nuxt/src/table/index.spec.ts` add red cases for a hidden `slug` plus explicit static/nested fields, updates of the second loaded row, absent/unknown keys and a zero key.
- [X] T005 [US1] F02: In `packages/nuxt/src/table/index.ts` include the identity in the deduplicated projection; skip nullish identities without changing the return type or unrelated rows. Align `packages/nuxt/src/types/table-options.ts` and the table guide with the tested behavior. Run Nuxt lint, check, build and coverage. Implements [data-model.md](data-model.md): `Table identity.Configured key`, `Table identity.fields requested`, `Table identity.key value on stored row and incoming patch`.
- [X] T006 [US1] F01: After the dependency PR merges, record the lock SHA, exact installed 1.x tree, audit result and GitHub disposition of alerts 79–81 in `specs/002-monorepo-hardening/evidence/dependencies.md`. Keep external confirmation pending if GitHub has not yet rescanned.

## Phase 4 — US2 (P1): reliable releases and protected merges

Independent proof: delayed visibility causes exactly one submission; a selected failing job blocks merge under the effective main rules. These are separate increments.

- [X] T007 [P] [US2] F03: Extend `scripts/release/rehearse.mjs` with an injected clock, simulated registry and publish/tag counters. Cover absent metadata, delayed latest/attestation, confirmed success, deadline, ambiguous submit outcome, same-SHA retry, digest/provenance/tag contradictions and one missing member of a two-package release.
- [X] T008 [P] [US2] F04: In `specs/002-monorepo-hardening/evidence/branch-rule.md` capture effective rules plus classic protection, identify the actual Actions app and `Workspace checks` context on docs-only and full PRs, and prepare an additive main-only rule diff and exact rollback. Preserve deletion protection.
- [X] T009 [US2] F03: Separate publish submission from read-only confirmation in `scripts/release/run.mjs` and `scripts/release/verify-candidates.mjs`; bound each read and total wait, distinguish pending from contradiction, and tag only verified bytes. Provide explicit confirmation-only recovery for accepted/uncertain submissions on the original reviewed artifact; keep independently missing candidates recoverable. Wire recovery into `.github/workflows/publish.yml` and document operator steps. Pass T007 without npm or remote Git writes. Implements [data-model.md](data-model.md): `Release verification.Reviewed SHA`, `Release verification.package`, `Release verification.version`, `Release verification.archive integrity`, `Release verification.registry observation`, `Release verification.provenance`, `Release verification.time budget`, `Release verification.Git tag`.
- [ ] T010 [US2] F04 — owner operation: only after explicit approval, apply the reviewed required check, verify enforcement with a disposable failing PR and positive docs/full results, and record before/after, operator and rollback in `specs/002-monorepo-hardening/evidence/branch-rule.md`. Without approval leave this task open, not the independent library fixes. Implements [data-model.md](data-model.md): `Operational evidence.Alert/advisory`, `Operational evidence.resolved dependency and lockfile`, `Operational evidence.prior/effective rules`, `Operational evidence.required check identity`, `Operational evidence.approved operator`, `Operational evidence.migration evidence links`.

## Phase 5 — US3 (P2): correct consumer behavior

Independent proof: retry without stale errors; scoped distinct totals across pages; switch personas safely during delayed requests; identify and toggle Priority by its accessible name.

- [X] T011 [P] [US3] F05: Add overlapping selection/search failures, recovery of either lane, stale rejection and clear-selection cases to `packages/nuxt/src/autocomplete/index.spec.ts` using deferred promises.
- [X] T012 [P] [US3] F06: In `packages/nest/src/query-service/query.service.spec.ts` add duplicate single/composite keys, excluded scope, empty/out-of-range pages, cursor convention and item projection fixtures. Review existing public contract, key-query cost and SemVer impact before changing `query()`.
- [X] T013 [P] [US3] F07: Extend `example/apps/web/test/account-switch.spec.ts` with a held PATCH and account-switch attempt, failure/ambiguous outcome, and reads canceled by the caller as well as by a switch. Retain the held-GET isolation assertion.
- [X] T014 [P] [US3] F08: In `packages/nuxt-ui/test/controls.spec.ts` cover two named switches, localized text and fallback ID; in `example/apps/web/test/workboard.spec.ts` use the full accessible name and Space. Preserve reset/Escape coverage.
- [X] T015 [US3] F05: Implement generation-aware lane state in `packages/nuxt/src/autocomplete/index.ts` without changing the public writable `error` ref. A lane success or selection reset must not erase the other lane’s unresolved failure. Run the Nuxt native gates. Implements [data-model.md](data-model.md): `Autocomplete request lane.selection or search`, `Autocomplete request lane.request generation`, `Autocomplete request lane.pending flag`, `Autocomplete request lane.items`, `Autocomplete request lane.last relevant error`.
- [X] T016 [US3] F06: In `packages/nest/src/core/query.service.ts` retain ordinary count for absent/empty distinct; otherwise count unpaged key-only distinct tuples with the page’s access-scoped filter. Keep caller select/include, ordering and slicing on the item query and standalone `count()` unchanged. Measure the key-only path on representative duplicates; document the memory cost and lack of snapshot isolation. Run Nest native gates. Implements [data-model.md](data-model.md): `Distinct page.Scoped filter`, `Distinct page.ordered distinct key tuple`, `Distinct page.items`, `Distinct page.total groups`, `Distinct page.page size and metadata`.
- [X] T017 [US3] F07: In `example/apps/web/app/plugins/querry-kit.ts` and `example/apps/web/app/composables/useDemoSession.ts` compose signals for resource GETs only; track mutation settlement and block concurrent persona transitions/new writes while switching. On unknown outcomes refresh within the correct scope before retry. Validate Workboard integration and browser flows against disposable PostgreSQL. Implements [data-model.md](data-model.md): `Persona operation.Current identity`, `Persona operation.read controller/generation`, `Persona operation.in-flight mutation count`, `Persona operation.switching flag`.
- [X] T018 [US3] F08: In `packages/nuxt-ui/src/runtime/components/table/options/item.vue` and `packages/nuxt-ui/src/runtime/texts.ts` make each switch name identify its column while retaining locale overrides and native state. Run UI native gates and the Workboard keyboard case. Implements [data-model.md](data-model.md): `Column visibility control.Stable column ID`, `Column visibility control.localized header/label`, `Column visibility control.switch state`.

## Phase 6 — US4 (P3): trustworthy delivery and current guidance

Independent proof: reject broken packs and peers, promote the tested artifact only, select downstream jobs accurately, and verify current links without invalidating historical records.

- [X] T019 [P] [US4] F09: Define reviewed package contracts in `tests/packed/contracts/nest.json`, `tests/packed/contracts/nuxt.json` and `tests/packed/contracts/nuxt-ui.json`, with mandatory public targets/formats, peers/optional flags, assets, license and an explicit policy for incidental build chunks. Derive expectations from reviewed public contracts, not candidate output. Implements [data-model.md](data-model.md): `Package contract.Public package identity`, `Package contract.supported entrypoints/conditions`, `Package contract.supported peers and optional flags`, `Package contract.required assets`, `Package contract.consumer fixtures`.
- [X] T020 [P] [US4] F12: Inventory reporting links, contribution paths, nested workflows, Dependabot files and patch references in `specs/002-monorepo-hardening/evidence/cleanup.md`. Map every proposed deletion to the active replacement or evidence it is obsolete; flag unmatched checks for retention.
- [X] T021 [US4] F09: Update `scripts/verify-packages.mjs` to use T019 for normal verification and keep historical baseline replay opt-in. In `tests/packed/contracts/verify.test.mjs` demonstrate reviewed additive exports pass and missing declarations, local dependencies and unexplained files fail. Preserve exact candidate-byte hashing and ledger output.
- [X] T022 [US4] F10: Extend `scripts/test-packed-consumers.mjs` and fixtures in `tests/packed/{nest,nuxt,nuxt-ui}/` to install outside the workspace with enforced peers and compile used public APIs under strict TypeScript. Preserve minimal Nest absence and ESM/CJS checks, Nuxt consumer-plugin coverage and the four UI peer combinations; add a current supported pair. Prove an incompatible peer and broken public type fail for the intended reason.
- [ ] T023 [US4] F11a: Update `.github/workflows/ci.yml`, `.github/workflows/docs.yml` and `apps/docs/playwright.config.ts` so Playwright tests the generated Pages tree that is uploaded and promoted after aggregate success on a trusted `main` push. Bind promotion to repository, ref, SHA, run and verified artifact; fail on a missing/expired/mismatched artifact rather than rebuilding. Keep deploy-only permissions; smoke-test live routes on the next authorized deployment. Implements [data-model.md](data-model.md): `CI decision and Pages artifact.Changed paths`, `CI decision and Pages artifact.required jobs`, `CI decision and Pages artifact.source event/ref/SHA`, `CI decision and Pages artifact.successful build/test run`, `CI decision and Pages artifact.immutable artifact ID/digest`, `CI decision and Pages artifact.deployment`.
- [X] T024 [US4] F11b: Before changing job selection, add full, docs-only, example-only, library/changelog, mixed, rename/delete and unknown-diff cases to `scripts/ci/select-jobs.test.mjs` for the proposed selector `scripts/ci/select-jobs.mjs`. Include cancellation, unexpected skips and docs-skipped pushes that cannot deploy.
- [X] T025 [US4] F11b: Wire the tested dependency-aware selector into `.github/workflows/ci.yml` after T021–T024; keep one always-reported `Workspace checks`. Verify full fallback for root config, lock, workflows and uncertain diffs, and downstream coverage for library changes. Compare job durations to a comparable historical run; retain a full-matrix rollback.
- [X] T026 [US4] F12: Update `SECURITY.md`, `packages/{nest,nuxt,nuxt-ui}/SECURITY.md`, package READMEs and `example/CONTRIBUTING.md` to direct current reports to central destinations. After checking active replacements, retire redundant nested `.github` jobs/configs and stale patch claims; preserve the old example redirect and historically pinned links. Reconcile `specs/001-consolidate-monorepo/tasks.md` and `specs/001-consolidate-monorepo/evidence/cutover.md` with #53, the verified release, Pages and four archive records; leave frozen snapshots unchanged.

## Phase 7 — Polish and verification

An external gate is not complete until it has external evidence.

- [ ] T027 For every release-affecting increment include appropriate package Changesets under `.changeset/` and public docs changes with its PR; at final review audit the set against `specs/002-monorepo-hardening/contracts/behavior.md`. No manufactured release for private-only work. Do not defer required per-PR documentation until after merge.
- [ ] T028 Run applicable scenarios in `specs/002-monorepo-hardening/quickstart.md` and record per-finding SHA, command, outcome, and separately pending operator/hosted checks in `specs/002-monorepo-hardening/evidence/acceptance.md`. Confirm all twelve outcomes independently and that no publisher, archived repository or public package identity was changed by validation.

## Dependencies and parallel execution

T001 → T002 establishes the common base. Wave order prioritizes review and rollout; there is no need to wait for a GitHub alert rescan or owner decision to develop independent fixes.

| Story | Parallel example and dependency chain | Delivery boundary |
| --- | --- | --- |
| US1 | T003 ∥ T004; T004 → T005; T003 → T006 after merge. | Two separate PRs: dependency resolution and row identity. |
| US2 | T007 → T009 and T008 → T010 can run independently. | Publish rehearsal is local; rule application is a separately authorized operation. |
| US3 | T011 → T015, T012 → T016, T013 → T017, T014 → T018. The four test fronts touch separate files. | One verifiable behavior change per PR. Coordinate Workboard browser suites if running against the same DB. |
| US4 | T019 → T021 → T022; T020 may proceed alongside package work. T021/T022 → T023 → T024 → T025. T020 → T026; remove obsolete jobs only after equivalent checks are active. | Land maintained contracts and fixtures before pruning jobs. Promote artifacts before narrowing scope. |

**MVP:** deliver T003 and T004–T005 independently after setup; verify T006 on the default branch. Then deliver the later stories incrementally. Apply T027’s documentation/Changeset policy in each affected PR; T028 collects final evidence. `[P]` marks disjoint work once prerequisites are satisfied, not permission to run release or owner actions.
