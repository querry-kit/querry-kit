# Improve Querry Kit after the monorepo migration

**Status:** proposed design · **Date:** 2026-11-23 · **Input:** repository review at `37ee387` (includes the `example/` layout proposed in PR #58).

As a consumer, I want rows, retries, counts, and accessible controls to behave correctly. As a maintainer, I want a reproducible package and Pages release, enforceable CI, and one current source of operational guidance. Each finding below can be accepted independently.

| ID | Required outcome | Acceptance example |
| --- | --- | --- |
| F01 | Resolve the three open `brace-expansion` alerts without a general toolchain upgrade. | No affected 1.x resolution in the root lock; supported 2.x/5.x lines do not regress; confirm GitHub alert disposition on the default branch. |
| F02 | `useTable` must request the configured identity and update only the intended row. | A table keyed by `slug` requests it even if hidden. An update without a usable key changes no row. |
| F03 | Registry propagation delay must not cause a second publication or premature Git tag. | An accepted publish followed by delayed visibility succeeds in the same job when the reviewed bytes and provenance become visible. |
| F04 | The central `main` branch must require the aggregate workspace CI result. | A failing applicable job blocks merge; docs-only and full PRs both produce the same required check. |
| F05 | Autocomplete retry must clear the recovered error without masking an independent failure. | Failed search → successful retry leaves fresh results and no search error; selected-item errors survive unrelated search success. |
| F06 | A paginated `distinct` query must not advertise totals for non-distinct rows. | A duplicate-value fixture yields correct totals and page boundaries, or an explicit documented unsupported-operation result before returning data. |
| F07 | Changing persona must cancel stale reads without reporting an aborted write as a confirmed failure. | Switching during an outstanding write is handled explicitly; data from the previous account never appears under the new account. |
| F08 | Column visibility switches must be distinguishable by keyboard and screen reader. | Two columns produce two distinct accessible switch names; localized wording works. |
| F09 | Replace the frozen migration snapshot as the ongoing package-contract gate. | An intentional additive export passes with a reviewed contract change; silently dropping an existing supported entry still fails. The frozen evidence remains immutable. |
| F10 | Verify representative external consumers under normal npm peer resolution. | Each library has an isolated strict install and a compilable public usage example; an incompatible fixture cannot pass merely by suppressing peer checks. |
| F11 | Select CI by affected consumers and deploy the static bytes that passed the Pages tests. | Representative path changes produce the expected jobs and a single aggregate result. The deployed artifact is identified with the tested revision and artifact digest. |
| F12 | Publish one correct set of contribution, security and operational instructions. | Active reporting links point to the central repository; inactive imported workflows are accounted for; T030–T032 agree with the verified closure of #53. |

**Out of scope:** another directory migration, changing public package identities, a blanket dependency update, transferring publishers again, weakening branch or environment protection, publishing a release just to test a change, or modifying the archived repositories.
