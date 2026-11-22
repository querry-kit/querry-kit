import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PrismaPg } from '@prisma/adapter-pg';
import { projectLookupSchema, taskSchema, type DemoSession } from '@workboard/contracts';

import { PrismaClient } from '../src/generated/prisma/client.js';

const base = process.env.WORKBOARD_TEST_API_URL ?? 'http://127.0.0.1:35463';
const origin = process.env.WORKBOARD_TEST_APP_ORIGIN ?? 'http://127.0.0.1:3201';

/** Calls the real API with the session cookie and the demo's browser origin. */
async function request(
  method: string,
  path: string,
  status: number,
  cookie = '',
  body?: object,
  requestOrigin = origin,
): Promise<Response> {
  const response = await fetch(`${base}/api/${path}`, {
    method,
    headers: { Origin: requestOrigin, Cookie: cookie, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  assert.equal(response.status, status, `${method} ${path}: ${await response.clone().text()}`);
  return response;
}

/** Signs in through the same guarded session flow as the browser. */
async function select(login: DemoSession['login']): Promise<string> {
  const response = await request('POST', 'demo/session', 200, '', { login });
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie);
  return cookie;
}

test(
  'writes use validated inputs, owner scope, a trusted origin, and transactional deletes',
  /** Runs against disposable PostgreSQL with distinct regular and admin accounts. */
  async () => {
    const dbUrl = process.env.WORKBOARD_TEST_DATABASE_URL;
    assert.ok(dbUrl);
    const url = new URL(dbUrl);
    assert.equal(url.hostname, '127.0.0.1');
    assert.equal(url.pathname, '/workboard_test');
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) });

    try {
      const admin = await select('admin');
      const user1 = await select('user1');
      const user2 = await select('user2');
      const projectInput = { title: 'CRUD project', slug: 'crud-test-project' };
      await request('POST', 'projects', 401, '', projectInput);
      await request('POST', 'projects', 403, user1, projectInput);
      await request('POST', 'projects', 403, admin, projectInput, 'https://untrusted.invalid');
      await request('POST', 'projects', 400, admin, { ...projectInput, ownerId: 'u1' });
      const project = projectLookupSchema.parse(
        await (await request('POST', 'projects', 201, admin, projectInput)).json(),
      );
      await request('POST', 'projects', 409, admin, projectInput);
      await request('PATCH', `projects/${project.id}`, 400, admin, {});
      const updated = projectLookupSchema.parse(
        await (await request('PATCH', `projects/${project.id}`, 200, admin, { title: 'Updated project' })).json(),
      );
      assert.deepEqual(updated, { ...project, title: 'Updated project' });
      await request('DELETE', `projects/${project.id}`, 403, user1);
      const bulkPath = 'projects/bulk-delete';
      await request('POST', bulkPath, 403, user1, { ids: [project.id] });
      await request('POST', bulkPath, 400, admin, { ids: [] });
      await request('POST', bulkPath, 409, admin, { ids: [project.id, 'design'] });
      await request('POST', bulkPath, 404, admin, { ids: [project.id, 'missing'] });
      assert.ok(await db.project.findUnique({ where: { id: project.id } }));

      const input = { title: 'CRUD task', projectId: 'design', status: 'OPEN', priority: 'NORMAL', estimatedHours: 2 };
      await request('POST', 'tasks', 400, user1, { ...input, estimatedHours: -1 });
      await request('POST', 'tasks', 403, user1, { ...input, ownerLogin: 'user2' });
      await request('POST', 'tasks', 403, user1, { ...input, internalNote: 'private' });
      await request('POST', 'tasks', 404, user2, input);
      const ownTask = taskSchema.parse(await (await request('POST', 'tasks', 201, user1, input)).json());
      assert.ok(ownTask.id);
      assert.equal(ownTask.owner?.id, 'u1');
      assert.equal(ownTask.internalNote, undefined);

      await request('PATCH', `tasks/${ownTask.id}`, 404, user2, { title: 'Other account edit' });
      await request('DELETE', `tasks/${ownTask.id}`, 404, user2);
      await request('PATCH', `tasks/${ownTask.id}`, 403, user1, { internalCostCents: 1 });
      await request('PATCH', `tasks/${ownTask.id}`, 404, user1, { projectId: project.id });
      const task = taskSchema.parse(
        await (
          await request('PATCH', `tasks/${ownTask.id}`, 200, user1, { title: 'Updated task', status: 'DONE' })
        ).json(),
      );
      assert.equal(task.title, 'Updated task');
      assert.equal(task.status, 'DONE');
      assert.equal(task.estimatedHours, 2);
      await db.taskLabel.create({ data: { taskId: ownTask.id, labelId: 'review' } });
      const second = taskSchema.parse(await (await request('POST', 'tasks', 201, user1, input)).json());
      assert.ok(second.id);
      const selection = { ids: [ownTask.id, second.id] };
      const openapi = await (await fetch(`${base}/docs/openapi.json`)).json();
      const operation = openapi.paths['/api/tasks/bulk-delete'].post;
      assert.equal(operation.requestBody.content['application/json'].schema.anyOf[0].properties.ids.uniqueItems, true);
      assert.ok(operation.responses['204']);
      await request('POST', 'tasks/bulk-delete', 401, '', selection);
      await request('POST', 'tasks/bulk-delete', 403, user1, selection, 'https://untrusted.invalid');
      await request('POST', 'tasks/bulk-delete', 400, user1, { ids: [] });
      await request('POST', 'tasks/bulk-delete', 400, user1, { ids: [ownTask.id, ownTask.id] });
      await request('POST', 'tasks/bulk-delete', 404, user1, { ids: [ownTask.id, 'u2-1'] });
      await request('POST', 'tasks/bulk-delete', 404, user1, { ids: [ownTask.id, 'missing'] });
      await request('GET', `tasks/${ownTask.id}`, 200, user1);
      assert.equal(await db.taskLabel.count({ where: { taskId: ownTask.id } }), 1);
      assert.equal(await (await request('POST', 'tasks/bulk-delete', 204, user1, selection)).text(), '');
      await request('GET', `tasks/${ownTask.id}`, 404, user1);
      await request('GET', `tasks/${second.id}`, 404, user1);
      assert.equal(await db.taskLabel.count({ where: { taskId: ownTask.id } }), 0);
      assert.ok(await db.label.findUnique({ where: { id: 'review' } }));

      const assigned = taskSchema.parse(
        await (
          await request('POST', 'tasks', 201, admin, {
            ...input,
            projectId: project.id,
            ownerLogin: 'user2',
            internalCostCents: 123,
          })
        ).json(),
      );
      assert.ok(assigned.id);
      assert.equal(assigned.owner?.id, 'u2');
      assert.equal(assigned.internalCostCents, 123);
      const visible = taskSchema.parse(await (await request('GET', `tasks/${assigned.id}`, 200, user2)).json());
      assert.equal(visible.internalCostCents, undefined);
      await request('DELETE', `projects/${project.id}`, 409, admin);
      await request('DELETE', `tasks/${assigned.id}`, 204, admin);
      const secondProject = projectLookupSchema.parse(
        await (await request('POST', 'projects', 201, admin, { ...projectInput, slug: 'second-crud-project' })).json(),
      );
      assert.equal(
        await (await request('POST', bulkPath, 204, admin, { ids: [project.id, secondProject.id] })).text(),
        '',
      );
      assert.equal(await db.project.count({ where: { id: { in: [project.id, secondProject.id] } } }), 0);
      await request('PATCH', `projects/${project.id}`, 404, admin, { title: 'Missing project' });
    } finally {
      await db.$disconnect();
    }
  },
);

test(
  'group deletion intersects the active filter with ownership and applies selection exceptions',
  /** Creates disposable tasks to prove isolation across owners and filter matches. */
  async () => {
    const admin = await select('admin');
    const user = await select('user1');
    const input = {
      title: 'Group delete fixture',
      projectId: 'design',
      status: 'DONE',
      priority: 'LOW',
      estimatedHours: 1,
    };

    /** Creates a task through the real write endpoint and returns its ID. */
    async function create(overrides: object = {}): Promise<string> {
      const response = await request('POST', 'tasks', 201, admin, { ...input, ownerLogin: 'user1', ...overrides });
      const { id } = taskSchema.parse(await response.json());
      assert.ok(id);
      return id;
    }

    const selected = await create();
    const excluded = await create();
    const excludedSubgroup = await create({ priority: 'HIGH' });
    const reselected = await create({ priority: 'HIGH' });
    const otherOwner = await create({ ownerLogin: 'user2' });
    const otherProject = await create({ projectId: 'shared' });
    const otherStatus = await create({ status: 'OPEN' });
    const done = { field: 'status', value: 'DONE' };
    const bulkPath = 'tasks/bulk-delete';
    const selection = {
      where: { project: { id: 'design' }, title: input.title },
      groups: [[done]],
      excludedGroups: [[done, { field: 'priority', value: 'HIGH' }]],
      ids: [reselected],
      excludedIds: [excluded],
      expectedCount: 2,
    };

    await request('POST', bulkPath, 400, user, { ...selection, groups: [[]] });
    await request('POST', bulkPath, 400, user, { ...selection, where: { ownerId: 'u2' } });
    await request('POST', bulkPath, 403, user, { ...selection, groups: [[{ field: 'internalCostCents', value: 0 }]] });
    await request('POST', bulkPath, 403, user, { ...selection, where: { AND: [{ internalNote: 'private' }] } });
    await request('POST', bulkPath, 404, user, { ...selection, ids: [otherOwner] });
    await request('POST', bulkPath, 409, user, { ...selection, expectedCount: 3 });
    await request('GET', `tasks/${selected}`, 200, user);
    await request('GET', `tasks/${reselected}`, 200, user);

    await request('POST', bulkPath, 204, user, selection);
    for (const id of [selected, reselected]) await request('GET', `tasks/${id}`, 404, admin);
    for (const id of [excluded, excludedSubgroup, otherOwner, otherProject, otherStatus]) {
      await request('GET', `tasks/${id}`, 200, admin);
    }
  },
);
