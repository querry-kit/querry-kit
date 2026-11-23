import { test } from 'node:test';
import assert from 'node:assert/strict';
import { select, checkResults, changedPaths } from './select-jobs.mjs';
const all = { libraries: ['nest', 'nuxt', 'nuxt-ui'], docs: true, consumers: true, packed: true };
test('unknown, shared and indeterminate inputs select everything', () => {
  for (const paths of [
    undefined,
    [],
    ['pnpm-lock.yaml'],
    ['.github/workflows/docs.yml'],
    ['other/file'],
    ['apps/docs/a', 'unknown'],
  ])
    assert.deepEqual(select(paths), all);
});
test('downstream selection follows workspace and changelog consumers', () => {
  assert.deepEqual(select(['apps/docs/a']), { libraries: [], docs: true, consumers: false, packed: false });
  assert.deepEqual(select(['example/a']), { ...all, docs: false, packed: false, libraries: [] });
  assert.deepEqual(select(['packages/nest/src/a']), { ...all, libraries: ['nest'], docs: false });
  assert.deepEqual(select(['packages/nuxt/src/a']), { ...all, libraries: ['nuxt', 'nuxt-ui'] });
  assert.deepEqual(select(['packages/nuxt-ui/src/a', 'example/web/a']), { ...all, libraries: ['nuxt-ui'] });
  assert.deepEqual(select(['packages/nest/CHANGELOG.md']), { ...all, libraries: ['nest'] });
});
test('deletions and both sides of renames count, including embedded newlines', () => {
  assert.deepEqual(changedPaths('packages/nest/removed\0apps/docs/new\nname\0'), [
    'packages/nest/removed',
    'apps/docs/new\nname',
  ]);
  assert.deepEqual(select(changedPaths('packages/nest/removed\0apps/docs/new\nname\0')), {
    ...all,
    libraries: ['nest'],
  });
  assert.throws(() => changedPaths('truncated'));
});
test('aggregate rejects cancellation, unexpected skips, and unexpected execution', () => {
  const plan = select(['example/a']);
  const needs = {
    scope: { result: 'success' },
    docs: { result: 'skipped' },
    libraries: { result: 'skipped' },
    consumers: { result: 'success' },
    packed: { result: 'skipped' },
  };
  checkResults(plan, needs);
  for (const result of ['failure', 'skipped', 'cancelled'])
    assert.throws(() => checkResults(plan, { ...needs, consumers: { result } }));
  assert.throws(() => checkResults(plan, { ...needs, docs: { result: 'success' } }));
  assert.throws(() => checkResults(plan, { ...needs, scope: { result: 'cancelled' } }));
});
