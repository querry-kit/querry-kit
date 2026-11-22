# Validate the integration candidate

Run against the **implemented candidate** in a disposable fresh clone, without adjacent source trees, mounted application data, npm publication credentials or generated build output. Required: Git with full history, Node 26.13+ within 26.x, pnpm 11.28.9, npm, Docker Compose, curl, jq and Chromium for Playwright. Commands below run from the workspace root unless noted. `verify:packages` and `verify:release-plan` check packed consumers and rehearse versioning without publishing.

### 1. Verify the import at both boundaries

At freeze, take a full non-shallow mirror of **each** source, compare fetched refs to its advertised inventory, and add any confirmed local-only tips as refs. Preserve the ref map (including annotated tag object IDs) and save the sorted distinct commit IDs reachable from all commit-bearing refs, one SHA per line per repo. Record counts and checksums. Do not derive the expected list from the destination.

Run the following once per source, first on the import PR head, then in a **fresh, full, single-branch clone of central `main`**, without fetching source repos or relying on archive refs. Set `CANDIDATE` to the reviewed PR head or `origin/main`, `SOURCE_SHA` to the frozen default head, `PREFIX` to its import path (`imports/example` for Workboard), and `EXPECTED_IDS` to that source's verified frozen list:

```sh
set -eu
export LC_ALL=C
test -s "$EXPECTED_IDS"
actual_tree=$(git rev-parse --verify "$CANDIDATE:$PREFIX")
source_tree=$(git rev-parse --verify "$SOURCE_SHA^{tree}")
test "$actual_tree" = "$source_tree"
out=$(mktemp -d)
git rev-list "$CANDIDATE" > "$out/commits"
sort -u "$out/commits" > "$out/sorted"
comm -23 "$EXPECTED_IDS" "$out/sorted" > "$out/missing"
cat "$out/missing"
test ! -s "$out/missing"
```

Every missing list must be empty. Also run `git merge-base --is-ancestor "$DESTINATION_SHA" "$CANDIDATE"` and compare the import diff to the frozen destination: only the four new prefixes and agreed inventory evidence may be added. A `main`-only comparison, equal commit counts, or `git cat-file` lookups in the working clone do not prove completeness. Start the first adaptation only after the merged-clone gate passes.

### 2. Build from one checkout; test what ships

```sh
pnpm install --frozen-lockfile
pnpm build
git ls-files 'pnpm-lock.yaml' '**/pnpm-lock.yaml'
pnpm -r list --depth -1
pnpm verify:packages
```

Expect only `pnpm-lock.yaml`; compare members/privacy to the plan. Root build prepares library exports before consumers. The last command must pack all three libraries, compare each with its frozen registry manifest and file list, then install in separate temporary projects outside the workspace. Test runtime imports, declarations, module setup, absent optional peers and all four published-peer matrix cells per [package contract](contracts/packages.md). An install that resolves modules through the monorepo does not count.

### 3. Exercise both Workboard modes

Use a clean disposable clone so neither Compose file can touch pre-existing bind-mounted data. Install browser dependencies once:

```sh
pnpm --filter @workboard/app exec playwright install --with-deps chromium
bash examples/workboard/scripts/test-api.sh
bash examples/workboard/scripts/test-compose.sh
```

Preserve/adapt these canonical script paths. Expected: live Fastify and PostgreSQL; cold image build without vendor sources or host Node; app port exposed on loopback, API/DB internal; OpenAPI group-by route present; 18 compact seeded task IDs unchanged across restart; browser tests exercise desktop/mobile views and persona-scoped reads. Inspect final image layers for local env files, staging trees, credentials and machine-specific paths.

Then start **development mode** separately, on unused ports and a fresh database directory:

```sh
docker compose -p qk-plan53-dev -f examples/workboard/compose.dev.yml up -d --wait
pnpm --filter @workboard/api dev
# In a second terminal:
pnpm --filter @workboard/app dev
# Once both are listening:
curl -fsS http://127.0.0.1:3101/api/health/ready
curl -fsS http://127.0.0.1:3201/docs/openapi.json | jq -e '.paths["/api/tasks/group-by"].get != null'
```

Open the dashboard, change persona, filter/group tasks and inspect a projection. Stop the two host processes and run `docker compose -p qk-plan53-dev -f examples/workboard/compose.dev.yml down`. Exercise the legacy teaching cases and original inbound links in the [consumer contract](contracts/consumers.md); a working canonical dashboard does not cover those cases automatically.

### 4. Exercise Pages at its real prefix

```sh
pnpm --dir apps/docs exec playwright install --with-deps chromium
pnpm docs:lint
pnpm docs:typecheck
pnpm docs:test
NUXT_APP_BASE_URL=/querry-kit/ pnpm docs:build
preview=$(mktemp -d)
ln -s "$PWD/apps/docs/.output/public" "$preview/querry-kit"
python3 -m http.server 4174 --bind 127.0.0.1 --directory "$preview"
```

With Python 3 available for that preview, open `http://127.0.0.1:4174/querry-kit/example/` and deep-link directly into each package guide/changelog. On desktop and mobile verify grouped tables, toolbar, icons, CSS, navigation, source links and release labels; no root-relative asset failures. Compare rendered changelogs to the frozen output plus intended changes. Repeat on the deployed Pages URL after authorized cutover. `docs:test` generates the static site and serves it at `/querry-kit/` on both viewport sizes.

### 5. Rehearse releases without publishing

```sh
pnpm verify:release-plan --case ui-only
pnpm verify:release-plan --case nest-and-ui
pnpm verify:release-plan --case docs-only
```

Each command creates an isolated disposable candidate, adds only its case's changes, runs Changesets version computation, then exercises the same pack/selection logic as production without registry/tag writes. Expected public sets: UI; Nest and UI; empty. Compare every version, tag candidate and digest; no unrelated version/peer changes. Simulate a successful first pair and a failed second pair: resume only the missing pair and fail closed on lookup errors or mismatching bytes. This is rehearsal evidence, not owner approval or proof of a real release.
