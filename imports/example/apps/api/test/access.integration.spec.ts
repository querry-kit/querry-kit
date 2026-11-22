import assert from 'node:assert/strict';
import { test } from 'node:test';

import { labelLookupPageSchema, projectLookupPageSchema, taskPageSchema, type DemoSession } from '@workboard/contracts';

const base = process.env.WORKBOARD_TEST_API_URL ?? 'http://127.0.0.1:35463';
const origin = process.env.WORKBOARD_TEST_APP_ORIGIN ?? 'http://127.0.0.1:3201';

/** Signs in as one of the synthetic identities through Fastify. */
async function select(login: DemoSession['login']): Promise<string> {
  const response = await fetch(`${base}/api/demo/session`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ login }),
  });
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie);
  return cookie;
}

/** Checks an authenticated endpoint response without changing server state. */
async function read(cookie: string, path: string, status = 200) {
  const response = await fetch(`${base}/api/${path}`, { headers: { Cookie: cookie } });
  assert.equal(response.status, status, path);
  return response.json();
}

test(
  'same-role accounts cannot reach one another’s rows, lookup options, or internal fields',
  /** Compares the real data and public contract across all three signed identities. */
  async () => {
    const user1 = await select('user1');
    const user2 = await select('user2');
    const admin = await select('admin');
    for (const [cookie, prefix, other] of [
      [user1, 'u1', 'u2'],
      [user2, 'u2', 'u1'],
    ] as const) {
      const page = taskPageSchema.parse(await read(cookie, 'tasks?fields=id&perPage=100'));
      assert.deepEqual(
        page.items.map(/** Extracts the exact visible IDs, not just a count. */ (item) => item.id),
        [1, 2, 3, 4, 5, 6].map(
          /** Constructs the expected independent ID set from fixture labels. */ (n) => `${prefix}-${n}`,
        ),
      );
      await read(cookie, `tasks/${other}-1`, 404);
      await read(cookie, `tasks/find-by-id/${other}-1`, 404);
      await read(cookie, 'tasks?fields=internalCostCents', 403);
      await read(cookie, 'tasks?where[internalNote][contains]=demo', 403);
      await read(cookie, 'tasks?orderBy[internalCostCents]=asc', 403);
    }

    const firstProjects = projectLookupPageSchema.parse(await read(user1, 'projects'));
    const secondProjects = projectLookupPageSchema.parse(await read(user2, 'projects'));
    assert.deepEqual(
      firstProjects.items.map(/** Extracts project identifiers. */ (project) => project.id),
      ['design', 'shared'],
    );
    assert.deepEqual(
      secondProjects.items.map(/** Extracts project identifiers. */ (project) => project.id),
      ['docs', 'shared'],
    );
    const secondLabels = labelLookupPageSchema.parse(await read(user2, 'labels'));
    assert.deepEqual(
      secondLabels.items.map(/** Extracts label identifiers. */ (label) => label.id),
      ['guide', 'review'],
    );
    const privileged = taskPageSchema.parse(await read(admin, 'tasks?fields=id,internalCostCents&perPage=100'));
    assert.equal(privileged.meta.itemCount, 18);
    assert.equal(
      privileged.items.find(/** Selects the admin-only fixture. */ (item) => item.id === 'a6')?.internalCostCents,
      98_765,
    );
  },
);
