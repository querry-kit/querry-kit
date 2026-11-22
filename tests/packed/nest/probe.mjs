import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
for (const pkg of ['class-validator', 'class-transformer']) assert.throws(() => require.resolve(pkg), { code: 'MODULE_NOT_FOUND' });
for (const load of [n => import(n), n => require(n)]) {
  const { QueryService } = await load('@querry-kit/nest/core');
  const { QuerySchema } = await load('@querry-kit/nest/zod');
  assert.equal(typeof QueryService, 'function');
  assert.equal(QuerySchema.parse({ page: '2' }).page, 2);
}
