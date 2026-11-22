import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApiClient, useModuleApi, type EndpointDefinition } from '@querry-kit/nuxt';
import {
  demoSessionSchema,
  labelLookupPageSchema,
  projectLookupPageSchema,
  projectTablePageSchema,
  taskPageSchema,
  taskSchema,
  type DemoSession,
  type Task,
} from '@workboard/contracts';

import { createWorkboardAbility } from '../src/auth/workboard-ability.js';
import { DatabaseService } from '../src/database/database.service.js';
import { createScopedQuery } from '../src/query/scoped-query.js';

const api = process.env.WORKBOARD_TEST_API_URL ?? 'http://127.0.0.1:35463';
const origin = process.env.WORKBOARD_TEST_APP_ORIGIN ?? 'http://127.0.0.1:3201';

/** Read-only endpoint mapping used with the real package serializer. */
type Endpoints = { tasks: EndpointDefinition<Task, never, never> };

/** Selects a seeded account and returns the actual session cookie and validated identity. */
async function signIn(login: DemoSession['login']) {
  const response = await fetch(`${api}/api/demo/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ login }),
  });
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie);
  return { cookie, session: demoSessionSchema.parse(await response.json()) };
}

/** Sends a real authenticated read request and checks its expected status. */
async function request(path: string, cookie: string, status = 200) {
  const response = await fetch(`${api}${path}`, { headers: { Cookie: cookie } });
  assert.equal(response.status, status, `${path}: ${response.status === status ? '' : await response.text()}`);
  return response;
}

test(
  'validated scopes, projections, lookup hydration, and client serialization agree',
  /** Exercises the seeded Nest/Fastify and Prisma stack, not a mocked transport. */
  async () => {
    const user = await signIn('user1');
    const admin = await signIn('admin');
    assert.equal((await fetch(`${api}/api/tasks`)).status, 401);

    const axios = createApiClient({ apiBaseUrl: api });
    // This example's contract is unversioned. On `/api/v1`, keep the package client's default URL.
    axios.defaults.baseURL = `${api}/api`;
    axios.defaults.headers.common.Cookie = user.cookie;
    const tasks = useModuleApi<Endpoints, 'tasks'>(axios, 'tasks');
    const first = taskPageSchema.parse(
      (
        await tasks.query({
          where: { AND: [{ project: { id: 'shared' } }, { estimatedHours: { gte: 1 } }] },
          orderBy: [{ estimatedHours: 'asc' }, { title: 'desc' }],
          fields: 'id,project{title},owner{profile},labels{displayName}',
          page: 1,
          perPage: 1,
        })
      ).data,
    );
    assert.equal(first.meta.itemCount, 3);
    assert.equal(first.items[0]?.id, 'u1-5');
    assert.deepEqual(first.items[0]?.project, { title: 'Workboard' });
    assert.deepEqual(first.items[0]?.owner, { profile: { displayName: 'Avery Lane' } });
    assert.equal((await tasks.count({ where: { status: 'OPEN' } })).data, 2);

    const sorted = taskPageSchema.parse(
      (
        await tasks.query({
          where: JSON.stringify({ status: 'OPEN' }),
          orderBy: JSON.stringify([{ estimatedHours: 'desc' }]),
        })
      ).data,
    );
    assert.equal(sorted.items[0]?.id, 'u1-2');

    const detail = taskSchema.parse((await tasks.findById('u1-1')).data);
    assert.equal(detail.assignee, null);
    assert.deepEqual(detail.labels?.map(/** Reads public label names. */ ({ displayName }) => displayName).sort(), [
      'Review',
      'UX',
    ]);
    assert.equal('internalNote' in detail, false);
    assert.equal(detail.owner?.profile?.displayName, 'Avery Lane');
    const projectedAdmin = await request('/api/tasks/a6?fields=internalCostCents', admin.cookie);
    assert.deepEqual(taskSchema.parse(await projectedAdmin.json()), { internalCostCents: 98_765 });
    for (const [field, direction, firstId] of [
      ['owner', 'asc', 'u1-1'],
      ['project', 'asc', 'u1-2'],
      ['labels', 'desc', 'u1-1'],
      ['internalCostCents', 'desc', 'a6'],
    ]) {
      const response = await request(`/api/tasks?fields=id&perPage=1&orderBy[${field}]=${direction}`, admin.cookie);
      assert.deepEqual(taskPageSchema.parse(await response.json()).items, [{ id: firstId }]);
    }
    for (const route of ['/api/tasks/u2-1', '/api/tasks/find-by-id/u2-1', '/api/tasks/missing']) {
      await request(route, user.cookie, 404);
    }
    for (const query of [
      'fields=internalNote',
      'where[internalCostCents][gte]=1',
      'orderBy[internalNote]=asc',
      'orderBy[internalCostCents]=asc',
    ]) {
      await request(`/api/tasks?${query}`, user.cookie, 403);
    }
    for (const query of ['fields=owner{role}', 'where=%7Bbroken', 'perPage=101', 'include[project]=true']) {
      await request(`/api/tasks?${query}`, user.cookie, 400);
    }

    const projects = await request(
      '/api/projects?where[id][in][0]=shared&where[id][in][1]=docs&perPage=1000',
      user.cookie,
    );
    assert.deepEqual(projectLookupPageSchema.parse(await projects.json()).items, [
      { id: 'shared', slug: 'workboard', title: 'Workboard' },
    ]);
    await request('/api/projects?perPage=1000', user.cookie, 400);
    const labels = labelLookupPageSchema.parse(await (await request('/api/labels', user.cookie)).json());
    assert.deepEqual(
      labels.items.map(/** Uses stable lookup IDs rather than translated labels. */ ({ id }) => id),
      ['review', 'ux'],
    );

    const doc = await (await request('/docs/openapi.json', user.cookie)).json();
    const operation = doc.paths['/api/tasks'].get;
    assert.equal(operation['x-normalized-query'].properties.fields.type, 'string');
    const sortRule = operation['x-normalized-query'].properties.orderBy.anyOf[0].properties;
    assert.deepEqual(sortRule.owner.enum, ['asc', 'desc']);
    assert.equal(operation.responses['200'].content['application/json'].schema.properties.items.type, 'array');
    assert.ok(operation.responses['403']);

    const database = new DatabaseService();
    try {
      const service = createScopedQuery(database.task, 'Task');
      const ability = createWorkboardAbility(user.session);
      const one = await service.findOne<{ id: string }>({ where: { id: 'u1-1' } }, ability);
      assert.equal(one?.id, 'u1-1');
      await assert.rejects(service.findUnique({ where: { id: 'u2-1' } }, ability), { status: 404 });
      assert.equal((await service.findMany({ where: {} }, ability)).length, 6);
    } finally {
      await database.$disconnect();
    }
  },
);

test(
  'counts only visible tasks and sorts and filters projects before pagination',
  /** Checks the real project table response with both read scopes. */
  async () => {
    const admin = await signIn('admin');
    const user = await signIn('user1');
    const route = '/api/projects/table';
    await request(route, '', 401);
    const scoped = projectTablePageSchema.parse(await (await request(route, user.cookie)).json());
    assert.deepEqual(
      scoped.items.map(
        /** Compares visible projects and their owned task totals. */ ({ id, taskCount }) => [id, taskCount],
      ),
      [
        ['design', 3],
        ['shared', 3],
      ],
    );

    const params = new URLSearchParams({
      orderBy: JSON.stringify([{ taskCount: 'desc' }, { title: 'asc' }]),
      where: JSON.stringify({ taskCount: { gte: 4 } }),
      perPage: '1',
    });
    const first = projectTablePageSchema.parse(await (await request(`${route}?${params}`, admin.cookie)).json());
    assert.equal(first.items[0]?.id, 'shared');
    assert.equal(first.items[0]?.taskCount, 8);
    assert.equal(first.meta.itemCount, 2);
    params.set('page', '2');
    const next = projectTablePageSchema.parse(await (await request(`${route}?${params}`, admin.cookie)).json());
    assert.equal(next.items[0]?.id, 'ops');
    assert.equal(next.items[0]?.taskCount, 4);
    const denied = projectTablePageSchema.parse(await (await request(`${route}?${params}`, user.cookie)).json());
    assert.equal(denied.meta.itemCount, 0);
    assert.deepEqual(denied.items, []);

    await request(`${route}?where[taskCount][invalid]=1`, admin.cookie, 400);
    await request(`${route}?orderBy[internalCostCents]=desc`, admin.cookie, 400);
    const doc = await (await request('/docs/openapi.json', admin.cookie)).json();
    assert.equal(
      doc.paths[route].get.responses['200'].content['application/json'].schema.properties.items.items.properties
        .taskCount.type,
      'integer',
    );
  },
);
