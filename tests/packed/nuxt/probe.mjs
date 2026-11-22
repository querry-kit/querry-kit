import assert from 'node:assert/strict';
import { createApiClient } from '@querry-kit/nuxt/api';
import { loadNuxt } from '@nuxt/kit';
const api = createApiClient({ apiBaseUrl: 'https://api.example.test' });
assert.ok(api.defaults.baseURL.startsWith('https://api.example.test/'));
// The released package is a composable library. A consumer plugin, not a Nuxt module entry, installs its client.
const nuxt = await loadNuxt({
  cwd: process.cwd(),
  dev: false,
  overrides: { telemetry: false, plugins: ['./plugin.mjs'] },
});
try {
  assert.ok(nuxt.options.plugins.some((p) => (typeof p === 'string' ? p : p.src).endsWith('plugin.mjs')));
} finally {
  await nuxt.close();
}
