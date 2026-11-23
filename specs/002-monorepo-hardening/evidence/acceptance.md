# Review evidence for #59

| Finding | Commit or PR | Local proof | Outstanding |
| --- | --- | --- | --- |
| F01 | [#60](https://github.com/querry-kit/querry-kit/pull/60), `151ec83` | Frozen install, before/after dependency tree and `pnpm audit` (zero); [full CI passed](https://github.com/querry-kit/querry-kit/actions/runs/45086518530). | [Merged on main; alerts 79–81 fixed](dependencies.md). |
| F02 | `6ee2f29`, `fix/59-table-identity` | Keyless update changed row one before the fix. Nuxt lint, types, build, 75 tests, 100% lines after. | [Draft #68](https://github.com/querry-kit/querry-kit/pull/68); review pending. |
| F03 | [#61](https://github.com/querry-kit/querry-kit/pull/61), `8bed108` | Local release rehearsal with virtual time, recorded submit and tag counts; no live release. | [Full CI passed](https://github.com/querry-kit/querry-kit/actions/runs/45086737037); [Full CI including #60 passed](https://github.com/querry-kit/querry-kit/actions/runs/45088766676); merged at `8843b45`. |
| F04 | [Rule and enforcement proof](branch-rule.md) | Full and docs-only PRs reported the same successful check. | T010 verified: probe #67 changed from `BLOCKED` to `CLEAN` and was closed without merging. |
| F05 | `02cf7f1`, `fix/59-autocomplete-retry` | Deferred failures, stale generation, selection clear; Nuxt lint, types, build and 75 tests passed. | [Draft #69](https://github.com/querry-kit/querry-kit/pull/69); review pending. |
| F06 | `1b69b1a`, `fix/59-distinct-total` | Nest lint, types, build, 267 tests and optional-peer ESM/CJS passed. Synthetic delegate: 40,000 rows, 2,000 distinct keys, 20,891 serialized key-projection bytes (3 ms locally; not a database benchmark). | [Draft #70](https://github.com/querry-kit/querry-kit/pull/70); review pending. |
| F08 | `1b5b403`, `fix/59-accessible-column-names` | UI lint, types, build, 100% lines. Full Compose validation passed (29 tests); fresh local fixture requires `pnpm --filter @workboard/contracts build` before running Playwright. | [Draft #71](https://github.com/querry-kit/querry-kit/pull/71); review pending. |

## Additional results

- F05/F06: `2c62e53` moves the autocomplete note away from the table change; the additional Nest projection test confirms an included relation never reaches the distinct total and an empty distinct list uses `count`. The package branches apply together.
- F07: `fix/59-persona-mutations`, `26a6ea9`: client types and lint passed; 31/31 cold-Compose browser cases passed, including an actual PATCH whose response was dropped, scoped reload, disabled switching, independent caller cancellation and stale reads.
- F08: `1b5b403` passed all 29 cold-Compose cases, including the Priority switch by name and keyboard.
- F09/F10: [#64](https://github.com/querry-kit/querry-kit/pull/64). Maintained and historical checks passed for all three tarballs. Seven isolated strict-peer consumers passed (Nest, Nuxt, five UI pairs); deliberately broken return type and incompatible Vue peer failed for the expected reasons.
- F11: [#65](https://github.com/querry-kit/querry-kit/pull/65). Actionlint, docs lint/types, 68 desktop/mobile Pages-prefix tests and four selector/aggregate tests passed. [Main deployment](https://github.com/querry-kit/querry-kit/actions/runs/45095321153) succeeded for `50c1318` (deployment `7988366386`, artifact `14783305756`). The downloaded ZIP matched `sha256:adae8e783b2bb9339d870e79e5522d86115fbd5016916be501f2c0c47421042c`. All seven live responses (root, example, historical Nest route, three package changelogs and favicon) returned HTTP 200 and matched the tested artifact byte for byte. [Five targeted GitHub runs and an intentional aggregate failure](https://github.com/querry-kit/querry-kit/pull/65#issuecomment-7089110842) confirmed job selection. The docs job took 189 s in each of two comparable docs-only runs. Rollback: set `WORKSPACE_CI_FORCE_FULL=true`.
- F12: `docs/59-current-guidance` (`ab6cef3`) plus [docs-only PR #63](https://github.com/querry-kit/querry-kit/pull/63). Current guidance, root vs nested patch inventory, frozen install, archived state of four repositories and the dated #53 owner/release/Pages confirmations verified. Historical test workflows with unmatched coverage reporting are intentionally retained.

## Combined local verification

Integrated tree `7165cdb`: frozen install; package and example builds; example types, lint, formatting and workspace-link checks; PostgreSQL API integration; 31 cold-Compose browser tests; three verified archives; seven isolated strict-peer consumer installations; and the offline release rehearsal all passed. The same tree passed 76 Nuxt tests and 68 desktop/mobile documentation browser tests. No production publish or Pages deployment was part of these runs.

## T027 — Changesets and consumer documentation

All six remaining branch tips merged cleanly in a disposable checkout based on `main` at `50c1318`. For each public behavior change, the package README, the central guide and the named patch Changeset are present on the same branch:

| Finding | Branch tip | Changeset | Central documentation |
| --- | --- | --- | --- |
| F02 | `6ee2f29` | `table-row-identity` | `nuxt/guide/table.md` |
| F05 | `2c62e53` | `autocomplete-retry` | `nuxt/guide/autocomplete.md` |
| F06 | `45efb57` | `distinct-page-total` | `nest/api/query-service.md` |
| F08 | `1b5b403` | `column-visibility-label` | `nuxt-ui/components/options.md` |

`changeset status --since=50c1318` projected exactly three public patch releases: Nest `2.1.2 → 2.1.3`, Nuxt `1.1.2 → 1.1.3` and Nuxt UI `4.3.1 → 4.3.2`. The Workboard fix (`26a6ea9`) and contributor guidance (`954e8bb`, empty Changeset) add no release. The latter replaces obsolete standalone-repository installation examples with version-pinned npm instructions. Frozen install, the package builds and `pnpm verify:packages --archives-only` passed on the combined tree without changing versions. T027 verified: the GitHub file list for each of the six draft PRs matched its audited branch diff, including the package Changesets and consumer guides.

Published, unmerged review branches: [F02 #68](https://github.com/querry-kit/querry-kit/pull/68), [F05 #69](https://github.com/querry-kit/querry-kit/pull/69), [F06 #70](https://github.com/querry-kit/querry-kit/pull/70), [F08 #71](https://github.com/querry-kit/querry-kit/pull/71), [F07 #72](https://github.com/querry-kit/querry-kit/pull/72), [F12 #73](https://github.com/querry-kit/querry-kit/pull/73).

## T028 — Final acceptance at the reviewed revisions

| Finding | Draft and verified head | Relevant gate | Hosted Workspace checks |
| --- | --- | --- | --- |
| F02 | [#68](https://github.com/querry-kit/querry-kit/pull/68), `6ee2f29` | Nuxt `test:coverage` (table identity) | [Passed](https://github.com/querry-kit/querry-kit/actions/runs/45097387421) |
| F05 | [#69](https://github.com/querry-kit/querry-kit/pull/69), `2c62e53` | Nuxt `test:coverage` (autocomplete recovery) | [Passed](https://github.com/querry-kit/querry-kit/actions/runs/45097396355) |
| F06 | [#70](https://github.com/querry-kit/querry-kit/pull/70), `45efb57` | Nest `test:coverage`, `test:optional-peers` | [Passed](https://github.com/querry-kit/querry-kit/actions/runs/45097405947) |
| F08 | [#71](https://github.com/querry-kit/querry-kit/pull/71), `1b5b403` | UI `test:coverage`, `pnpm examples:test:compose` | [Passed](https://github.com/querry-kit/querry-kit/actions/runs/45097415314) |
| F07 | [#72](https://github.com/querry-kit/querry-kit/pull/72), `26a6ea9` | `pnpm examples:test:compose` | [Passed](https://github.com/querry-kit/querry-kit/actions/runs/45097425185) |
| F12 | [#73](https://github.com/querry-kit/querry-kit/pull/73), `954e8bb` | `pnpm install --frozen-lockfile`; archive and guidance inventory | [Passed](https://github.com/querry-kit/querry-kit/actions/runs/45097435539) |

For the remaining findings: F01 was confirmed on `9a13e36` with `pnpm audit` and the default-branch alert rescan; F03 on `8843b45` with `pnpm verify:release-plan` in CI; F04 with `gh pr checks --required` on both probe heads recorded in [the enforcement evidence](branch-rule.md). F09 and F10 passed `pnpm verify:packages` on the [reviewed #64 run](https://github.com/querry-kit/querry-kit/actions/runs/45089981142), merged at `88d8cb5`. F11 passed the selection probes, Pages-prefix browser suite and deployed-byte comparison for `50c1318` recorded above.

The four source repositories still report `isArchived: true`. The latest central npm publish run is still the verified release at `332bfae`; npm `latest` remains Nest `2.1.2`, Nuxt `1.1.2`, Nuxt UI `4.3.1`. Validation did not modify publisher bindings, archived sources or package identities. No acceptance gate is pending for these revisions. The six implementation PRs remain unmerged drafts; reviewing, merging and releasing them are separate decisions.
