import assert from 'node:assert/strict';

export function verifyContract(manifest, members, { manifest: expected, requiredFiles, incidental }) {
  const files = new Set(members);
  for (const field of [
    'type',
    'main',
    'module',
    'types',
    'sideEffects',
    'engines',
    'exports',
    'name',
    'license',
    'peerDependencies',
    'peerDependenciesMeta',
    'publishConfig',
  ]) {
    assert.deepEqual(manifest[field], expected[field], `${manifest.name}: ${field}`);
  }
  const required = new Set(requiredFiles),
    allowed = new Set(requiredFiles);
  for (const entry of Object.values(expected.exports)) {
    for (const target of Object.values(entry)) {
      assert.match(target, /^\.\/dist\//);
      const name = target.slice(2);
      required.add(name);
      allowed.add(name);
      if (/\.(?:cjs|js)$/.test(name)) allowed.add(`${name}.map`);
    }
    if (entry.require && entry.types?.endsWith('.d.ts')) {
      const name = entry.types.replace(/^\.\//, '').replace(/\.d\.ts$/, '.d.cts');
      required.add(name);
      allowed.add(name);
    }
  }
  for (const name of required) assert.ok(files.has(name), `Missing ${name}`);
  const patterns = incidental.map((pattern) => new RegExp(pattern));
  for (const name of files)
    assert.ok(allowed.has(name) || patterns.some((pattern) => pattern.test(name)), `Unexpected ${name}`);
  for (const range of Object.values({
    ...manifest.dependencies,
    ...manifest.optionalDependencies,
    ...manifest.peerDependencies,
    ...manifest.devDependencies,
  })) {
    assert.doesNotMatch(
      range,
      /^(?:workspace:|file:|link:|git|github:|https?:|\.{1,2}\/|\/)|^[\w.-]+\/[\w.-]+(?:#.*)?$/,
    );
  }
}
