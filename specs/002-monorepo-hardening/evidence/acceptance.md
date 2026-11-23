# Review evidence for #59

| Finding | Commit or PR | Local proof | Outstanding |
| --- | --- | --- | --- |
| F01 | [#60](https://github.com/querry-kit/querry-kit/pull/60), `151ec83` | Frozen install, before/after dependency tree and `pnpm audit` (zero); [full CI passed](https://github.com/querry-kit/querry-kit/actions/runs/45086518530). | Merge approval and post-merge Dependabot rescan. |
| F02 | `6ee2f29`, `fix/59-table-identity` | Keyless update changed row one before the fix. Nuxt lint, types, build, 75 tests, 100% lines after. | Package push approval. |
| F03 | [#61](https://github.com/querry-kit/querry-kit/pull/61), `8bed108` | Local release rehearsal with virtual time, recorded submit and tag counts; no live release. | Hosted checks and merge decision. |
| F04 | [Rule proposal](branch-rule.md) | Main and full PR check context identified. | Docs-only PR check, operator decision, effective enforcement and rollback evidence. |
| F05 | `02cf7f1`, `fix/59-autocomplete-retry` | Deferred failures, stale generation, selection clear; Nuxt lint, types, build and 75 tests passed. | Package push approval. |
| F06 | `1b69b1a`, `fix/59-distinct-total` | Nest lint, types, build, 267 tests and optional-peer ESM/CJS passed. Synthetic delegate: 40,000 rows, 2,000 distinct keys, 20,891 serialized key-projection bytes (3 ms locally; not a database benchmark). | Package push approval. |
| F08 | `1b5b403`, `fix/59-accessible-column-names` | UI lint, types, build, 100% lines. Full Compose validation in progress; fresh local fixture requires `pnpm --filter @workboard/contracts build` before running Playwright. | Browser proof and package push approval. |
