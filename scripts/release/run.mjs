import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { checkPack, disposition, fromCommit, git, ids, readRegistry, sameSet } from './verify-candidates.mjs';

const [mode, dir, names] = process.argv.slice(2);
assert.ok(['inspect', 'publish'].includes(mode));
const sha = git('rev-parse', 'HEAD');
const due = fromCommit(
  sha,
  names.split(',').map((n) => n.trim()),
);
assert.ok(due.length > 0);
const packs = JSON.parse(await readFile(join(dir, 'verified.json')));
sameSet(
  packs.map((p) => p.name),
  ids.map((id) => `@querry-kit/${id}`),
);
const snapshot = {};
for (const id of ids) {
  const name = `@querry-kit/${id}`;
  snapshot[name] = (await readRegistry(name))['dist-tags'];
}
const ledgerFile = join(dir, 'release.json');
const entries = [];
for (const c of due) {
  const pack = packs.find((p) => p.name === c.name);
  const archive = await checkPack(dir, c, pack);
  const state = await disposition(c, pack, await readRegistry(c.name), sha);
  const remote = git('ls-remote', '--tags', 'origin', `refs/tags/${c.tag}`);
  if (remote) {
    assert.equal(remote.split(/\s+/)[0], sha, `Tag collision: ${c.tag}`);
    assert.equal(state, 'complete', `Tag exists without matching published artifact: ${c.tag}`);
  }
  entries.push({ c, pack, archive, state });
}
if (mode === 'inspect') {
  await writeFile(ledgerFile, JSON.stringify({ sha, due, packs, snapshot }, null, 2));
} else {
  const approved = JSON.parse(await readFile(ledgerFile));
  assert.equal(process.env.GITHUB_REPOSITORY, 'querry-kit/querry-kit');
  assert.equal(process.env.GITHUB_REF, 'refs/heads/main');
  assert.equal(process.env.GITHUB_SHA, sha);
  assert.equal(approved.sha, sha);
  assert.deepEqual(approved.due, due);
  assert.deepEqual(approved.packs, packs);
  const enabled = (process.env.NPM_ENABLED_PACKAGES || '').split(',').map((s) => s.trim());
  const checkTags = (name, current, allowedLatest) => {
    const expected = { ...approved.snapshot[name] };
    if (allowedLatest && due.some((c) => c.name === name)) expected.latest = allowedLatest;
    assert.deepEqual(current, expected, `${name}: unexpected dist-tag change`);
  };
  for (const [name, tags] of Object.entries(snapshot)) {
    const e = entries.find(({ c }) => c.name === name);
    checkTags(name, tags, e?.state === 'complete' ? e.c.version : undefined);
  }
  for (const { c } of entries) assert.ok(enabled.includes(c.name), `Publisher not enabled for ${c.name}`);
  for (const { c, pack, archive } of entries) {
    if ((await disposition(c, pack, await readRegistry(c.name), sha)) === 'missing') {
      execFileSync(
        'npm',
        [
          'publish',
          archive,
          '--ignore-scripts',
          '--provenance',
          '--access',
          'public',
          '--registry=https://registry.npmjs.org',
        ],
        { stdio: 'inherit' },
      );
    }
    assert.equal(await disposition(c, pack, await readRegistry(c.name), sha), 'complete');
    git('push', 'origin', `${sha}:refs/tags/${c.tag}`);
  }
  for (const name of Object.keys(snapshot)) {
    checkTags(name, (await readRegistry(name))['dist-tags'], due.find((c) => c.name === name)?.version);
  }
}
