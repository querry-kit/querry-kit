import assert from 'node:assert/strict';
import { test } from 'node:test';

import { taskAggregateSchema, taskGroupsSchema, type DemoSession } from '@workboard/contracts';

const base = process.env.WORKBOARD_TEST_API_URL ?? 'http://127.0.0.1:35463';
const origin = process.env.WORKBOARD_TEST_APP_ORIGIN ?? 'http://127.0.0.1:3201';

/** Creates the real session cookie for a seeded identity. */
async function signIn(login: DemoSession['login']): Promise<string> {
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

/** Sends one read request with its expected status and returns its JSON. */
async function read(cookie: string, query: string, status = 200) {
  const response = await fetch(`${base}/api/tasks/${query}`, { headers: { Cookie: cookie } });
  const data = await response.json();
  assert.equal(response.status, status, `${query}: ${JSON.stringify(data)}`);
  return data;
}

const open = encodeURIComponent(JSON.stringify({ status: 'OPEN' }));
const metrics =
  'where=' +
  open +
  '&_count[_all]=true&_sum[estimatedHours]=true&_avg[estimatedHours]=true&_min[estimatedHours]=true&_max[estimatedHours]=true';

test(
  'count, grouping and optional aggregates share the authorized filtered dataset',
  /** Executes real Fastify requests with independent fixture totals for each account. */
  async () => {
    for (const [login, count, sum, average, min, max] of [
      ['user1', 2, 8, 4, 2, 6],
      ['user2', 2, 12, 6, 3, 9],
      ['admin', 5, 30, 6, 2, 10],
    ] as const) {
      const cookie = await signIn(login);
      assert.equal(await read(cookie, `count?where=${open}`), count);
      assert.deepEqual(taskGroupsSchema.parse(await read(cookie, `group-by?by[0]=status&where=${open}`)), [
        { status: 'OPEN' },
      ]);
      assert.deepEqual(
        taskGroupsSchema.parse(await read(cookie, `group-by?by[0]=status&_count[_all]=true&where=${open}`)),
        [{ status: 'OPEN', _count: { _all: count } }],
      );
      const expected = {
        _count: { _all: count },
        _sum: { estimatedHours: sum },
        _avg: { estimatedHours: average },
        _min: { estimatedHours: min },
        _max: { estimatedHours: max },
      };
      assert.deepEqual(taskAggregateSchema.parse(await read(cookie, `aggregate?${metrics}`)), expected);
      assert.deepEqual(taskGroupsSchema.parse(await read(cookie, `group-by?by[0]=status&${metrics}`)), [
        { status: 'OPEN', ...expected },
      ]);
    }

    const user = await signIn('user1');
    const admin = await signIn('admin');
    const groups = 'group-by?by[0]=status&by[1]=priority&orderBy[priority]=desc&_count[_all]=true';
    const all = taskGroupsSchema.parse(await read(user, groups));
    assert.ok(all.length >= 3);
    assert.deepEqual(taskGroupsSchema.parse(await read(user, `${groups}&skip=1&take=1`)), all.slice(1, 2));
    assert.equal(
      taskGroupsSchema.parse(await read(user, 'group-by?by[0]=status&having[estimatedHours][_sum][gt]=5')).length,
      2,
    );
    assert.deepEqual(await read(user, 'aggregate?where[id]=001&_count[_all]=true&_sum[estimatedHours]=true'), {
      _count: { _all: 0 },
      _sum: { estimatedHours: null },
    });
    await read(user, 'group-by?by[0]=internalCostCents', 403);
    await read(user, 'group-by?by[0]=status&having[internalCostCents][_sum][gt]=1', 403);
    await read(user, 'group-by?by[0]=status&orderBy[internalCostCents]=asc', 403);
    await read(user, 'aggregate?_max[internalCostCents]=true', 403);
    await read(user, 'aggregate?_sum[estimatedHours]=true&where[internalCostCents][gt]=2', 403);
    await read(user, 'group-by?by[0]=status&by[1]=status', 400);
    await read(user, 'group-by?by[0]=status&orderBy[priority]=asc', 400);
    assert.deepEqual(await read(admin, 'aggregate?_max[internalCostCents]=true'), {
      _max: { internalCostCents: 98_765 },
    });
  },
);
