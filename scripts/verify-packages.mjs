import { verifyContract } from '../tests/packed/contracts/verify.mjs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const historical = process.argv.includes('--historical');
const baseline = historical
  ? JSON.parse(await readFile(join(root, 'specs/001-consolidate-monorepo/evidence/release-baseline.json')))
  : null;
const directory = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const out = directory ? resolve(directory) : await mkdtemp(join(tmpdir(), 'querry-kit-packs-'));
await mkdir(out, { recursive: true });
const ledger = [];
const digest = (bytes) => `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
const contents = (file, member) => execFileSync('tar', ['-xOzf', file, `package/${member}`]);
for (const id of ['nest', 'nuxt', 'nuxt-ui']) {
  const name = `@querry-kit/${id}`;
  const cwd = join(root, 'packages', id);
  const source = JSON.parse(await readFile(join(cwd, 'package.json')));
  execFileSync('pnpm', ['--config.ignore-scripts=true', 'pack', '--pack-destination', out], { cwd });
  const archive = join(out, `querry-kit-${id}-${source.version}.tgz`);
  const manifest = JSON.parse(contents(archive, 'package.json'));
  const files = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trimEnd().split('\n');
  assert.equal(manifest.name, name);
  assert.equal(manifest.version, source.version);
  assert.equal(manifest.private, false);
  assert.equal(manifest.repository.directory, `packages/${id}`);
  const contract = JSON.parse(await readFile(join(root, 'tests/packed/contracts', `${id}.json`)));
  verifyContract(
    manifest,
    files.map((member) => {
      assert.ok(member.startsWith('package/'));
      return member.slice(8);
    }),
    contract,
  );
  assert.deepEqual(contents(archive, 'LICENSE'), await readFile(join(cwd, 'LICENSE')));
  if (historical) {
    const reference = baseline.packages[name];
    const response = await fetch(reference.publishedTarball);
    assert.ok(response.ok, `Cannot read ${name} baseline: HTTP ${response.status}`);
    const published = Buffer.from(await response.arrayBuffer());
    assert.equal(digest(published), reference.integrity, `${name}: baseline integrity`);
    const original = join(out, `${id}-published.tgz`);
    await writeFile(original, published);

    for (const field of [
      'exports',
      'type',
      'main',
      'module',
      'types',
      'sideEffects',
      'license',
      'engines',
      'dependencies',
      'optionalDependencies',
      'peerDependencies',
      'peerDependenciesMeta',
      'publishConfig',
    ]) {
      assert.deepEqual(manifest[field], reference.manifest[field], `${name}: ${field}`);
    }
    assert.deepEqual(files.toSorted(), reference.files.toSorted(), `${name}: packed files`);
    assert.deepEqual(contents(archive, 'LICENSE'), contents(original, 'LICENSE'));
  }
  assert.ok(contents(archive, 'README.md').length > 0);
  ledger.push({
    name,
    version: manifest.version,
    archive: basename(archive),
    integrity: digest(await readFile(archive)),
  });
}
await writeFile(join(out, 'verified.json'), `${JSON.stringify(ledger, null, 2)}\n`);
console.log(`Verified three package archives: ${out}`);
if (!process.argv.includes('--archives-only')) {
  execFileSync(process.execPath, [join(root, 'scripts/test-packed-consumers.mjs'), out], { stdio: 'inherit' });
}
