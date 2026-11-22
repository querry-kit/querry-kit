# Publisher and Pages handoff

**Preflight: 2026-11-22 22:21 UTC.** Reviewed implementation `35181ba`. The migration PR can be reviewed independently of permission to publish. No publisher binding, branch rule, registry version, dist-tag or repository archival state was changed.

| Package | Registry `latest` | Last successful old publisher (`release.yml`) | Proposed new binding |
| --- | --- | --- | --- |
| `@querry-kit/nest` | `2.1.2` | `querry-kit/nest` at `ad68cba` | `querry-kit/querry-kit`, `publish.yml`, `npm-production` |
| `@querry-kit/nuxt` | `1.1.2` | `querry-kit/nuxt` at `ba5dfab` | same |
| `@querry-kit/nuxt-ui` | `4.3.0` | `querry-kit/nuxt-ui` at `a63116e` | same |

Registry dist-tags and the three published tarball integrities match `release-baseline.json`. Maintainer listed: `tobiaswaelde`. Historical attestations do not establish the current trusted-publisher settings; an npm owner must confirm each binding. Central `NPM_PUBLISH_ENABLED` and `NPM_ENABLED_PACKAGES` were absent; no `npm-production` environment existed. The only pending public change in this PR is the Nuxt UI keyboard fix.

**History and pending work.** Compared full advertised refs against `evidence/history/` again: no added or changed refs in the four source repositories. Nine temporary `archive/monorepo-53/*` branch names have disappeared since the import; every tip remains an ancestor of central `main`. Missing frozen commits: Nest **0/225**, Nuxt **0/222**, Nuxt UI **0/286**, example **0/41**. Each source had zero open issues/PRs. Destination integration work remains on #53. The legacy queues were classified at freeze; no outstanding public entry was recreated.

**Pages baseline.** The verified deployed revision is `047205332cda57c9f860a43749194f08b64c4e6a`, success deployment `7985664693`. Root, `/example/` and `/docs/nest/api/decorators-pipes-utils/` returned 200 at `https://querry-kit.github.io/querry-kit/`. Artifact `14774538654`, ZIP SHA-256 `1b5888435c91c18209f57fb517914bd1b2d8278b9e4694fa1817908ad7d67c61`, was separately downloaded and its digest checked. Retain that ZIP beyond Actions expiry before relying on it for rollback. Do not mistake this baseline for deployment of the migration PR.

## T030 — Owner operation after review and merge

1. Recheck the candidate SHA, workflow contents, hosted `Workspace checks`, source heads, npm integrities, dist-tags and any pending releases. If new commits appear, capture them and repeat the full-set history check. Record confirmation and time per package here.
2. Configure a protected `npm-production` GitHub environment restricted to `main`, with owner approval. Keep `NPM_PUBLISH_ENABLED` unset/false during initial setup. The per-package `NPM_ENABLED_PACKAGES` allowlist starts empty.
3. For each package, stop/disable its old publishing workflow and verify that no run is in flight. The npm owner records the old binding, switches trusted publishing to organization `querry-kit`, repository `querry-kit`, workflow filename **`publish.yml`**, environment **`npm-production`**, and verifies the exact binding. Only then add that full package name to the central allowlist. Enable `NPM_PUBLISH_ENABLED=true` only for confirmed bindings. Never allow two active paths for one package.
4. Before any publication, roll back by disabling central publishing for that package, waiting for active jobs to finish, restoring and verifying the old binding, then re-enabling the old workflow. Do not change versions or tags to test the transfer.

## T031 — First legitimate release, not a migration test

Review and merge the due Version Packages PR separately. From its reviewed `main` revision select the exact package names in **Publish reviewed packages**. The inspection job compares the first-parent version diff, pack metadata, archive digest and external consumers; the protected job receives the pre-inspected bytes. Record run URL, SHA, integrity, provenance, before/after dist-tags and scoped Git tags here. An unrelated package must retain all dist-tags. On partial success, rerun the failed job against the same artifact and SHA. Matching bytes and provenance are already complete; a mismatch, tag collision or unavailable registry stops the release. Never replace published bytes.

Verify the new Pages deployment revision and artifact separately. Check root, `/example/`, the compatibility route, all changelogs, favicon, navigation and a demo on mobile/desktop. If the deployment is defective, redeploy the retained last-good artifact without reverting npm state.

## T032 — Retire the source repositories

After T031, recheck open PRs/issues and out-of-band refs; transfer or link each outstanding item, add source README notices pointing to its monorepo directory, and record decisions per repository. Archival requires explicit owner authorization. Keep historical release URLs and commit links resolvable.
