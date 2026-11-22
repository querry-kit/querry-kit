# Research: What must survive the move?

Read-only planning observations, 2026-11-22. These pins make the design reviewable; they are **not** the operational freeze. Repeat the inventory and reconcile differences immediately before import and cutover.

| `querry-kit/` repository | Observed `main` | Reference |
| --- | --- | --- |
| querry-kit | `34b2dca00b22b42c861f956ab88c43cb8af549ff` | [destination](https://github.com/querry-kit/querry-kit/tree/34b2dca) |
| nest | `ad68cba0dc17850b667980a62cab2f2d648ff940` | [manifest](https://github.com/querry-kit/nest/blob/ad68cba/package.json) |
| nuxt | `ba5dfab593c5b5c5791d7356f5378bd2b39b7d79` | [manifest](https://github.com/querry-kit/nuxt/blob/ba5dfab/package.json) |
| nuxt-ui | `a63116e2e193384b2a2e1045c3c60f61cb845226` | [manifest](https://github.com/querry-kit/nuxt-ui/blob/a63116e/package.json) |
| example | `f7f7d0b9c813cdf7960fab87bf0e8becfb03260e` | [Workboard](https://github.com/querry-kit/example/tree/f7f7d0b) |

### Which revision and artifact are authoritative?

**Decision:** Import each frozen `main` tree without squashing; preserve every original commit reachable from any frozen source ref. Fetch into isolated per-repository mirrors to avoid tag collisions. Attach tips not already reachable through the subtree imports using history-only merges: this retains the commits, not the side branches' file changes. Compare source commit-ID sets with merged `main` in a fresh clone before starting integration. Keep original tag/branch mappings and old hosted release records separate from future monorepo release tags.

**Rationale:** For all three packages the observed npm `gitHead` is the corresponding main SHA above. The old release tag instead identifies a subsequent generated-`dist` commit. The verified npm artifacts all contain `dist`, `LICENSE`, `README.md` and `package.json`; names, exports and engine floors matter independently of source ancestry. Nuxt `0.0.1` has no corresponding Git tag.

**Alternatives considered:** Copying files or squash-merging the import loses ancestry; importing bare release tags creates collisions; comparing only manifests misses broken builds.

### What gets installed and built together?

**Decision:** Make the root the single install-policy owner. Keep package-specific compilers and tests. Build Nuxt before UI, prepare Nest and Workboard contracts before API, and prepare local module exports before Nuxt app/docs preparation and builds. Root bootstrap must also work when no `dist` or generated Nuxt/Prisma files exist.

**Rationale:** Current central `pnpm-workspace.yaml` includes `apps/*` and `examples/*/*`; the example includes `vendor/*`. Neither set describes the target. Preserve the 1,440-minute minimum age from source policy. `vue-demi` and `@scarf/scarf` have conflicting build permissions across repos; start with the restrictive value, then require a demonstrated install/build need, bounded exception and recorded owner. Check the UI and central `braces@3.0.3` patches by digest before choosing one, and validate `unctx`'s extra dependencies and TS6 builder peer exceptions against the resolved graph.

**Alternatives considered:** Nested installs preserve staging; a single compiler upgrade changes the compatibility target; unioning exceptions silently broadens trust.

### How will changes be selected and published?

**Decision:** One root Changesets queue with `fixed: []`, `linked: []`, public access and private versioning/tagging disabled. Build a package-scoped release ledger; compare planned names and versions with the three-name allowlist and registry before any write.

**Rationale:** At inspection, no open PRs in any of the five repos; no pending library changesets. Central has 21 patch entries for `@querry-kit/landing-page`, with `privatePackages.version` and `.tag` currently true. Example has an empty `responsive-workboard.md`. Preserve their history/disposition without converting them to public bumps. Current [`release.yml`](https://github.com/querry-kit/nest/blob/ad68cba/.github/workflows/release.yml) treats a failed lookup as absence and tags compiled output. Current npm provenance records the old publishers; only an owner can confirm current binding access.

**Alternatives considered:** Four queues, global tags and an unrestricted recursive publish cannot prove the intended set; a fixed group violates independent versioning.

### Which checks must remain independent?

**Decision:** Test both the workspace graph and isolated registry-style consumers. Preserve the [UI matrix](https://github.com/querry-kit/nuxt-ui/blob/a63116e/.github/workflows/test.yml), [optional Nest peers](https://github.com/querry-kit/nest/blob/ad68cba/test/optional-validation-peers.mjs) and [Workboard verification](https://github.com/querry-kit/example/blob/f7f7d0b/.github/workflows/ci.yml). Use an always-reported CI result for protection, with full checks for changes to root policy, lockfile or workflows.

**Rationale:** Hoisting and workspace links can hide missing exports, optional dependencies, or incompatibilities with older peers. Workboard currently requires `verify`; the central repository allows merge commits and its observed main rule protects deletion, not an equivalent required CI result. Verify rules again at freeze.

**Alternatives considered:** Source tests alone cannot certify tarballs; path-filtering away an entire required workflow can leave its status pending.

### Which site is released?

**Decision:** Build previews against the candidate workspace; label unreleased behavior “Next” in production or defer that demo until npm verification. Keep Pages at its existing project base, deployable from a reviewed docs revision without an npm release. Replace changelog fetching with local changelog inputs only after comparing generated pages.

**Rationale:** The current [Pages workflow](https://github.com/querry-kit/querry-kit/blob/34b2dca/.github/workflows/docs.yml) responds to package dispatches and a six-hour schedule, shares write permissions with the build and checks selected prerendered HTML files. HTML presence does not prove that CSS, icons or interactions work under the base path.

**Alternatives considered:** Always presenting `main` as released misleads readers; coupling Pages to npm prevents docs-only corrections.

At inspection all 44 sitemap routes responded, yet first changelog headings were Nest `2.1.1`, Nuxt `1.1.1` and UI `4.2.0`. Docs also resolved Nuxt `1.1.1` and UI `4.2.0`, behind npm. Verify rendered **version headings and behavior**, not only status codes. See the [deployed baseline](https://api.github.com/repos/querry-kit/querry-kit/deployments/7984879167/statuses).

### What happens to the two Workboards?

**Decision:** Keep `querry-kit/example` as the sole runnable Workboard by default. Preserve the embedded app's project graph in a tested Nest teaching fixture; it is not a new canonical endpoint. Preserve the legacy source permalink and map all active inbound links. See the [fixture and data ownership contract](contracts/consumers.md).

**Rationale:** The [embedded schema](https://github.com/querry-kit/querry-kit/blob/34b2dca/examples/workboard/api/prisma/schema.prisma) models workspaces, members and UUID projects; the [canonical schema](https://github.com/querry-kit/example/blob/f7f7d0b/apps/api/prisma/schema.prisma) models accounts, profiles and scoped tasks. Both dev DBs default to port 54329 but use different engines, storage and seed semantics. The old seed deletes data; the canonical seed populates only empty application tables. The unique nested projection can be taught without keeping two applications running.

**Alternatives considered:** Combining databases or silently remapping old HTTP calls changes their meaning. Retain a private, isolated `examples/workboard-legacy` only for a demonstrated consumer of the exact old HTTP contract, with a named owner and removal once that consumer and its links move.
