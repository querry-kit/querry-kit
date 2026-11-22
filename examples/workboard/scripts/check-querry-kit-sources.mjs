import assert from 'node:assert/strict';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { parse } from 'yaml';

const root = new URL('../', import.meta.url);
const lock = parse(readFileSync(new URL('pnpm-lock.yaml', root), 'utf8'));
const packages = ['nest', 'nuxt', 'nuxt-ui'];
const pins = JSON.parse(readFileSync(new URL('scripts/querry-kit-sources.json', root), 'utf8'));
const prefix = '@querry-kit/';

/** Asserts that every Querry Kit lockfile entry is a workspace link, not a resolved registry package. */
function checkLockfile() {
  const found = new Set();
  for (const importer of Object.values(lock.importers)) {
    for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
      for (const [dependency, entry] of Object.entries(importer[section] ?? {})) {
        if (!dependency.startsWith(prefix)) continue;
        assert.match(entry.specifier, /^workspace:/, `${dependency} is not configured as a workspace dependency.`);
        assert.match(entry.version, /^link:/, `${dependency} is not linked in the lockfile.`);
        found.add(dependency);
      }
    }
  }
  assert.deepEqual(
    [...found].sort(),
    packages.map(/** Includes the package scope in each expected name. */ (name) => `${prefix}${name}`),
  );
  for (const name of [...Object.keys(lock.packages ?? {}), ...Object.keys(lock.snapshots ?? {})]) {
    assert.ok(!name.startsWith(prefix), `Unexpected registry snapshot: ${name}`);
  }
}

/** Inspects a consumer's actual install and verifies that its package exports exist. */
function checkInstalledExport(consumer, name) {
  const source = new URL(`vendor/${name}/`, root);
  const link = new URL(`${consumer}/node_modules/${prefix}${name}`, root);
  assert.equal(realpathSync(link), realpathSync(source));
  const manifest = JSON.parse(readFileSync(new URL('package.json', source), 'utf8'));
  const revision = readFileSync(new URL('.workboard-staged-source', source), 'utf8').trim();
  if (!revision.startsWith('local:')) assert.equal(revision, pins[name]);
  const entry = manifest.exports['.'].import;
  assert.ok(existsSync(new URL(entry, source)), `${manifest.name} is not built. Run pnpm sources:build.`);
}

/** Resolves both Nuxt consumers to the same built package file. */
function resolveNuxt(consumer) {
  return realpathSync(createRequire(new URL(`${consumer}/package.json`, root)).resolve('@querry-kit/nuxt'));
}

checkLockfile();
checkInstalledExport('apps/api', 'nest');
checkInstalledExport('apps/app', 'nuxt');
checkInstalledExport('apps/app', 'nuxt-ui');
assert.equal(resolveNuxt('apps/app'), resolveNuxt('vendor/nuxt-ui'));
console.log('Verified workspace-only Querry Kit links, builds, and a shared Nuxt resolution.');
