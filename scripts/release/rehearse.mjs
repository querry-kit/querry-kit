import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { candidates, checkPack, disposition, fromCommit, git, hash, ids, readRegistry } from './verify-candidates.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const inputs = git('ls-files', '-z', '*package.json').split('\0').filter(Boolean);
const manifests = async (base) =>
  Object.fromEntries(await Promise.all(inputs.map(async (p) => [p, JSON.parse(await readFile(join(base, p)))])));
const original = await manifests(root);
const copy = async (base, path) => {
  await mkdir(dirname(join(base, path)), { recursive: true });
  await cp(join(root, path), join(base, path), { recursive: true });
};
const ledger = [];
const cases = { 'ui-only': ['nuxt-ui'], 'nest-and-ui': ['nest', 'nuxt-ui'], 'docs-only': [] };
const args = process.argv.slice(2);
assert.ok(!args.length || (args.length === 2 && args[0] === '--case' && Object.hasOwn(cases, args[1])));
for (const names of args.length ? [cases[args[1]]] : Object.values(cases)) {
  const cwd = await mkdtemp(join(tmpdir(), 'qk-version-'));
  const run = (cmd, args) => execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim();
  for (const p of [...inputs, 'pnpm-workspace.yaml', 'pnpm-lock.yaml', 'patches', '.changeset/config.json'])
    await copy(cwd, p);
  for (const id of ids)
    for (const f of ['LICENSE', 'README.md', 'CHANGELOG.md', 'dist']) await copy(cwd, `packages/${id}/${f}`);
  await symlink(join(root, 'node_modules'), join(cwd, 'node_modules'), 'dir');
  run('git', ['init', '-q', '-b', 'main']);
  run('git', ['add', '--', '*.json', '*.yaml', '*.md', 'patches']);
  run('git', ['-c', 'user.name=Rehearsal', '-c', 'user.email=rehearsal@example.invalid', 'commit', '-qm', 'baseline']);
  const expected = names.map((id) => `@querry-kit/${id}`);
  const requested = expected.length ? expected : [original['package.json'].name];
  await writeFile(
    join(cwd, '.changeset/probe.md'),
    `---\n${requested.map((n) => `"${n}": patch`).join('\n')}\n---\n\nRehearsal only.\n`,
  );
  if (!expected.length) {
    // Historical private-site entries must not silently select any public package.
    assert.throws(
      () => run(join(root, 'node_modules/.bin/changeset'), ['version']),
      (error) =>
        String(error.stdout).includes(`package ${original['package.json'].name} which is not in the workspace`),
    );
    await writeFile(join(cwd, '.changeset/probe.md'), '---\n---\n\nPrivate documentation only.\n');
    await writeFile(join(cwd, 'apps/docs/README.md'), 'Documentation rehearsal.\n');
  }
  run(join(root, 'node_modules/.bin/changeset'), ['version']);
  await rm(join(cwd, 'node_modules'));
  run('pnpm', ['install', '--lockfile-only', '--offline', '--no-frozen-lockfile']);
  const changed = await manifests(cwd);
  const due = candidates(changed, original, expected);
  run('git', ['add', '-u']);
  run('git', [
    '-c',
    'user.name=Rehearsal',
    '-c',
    'user.email=rehearsal@example.invalid',
    'commit',
    '-qm',
    'reviewed rehearsal',
    '--allow-empty',
  ]);
  const reviewed = run('git', ['rev-parse', 'HEAD']);
  const previousCwd = process.cwd();
  try {
    process.chdir(cwd);
    assert.deepEqual(fromCommit(reviewed, expected), due);
  } finally {
    process.chdir(previousCwd);
  }
  for (const p of inputs)
    if (!expected.includes(changed[p].name))
      assert.deepEqual(changed[p], original[p], `Unrelated manifest changed: ${p}`);
  const results = [];
  for (const c of due) {
    const id = c.name.split('/')[1];
    assert.equal(
      c.version,
      c.previous.replace(/\d+$/, (s) => String(Number(s) + 1)),
    );
    run('pnpm', ['--dir', `packages/${id}`, '--config.ignore-scripts=true', 'pack', '--pack-destination', cwd]);
    const archive = `querry-kit-${id}-${c.version}.tgz`;
    const pack = { ...c, archive, integrity: hash(await readFile(join(cwd, archive))) };
    await checkPack(cwd, c, pack);
    await assert.rejects(checkPack(cwd, c, { ...pack, name: 'unexpected' }));
    const sha = run('git', ['rev-parse', 'HEAD']);
    const record = { versions: {}, 'dist-tags': { latest: c.previous } };
    assert.equal(await disposition(c, pack, record, sha), 'missing');
    const statement = {
      _type: 'https://in-toto.io/Statement/v1',
      predicateType: 'https://slsa.dev/provenance/v1',
      subject: [
        {
          name: `pkg:npm/${c.name.replace('@', '%40')}@${c.version}`,
          digest: { sha512: Buffer.from(pack.integrity.slice(7), 'base64').toString('hex') },
        },
      ],
      predicate: {
        buildDefinition: {
          externalParameters: {
            workflow: {
              repository: 'https://github.com/querry-kit/querry-kit',
              path: '.github/workflows/publish.yml',
              ref: 'refs/heads/main',
            },
          },
          resolvedDependencies: [
            { uri: 'git+https://github.com/querry-kit/querry-kit@refs/heads/main', digest: { gitCommit: sha } },
          ],
        },
      },
    };
    const proof = async () =>
      Response.json({
        attestations: [
          {
            predicateType: 'https://slsa.dev/provenance/v1',
            bundle: { dsseEnvelope: { payload: Buffer.from(JSON.stringify(statement)).toString('base64') } },
          },
        ],
      });
    const published = {
      ...record,
      versions: {
        [c.version]: {
          name: c.name,
          version: c.version,
          dist: { integrity: pack.integrity, attestations: { url: 'https://registry.npmjs.org/mock' } },
        },
      },
      'dist-tags': { latest: c.version },
    };
    assert.equal(await disposition(c, pack, published, sha, proof), 'complete');
    await assert.rejects(disposition(c, pack, published, '0'.repeat(40), proof));
    await assert.rejects(disposition(c, { ...pack, integrity: 'mismatch' }, published, sha, proof));
    results.push({
      name: c.name,
      version: c.version,
      tag: c.tag,
      integrity: pack.integrity,
      retry: await disposition(c, pack, results.length ? record : published, sha, proof),
    });
  }
  if (names.length === 2)
    assert.deepEqual(
      results.map((r) => r.retry),
      ['complete', 'missing'],
    );
  assert.throws(() => candidates({ ...changed, 'other/package.json': { private: false } }, original, expected));
  assert.throws(() =>
    candidates(
      { ...changed, 'packages/nest/package.json': { ...changed['packages/nest/package.json'], name: '@wrong/nest' } },
      original,
      expected,
    ),
  );
  assert.throws(() =>
    candidates({ ...changed, 'wrong/package.json': changed['packages/nest/package.json'] }, original, expected),
  );
  assert.equal(run('git', ['tag', '--list']), '');
  ledger.push(results);
  await rm(cwd, { recursive: true });
}
await assert.rejects(
  readRegistry('@querry-kit/nest', async () => new Response(null, { status: 503 })),
  /503/,
);
console.log(JSON.stringify({ sha: git('rev-parse', 'HEAD'), rehearsals: ledger }, null, 2));
