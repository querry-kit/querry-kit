# T001 — Import baseline

**Initial observation:** 2026-11-22 21:41 UTC. **Import baseline:** pinned for the import-only PR through its merge; later source drift must be reconciled separately. This is an observational freeze, not a lock on the upstream repositories.

| Repository | Frozen candidate `main` | Import path | Git tags / GitHub releases | Open issues / PRs |
| --- | --- | --- | --- | --- |
| querry-kit | `34b2dca00b22b42c861f956ab88c43cb8af549ff` | destination root | 3 / 3 | 1 / 0 |
| nest | `ad68cba0dc17850b667980a62cab2f2d648ff940` | `packages/nest` | 20 / 20 | 0 / 0 |
| nuxt | `ba5dfab593c5b5c5791d7356f5378bd2b39b7d79` | `packages/nuxt` | 21 / 21 | 0 / 0 |
| nuxt-ui | `a63116e2e193384b2a2e1045c3c60f61cb845226` | `packages/nuxt-ui` | 26 / 26 | 0 / 0 |
| example | `f7f7d0b9c813cdf7960fab87bf0e8becfb03260e` | `imports/example` | 0 / 0 | 0 / 0 |

[Machine-readable snapshot](freeze-snapshot.json): full root tree IDs, tag-to-commit mappings, release URLs, branch protection, effective rulesets, active workflows and pinned workflow source links. The sole open item is destination [#53](https://github.com/querry-kit/querry-kit/issues/53); there are no open upstream tickets or PRs to transfer. None of the three library release workflows has an in-flight run; each last run succeeded at the SHA above. The existing publishers remain authoritative. The destination's Pages deployment `7984879167` succeeded from the recorded destination SHA at the existing project URL.

**CI and integration:** Central supports merge commits. Its main branch and library main branches have a deletion rule, without required status contexts in the inspected protection response. Example requires `verify`. Record both rulesets and classic protection: either alone is incomplete. Import by merge commit only after explicit PR approval and applicable CI. Preserve package-native CI and example verification until their replacements are proven.

**Additional history preserved:** An independent comparison of full GitHub mirrors against refs, reflogs and unreachable commit objects in the four local checkouts found nine additional commit IDs: Nest 2, Nuxt 2, Nuxt UI 3, Example 2. The Example pair includes a `compose.yml` stash and its index commit. At the maintainer's request all nine were published under `archive/monorepo-53/*` in the source repositories. They are included in the freeze. Keep these refs until a fresh clone of merged central `main` passes the full-set proof.

**Freeze handoff:** Rechecked all five default heads, open work and the three publish workflow histories after the archive pushes; no new release or default-branch changes. Re-fetched all four independent mirrors and compared each full advertised ref map to the mirror. Use a merge commit, never squash or rebase, and obtain separate approval on the concrete PR. The per-source inventories are the authority for the commit-set check.
