import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const ids = ['nest', 'nuxt', 'nuxt-ui'];
export const hash = bytes => `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
export const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trimEnd();
export const sameSet = (actual, expected) => assert.deepEqual(actual.toSorted(), expected.toSorted(), 'Unexpected release set');
const registry = 'https://registry.npmjs.org';

export function candidates(manifests, previous, expected) {
  const allowed = ids.map(id => `packages/${id}/package.json`);
  const found = [];
  for (const [path, pkg] of Object.entries(manifests)) {
    if (!allowed.includes(path)) {
      assert.equal(pkg.private, true, `Unexpected publishable manifest: ${path}`);
      continue;
    }
    const name = `@querry-kit/${path.split('/')[1]}`;
    assert.equal(pkg.name, name);
    assert.equal(pkg.private, false);
    assert.equal(pkg.repository.directory, path.slice(0, -13));
    assert.equal(pkg.publishConfig.access, 'public');
    const before = previous[path];
    assert.equal(before.name, name);
    if (before.version === pkg.version) continue;
    assert.match(pkg.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
    const old = before.version.split('.').map(Number);
    const parts = pkg.version.split('.').map(Number);
    const i = parts.findIndex((v, n) => v !== old[n]);
    assert.ok(i >= 0 && parts[i] > old[i], 'Version must advance');
    found.push({ name, version: pkg.version, previous: before.version, tag: `${name}@${pkg.version}` });
  }
  for (const path of allowed) assert.ok(manifests[path], `Missing manifest: ${path}`);
  sameSet(found.map(c => c.name), expected);
  return found;
}

export function fromCommit(sha, expected) {
  assert.match(sha, /^[0-9a-f]{40}$/);
  const paths = git('ls-tree', '-rz', '--name-only', sha).split('\0').filter(p => /(^|\/)package\.json$/.test(p));
  const read = (rev, path) => JSON.parse(git('show', `${rev}:${path}`));
  return candidates(Object.fromEntries(paths.map(p => [p, read(sha, p)])),
    Object.fromEntries(ids.map(id => { const p = `packages/${id}/package.json`; return [p, read(`${sha}^1`, p)]; })), expected);
}

export async function checkPack(dir, candidate, entry) {
  assert.equal(entry.name, candidate.name);
  assert.equal(entry.version, candidate.version);
  assert.equal(entry.archive, `${candidate.name.slice(1).replace('/', '-')}-${entry.version}.tgz`);
  const path = join(dir, entry.archive);
  assert.equal(hash(await readFile(path)), entry.integrity);
  const m = JSON.parse(execFileSync('tar', ['-xOzf', path, 'package/package.json']));
  assert.equal(m.name, candidate.name);
  assert.equal(m.version, candidate.version);
  assert.equal(m.private, false);
  assert.equal(m.repository.directory, `packages/${m.name.split('/')[1]}`);
  return path;
}

export async function readRegistry(name, request = fetch) {
  const r = await request(`${registry}/${encodeURIComponent(name)}`);
  assert.ok(r.ok, `Registry ${name}: HTTP ${r.status}`);
  const pkg = await r.json();
  assert.equal(pkg.name, name);
  assert.ok(pkg.versions && typeof pkg.versions === 'object' && pkg['dist-tags']?.latest);
  return pkg;
}

export async function disposition(c, pack, record, sha, request = fetch) {
  const v = record.versions[c.version];
  if (!v) {
    assert.equal(record['dist-tags'].latest, c.previous, `${c.name}: baseline latest changed`);
    return 'missing';
  }
  assert.equal(v.name, c.name);
  assert.equal(v.version, c.version);
  assert.equal(v.dist.integrity, pack.integrity);
  assert.equal(record['dist-tags'].latest, c.version);
  const attestation = new URL(v.dist.attestations.url);
  assert.equal(attestation.origin, registry);
  const r = await request(attestation);
  assert.ok(r.ok, `Cannot verify provenance: HTTP ${r.status}`);
  const { attestations } = await r.json();
  assert.ok(attestations.some(a => {
    if (a.predicateType !== 'https://slsa.dev/provenance/v1') return false;
    const s = JSON.parse(Buffer.from(a.bundle.dsseEnvelope.payload, 'base64'));
    const def = s.predicate.buildDefinition;
    const workflow = def.externalParameters.workflow;
    return s._type === 'https://in-toto.io/Statement/v1' && s.predicateType === a.predicateType &&
      workflow.repository === 'https://github.com/querry-kit/querry-kit' &&
      workflow.path === '.github/workflows/publish.yml' && workflow.ref === 'refs/heads/main' &&
      def.resolvedDependencies.some(d => d.uri === 'git+https://github.com/querry-kit/querry-kit@refs/heads/main' && d.digest?.gitCommit === sha) &&
      s.subject.some(sub => sub.name === `pkg:npm/${c.name.replace('@', '%40')}@${c.version}` &&
        sub.digest.sha512 === Buffer.from(pack.integrity.slice(7), 'base64').toString('hex'));
  }), `${c.name}: reviewed commit or provenance mismatch`);
  return 'complete';
}
