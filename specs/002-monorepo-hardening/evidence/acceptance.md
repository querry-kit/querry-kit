# Review evidence for #59

| Finding | Commit or PR | Local proof | Outstanding |
| --- | --- | --- | --- |
| F01 | [#60](https://github.com/querry-kit/querry-kit/pull/60), `151ec83` | Frozen install, before/after dependency tree and `pnpm audit` (zero); [full CI passed](https://github.com/querry-kit/querry-kit/actions/runs/45086518530). | [Merged on main; alerts 79–81 fixed](dependencies.md). |
| F02 | `6ee2f29`, `fix/59-table-identity` | Keyless update changed row one before the fix. Nuxt lint, types, build, 75 tests, 100% lines after. | Package push approval. |
| F03 | [#61](https://github.com/querry-kit/querry-kit/pull/61), `8bed108` | Local release rehearsal with virtual time, recorded submit and tag counts; no live release. | [Full CI passed](https://github.com/querry-kit/querry-kit/actions/runs/45086737037); [Full CI including #60 passed](https://github.com/querry-kit/querry-kit/actions/runs/45088766676); merged at `8843b45`. |
| F04 | [Rule proposal](branch-rule.md) | Full and docs-only PRs reported the same successful check. | Operator decision, effective enforcement and rollback evidence. |
| F05 | `02cf7f1`, `fix/59-autocomplete-retry` | Deferred failures, stale generation, selection clear; Nuxt lint, types, build and 75 tests passed. | Package push approval. |
| F06 | `1b69b1a`, `fix/59-distinct-total` | Nest lint, types, build, 267 tests and optional-peer ESM/CJS passed. Synthetic delegate: 40,000 rows, 2,000 distinct keys, 20,891 serialized key-projection bytes (3 ms locally; not a database benchmark). | Package push approval. |
| F08 | `1b5b403`, `fix/59-accessible-column-names` | UI lint, types, build, 100% lines. Full Compose validation passed (29 tests); fresh local fixture requires `pnpm --filter @workboard/contracts build` before running Playwright. | Package push approval. |

## Additional results

- F05/F06: `2c62e53` moves the autocomplete note away from the table change; the additional Nest projection test confirms an included relation never reaches the distinct total and an empty distinct list uses `count`. The package branches apply together.
- F07: `fix/59-persona-mutations`, `26a6ea9`: client types and lint passed; 31/31 cold-Compose browser cases passed, including an actual PATCH whose response was dropped, scoped reload, disabled switching, independent caller cancellation and stale reads.
- F08: `1b5b403` passed all 29 cold-Compose cases, including the Priority switch by name and keyboard.
- F09/F10: [#64](https://github.com/querry-kit/querry-kit/pull/64). Maintained and historical checks passed for all three tarballs. Seven isolated strict-peer consumers passed (Nest, Nuxt, five UI pairs); deliberately broken return type and incompatible Vue peer failed for the expected reasons.
- F11: [#65](https://github.com/querry-kit/querry-kit/pull/65). Actionlint, docs lint/types, 68 desktop/mobile Pages-prefix tests and four selector/aggregate tests passed. Positive main deployment and post-deployment checks still require an approved rollout. Hosted selector coverage and a comparable run comparison are pending. Rollback: set `WORKSPACE_CI_FORCE_FULL=true`.
- F12: `docs/59-current-guidance` (`ab6cef3`) plus [docs-only PR #63](https://github.com/querry-kit/querry-kit/pull/63). Current guidance, root vs nested patch inventory, frozen install, archived state of four repositories and the dated #53 owner/release/Pages confirmations verified. Historical test workflows with unmatched coverage reporting are intentionally retained.

## Combined local verification

Integrated tree `7165cdb`: frozen install; package and example builds; example types, lint, formatting and workspace-link checks; PostgreSQL API integration; 31 cold-Compose browser tests; three verified archives; seven isolated strict-peer consumer installations; and the offline release rehearsal all passed. The same tree passed 76 Nuxt tests and 68 desktop/mobile documentation browser tests. No production publish or Pages deployment was part of these runs.
