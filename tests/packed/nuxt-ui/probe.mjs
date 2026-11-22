import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadNuxt } from '@nuxt/kit';
import { FilterFieldType } from '@querry-kit/nuxt-ui/types';
assert.equal(FilterFieldType.Number, 'number');
for (const [name, version] of Object.entries(JSON.parse(process.env.EXPECT_PEERS))) {
  assert.equal(JSON.parse(await readFile(`node_modules/${name}/package.json`)).version, version);
}
const nuxt = await loadNuxt({
  cwd: process.cwd(),
  dev: false,
  overrides: { telemetry: false, modules: ['@nuxt/ui', '@querry-kit/nuxt-ui'] },
});
try {
  assert.ok(nuxt.options._installedModules.some((m) => m.meta?.name === '@querry-kit/nuxt-ui'));
} finally {
  await nuxt.close();
}
