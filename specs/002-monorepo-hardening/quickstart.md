# Validate the proposed changes

These are **implementation acceptance scenarios**, not results from this planning pass. Run commands from the monorepo root (Node 26.x ≥26.13.0, pnpm 11.28.9). Use PostgreSQL/Docker and Chromium for example integration. The archive/registry-delay tests must use synthetic records and a simulated clock; they must have no publish credentials and must never publish or push tags.

### 1. Dependency and library fixes

```sh
pnpm install --frozen-lockfile
pnpm -r why brace-expansion
pnpm build:packages
pnpm --filter @querry-kit/nuxt test --runInBand
pnpm --filter @querry-kit/nest test --runInBand
pnpm --filter @querry-kit/nuxt-ui test
```

For F01 compare the before/after dependency path, unaffected versions, lock diff, and default-branch alerts 79–81 after merge. For F02/F05/F06/F08 add the cases in [behavior.md](contracts/behavior.md) to `packages/nuxt/src/table/index.spec.ts`, `packages/nuxt/src/autocomplete/index.spec.ts`, `packages/nest/src/query-service/query.service.spec.ts` and `packages/nuxt-ui/test/controls.spec.ts`. Run the affected package's `lint`, compiler (`check` for Nest/Nuxt, `typecheck` for UI), `build` and `test:coverage`. Existing thresholds still apply. Compare the distinct query's count strategy and query shape on a representative duplicate-heavy dataset before shipping.

### 2. Workboard, accessibility and contracts

```sh
pnpm examples:build
pnpm examples:check
pnpm examples:lint
pnpm --filter @workboard/app exec playwright install chromium
pnpm examples:test:api
pnpm examples:test:compose
pnpm verify:packages
```

Use the existing isolated Compose scripts, never a user's development DB. Extend `example/apps/web/test/account-switch.spec.ts` with the delayed-write case and `example/apps/web/test/workboard.spec.ts` with a keyboard switch-by-name assertion. External package tests must prove they resolve the inspected tarball in a temporary consumer, compile real values and types, fail on a missing public target, and pass at least one ordinary peer-enforced install per library. Record the fixture pair and installed versions on failure.

### 3. Release and delivery checks

```sh
pnpm verify:release-plan
pnpm docs:lint
pnpm docs:typecheck
pnpm --dir apps/docs exec playwright install chromium
pnpm docs:test
```

- **F03:** Simulate accepted publish → absent metadata → version visible without attestation → complete. Require one submission and a tag only after verification. Simulate a timeout, a same-SHA recovery, a wrong digest, a wrong provenance SHA and an unrelated dist-tag change. Conflicts never pass.
- **F09/F10:** Against disposable copies of the same archive/contract fixture, prove a documented additive entry passes, a removed entry fails, a peer conflict fails without legacy resolution, and an incorrectly typed public result fails a consumer compilation. Retain optional-peer absence and release-integrity tests.
- **F04/F11:** Unit-test path classification for docs, Workboard, Nest, Nuxt, UI, multi-area and unknown/shared changes. In GitHub verify one normal PR for each affected class and an intentional failed check on a disposable PR. Confirm exactly one stable aggregate result, including expected skips. Inspect the Pages deployment source run, SHA, artifact ID and digest; compare those with the tested artifact, then smoke-test `/querry-kit/example/`, the compatibility route, favicon and package changelogs. PR builds get no production deployment authority.
- **F12:** Check active links from all three packages and the example, including security reporting and contribution destinations. Inventory inactive jobs against their replacements. Verify #53's merged release, Pages deployment and archive evidence before updating execution records. Historical Git permalinks and migration-baseline inputs are not stale merely because they name an old repo.

Record the candidate SHA, commands, pass/fail, and any still-pending external confirmation per increment. No production rule change, release or deployment is required to generate this plan.
