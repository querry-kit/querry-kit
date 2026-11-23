import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verifyContract } from './verify.mjs';
const base = { name: 'demo', exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } } };
const contract = { manifest: base, requiredFiles: ['LICENSE'], incidental: [] };
const files = ['LICENSE', 'dist/index.d.ts', 'dist/index.js'];
test('accepts an additive public export only after review', () => {
  const addition = { ...base, exports: { ...base.exports, './other': { import: './dist/other.js' } } };
  const next = [...files, 'dist/other.js'];
  assert.throws(() => verifyContract(addition, next, contract), /exports/);
  verifyContract(addition, next, { ...contract, manifest: addition });
});
test('rejects missing declarations, local references and stray files', () => {
  assert.throws(() => verifyContract(base, files.slice(0, 1), contract), /Missing dist\/index.d.ts/);
  assert.throws(() => verifyContract({ ...base, dependencies: { x: 'workspace:*' } }, files, contract));
  assert.throws(() => verifyContract(base, [...files, 'dist/debug.env'], contract), /Unexpected/);
});
