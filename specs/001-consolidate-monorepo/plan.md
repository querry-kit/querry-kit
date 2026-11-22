# Implementation Plan: Consolidate Querry Kit

**Issue branch:** `53-plan-consolidate-querry-kit-into-a-monorepo-with-three-independent-npm-packages` · **Spec Kit feature:** `001-consolidate-monorepo` · **Date:** 2026-11-22

**Input:** [Issue #53](https://github.com/querry-kit/querry-kit/issues/53) · [Feature specification](spec.md) · **Integration base:** `main`

## Summary

Keep `querry-kit/querry-kit` as the repository and Pages site. **The first implementation PR is import-only:** bring in `nest`, `nuxt`, `nuxt-ui` and `example` with every commit reachable from their frozen source refs, preserving original SHAs. No workspace, package, example, docs or CI edits begin until a fresh clone of the merged monorepo proves the complete history is present. The import creates no release.

## Technical context

- **Runtime/tooling:** Private workspace Node `>=26.13.0 <27`, pnpm `11.28.9`; preserve public engine floors, TypeScript 6/7 toolchains, package-local configuration, lint conventions and CI commands.
- **Systems:** Nest/Fastify, Nuxt, Nuxt UI, Prisma/PostgreSQL, Docker Compose, GitHub Actions/Pages, npm Trusted Publishing and Changesets. PostgreSQL belongs to Workboard, not to the migration.
- **Proof:** Package-native tests, isolated tarball/import/type tests, published-peer matrix, disposable API/DB integration, Playwright, static Pages preview, ancestry and release-selection checks.
- **Scale and performance:** Five repositories, three public packages, one private docs app and three canonical private Workboard packages. Optimize CI by dependency closure; no runtime performance target or feature change.

## Constitution check

Before research: `.specify/memory/constitution.md` contains only an unratified template. There are no ratified constitutional gates to apply. The binding constraints for this plan are issue #53, existing published contracts, repository policies, and `apps/docs/AGENTS.md`. After design: each constraint has an evidence gate below; the migration does not change policy by filling in the constitution. No design exceptions. The history-preserving merge is an explicit **operational prerequisite**, not a pre-approved exception.

## Project structure

```text
packages/{nest,nuxt,nuxt-ui}/           independently shipped libraries
apps/docs/                             existing private Pages site
examples/workboard/apps/{api,app}/     canonical private services
examples/workboard/libs/contracts/     private shared schemas
examples/workboard/compose{,.dev}.yml  standalone / development entry points
.changeset/                            one active queue
.github/workflows/                     CI, Pages, versioning, publishing
package.json, pnpm-workspace.yaml, pnpm-lock.yaml
```

Feature artifacts: [research](research.md), [data model](data-model.md), [package contract](contracts/packages.md), [consumer contract](contracts/consumers.md), [release contract](contracts/release.md), [validation guide](quickstart.md). `checklists/requirements.md` covers the prerequisite specification.

## Delivery sequence and review boundaries

**What a contributor gets:** A normal full clone of the monorepo contains the four original commit graphs as ancestors of `main`. `git log --graph main` traverses them and `git show <original-sha>` opens a historical commit with its original author, message, parents and file paths. No old remote, special archive ref or separate clone is required. Files acquire their monorepo prefixes at import; rewriting earlier paths would change the original SHAs.

At A1, freeze **all** available refs for each source, not just `main`: branches, lightweight and annotated tags (including release-only `dist` commits), published PR refs and other advertised commit-bearing refs. Record ref names, object IDs, peeled commit tips and the full commit-ID list per repository. Include recoverable local-only history identified by maintainers before freeze; missing expected objects block sign-off. Commits already deleted from every accessible copy cannot be guaranteed. Keep original tag names in the inventory, not in the destination's release-tag namespace.

| Review | Change and dependency | Evidence required to exit |
| --- | --- | --- |
| A1 · Freeze | Record all five source heads, PRs/issues and destination mappings, tags/releases, npm versions/dist-tags/integrities, exported file lists, pending changesets, CI, branch rules, Pages and publisher owners. Classify each pending change as released, carried once, private-only or explicitly deferred. Confirm merge-commit exception and owner availability. | Dated manifest with one SHA per repo and one verified artifact per library; no ambiguous queue entries or pending release races. [Planning snapshot](research.md) is the starting point. |
| A2 · Import only | Import the four frozen default-branch trees byte-for-byte via non-squashed subtree imports: `packages/{nest,nuxt,nuxt-ui}` and temporary `imports/example`. This leaves the existing `examples/workboard` untouched. Attach the remaining frozen commit tips as history-only merge parents, keeping each merge's first-parent tree unchanged. Do not apply side-branch code, rewrite commits, activate nested workflows or push colliding release tags. Land with a merge commit, never squash or rebase. | Run the [full-history gate](quickstart.md#1-verify-the-import-at-both-boundaries) on the PR head and again on merged `main` in a fresh central-only clone: four matching source trees, zero missing original commit IDs per repo, original destination still an ancestor. A failed gate blocks **all** adaptation work. |
| B1 · Workspace | Replace nested workspace configuration and locks after tree verification. Use only the membership patterns above (and exact legacy packages if explicitly retained). Classify all manifests; keep root and tooling/apps private. Reconcile overrides, patches, lifecycle permissions, peer rules and age policy against a cold install; record reasons and owners for exceptions. | Exactly one tracked workspace lock and three publishable packages. No sibling checkout. Root install/build works on a fresh clone with missing generated files. Package-local compiler/build targets unchanged. |
| B2 · Consumers | Remove vendor acquisition, SHA manifests and sibling-path overrides. Build workspace exports in dependency order. Move Docker build context to repository root; narrow `COPY`, `.dockerignore` and final stages. Update CSS source scanning, Prisma generation/migration paths, scripts and guides. Reconcile old example/link inventory; never attach existing DB data. Move docs changelogs to local package files, compare output, then retire dispatch/fetch triggers. | Canonical standalone and dev flows, independent fixture data, browser/asset checks and deep links pass. Production docs show release availability. No private host paths, secrets, staging copies or build checkout needed at runtime. |
| C1 · CI | Central root install/cache; run changed library and all dependent consumers. UI also tests registry peers outside the workspace. Docs-only runs docs checks; changes to shared config, lock, workflow or release tooling run everything. Preserve effective package-specific checks; one aggregate status reports failures/skips and can be made required. | All three isolated package checks, compact seeded API/browser integration, cold Docker restart, and Pages preview succeed. Verify actual required-check configuration before retiring the source CI. |
| C2 · Release rehearsal | Introduce one version PR for due libraries. Make namespace, allowlist, private handling, registry errors, provenance and retry behavior explicit in the [release contract](contracts/release.md). Run proposed versioning in isolated copies with no publish permissions. | One UI case, one two-library case, one docs-only case select the exact expected versions, tags and tarballs. No blanket version bump or unrelated peer edit. Record tarball hashes and release SHA. |
| D · Operational cutover | Re-freeze and resolve drift. Owner disables old publishing, updates npm binding, verifies it, then enables central publishing. Repeat separately per package. On a legitimate release, verify registry bytes, provenance, dist-tags and package tag, then verify production Pages. Transfer/cross-link outstanding work, update original READMEs and only then archive. | One active publishing path per enabled library, unchanged unaffected registry state, package-scoped tag at reviewed source, deployed Pages checks, old issue links accounted for. No archive on a dry run alone. |

Only after A2 passes on `main`, begin B1 with a separate path-only change: move the embedded Workboard aside and `imports/example` to `examples/workboard`, verify both trees, then edit workspace configuration. If sources advance after freeze, capture the delta and repeat the history gate before cutover.

## Stop and rollback

- Stop at the last passing boundary on unexplained source drift, data ownership conflict, broken packed contract, dependency on a sibling checkout, missing merge exception, or missing npm owner access.
- Before publication, revert integration/Pages commits as appropriate and redeploy the last known-good site artifact. For publisher rollback disable the central job first, restore and verify the old binding, then re-enable the old job. Do not reset a shared branch or a database.
- After partial publication, freeze the ledger and compare the registry to the tested tarballs; resume only missing pairs at the **same** release SHA. Never replace published bytes. Correct a defective release with a new version and deliberate dist-tag repair.
