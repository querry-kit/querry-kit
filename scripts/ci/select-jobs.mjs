import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const ids = ['nest', 'nuxt', 'nuxt-ui'];
const full = () => ({ libraries: [...ids], docs: true, consumers: true, packed: true });
export function select(paths) {
  if (!paths?.length) return full();
  const libraries = new Set();
  let docs = false,
    consumers = false,
    packed = false;
  for (const path of paths) {
    if (path.startsWith('apps/docs/')) {
      docs = true;
      continue;
    }
    if (path.startsWith('example/')) {
      consumers = true;
      continue;
    }
    const id = /^packages\/(nest|nuxt|nuxt-ui)\//.exec(path)?.[1];
    if (!id) return full();
    libraries.add(id);
    consumers = true;
    packed = true;
    if (id === 'nuxt') libraries.add('nuxt-ui');
    if (id !== 'nest' || path === `packages/${id}/CHANGELOG.md`) docs = true;
  }
  return { libraries: ids.filter((id) => libraries.has(id)), docs, consumers, packed };
}
export function changedPaths(output) {
  if (!output) return [];
  assert.ok(output.endsWith('\0'), 'Incomplete path list');
  return output.slice(0, -1).split('\0');
}
export function checkResults(plan, needs) {
  assert.equal(needs.scope.result, 'success');
  for (const name of ['libraries', 'docs', 'consumers', 'packed']) {
    const required = name === 'libraries' ? plan.libraries.length : plan[name];
    assert.equal(needs[name].result, required ? 'success' : 'skipped', `${name}: unexpected ${needs[name].result}`);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === 'verify') {
    const needs = JSON.parse(process.env.NEEDS);
    checkResults(JSON.parse(needs.scope.outputs.plan), needs);
  } else {
    let paths;
    const base = process.env.BASE;
    if (process.env.FORCE_FULL !== 'true' && /^[0-9a-f]{40}$/.test(base ?? '') && !/^0+$/.test(base)) {
      try {
        execFileSync('git', ['merge-base', '--is-ancestor', base, 'HEAD']);
        // --no-renames emits both pathnames and retains deletions. Unknown paths always fall back to full.
        paths = changedPaths(
          execFileSync('git', ['diff', '--no-renames', '--name-only', '-z', base, 'HEAD'], { encoding: 'utf8' }),
        );
      } catch {
        console.error('No reliable change set; running full matrix.');
      }
    }
    console.log(JSON.stringify(select(paths)));
  }
}
