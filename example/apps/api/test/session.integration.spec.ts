import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PrismaPg } from '@prisma/adapter-pg';
import { createCaslAccessibleWhere } from '@querry-kit/nest/casl';
import { apiErrorSchema, demoSessionSchema, type DemoSession } from '@workboard/contracts';

import { createWorkboardAbility } from '../src/auth/workboard-ability.js';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client.js';

const api = process.env.WORKBOARD_TEST_API_URL ?? 'http://127.0.0.1:35463';
const origin = process.env.WORKBOARD_TEST_APP_ORIGIN ?? 'http://127.0.0.1:3201';
const sessionUrl = `${api}/api/demo/session`;

/** Posts a demo identity with the browser-origin boundary in place. */
function selectAccount(input: unknown, allowedOrigin = origin, previousCookie?: string) {
  return fetch(sessionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: allowedOrigin,
      ...(previousCookie ? { Cookie: previousCookie } : {}),
    },
    body: JSON.stringify(input),
  });
}

/** Returns the one cookie value the browser would send back. */
function extractCookie(response: Response): string {
  const header = response.headers.get('set-cookie');
  assert.ok(header);
  assert.match(header, /HttpOnly/i);
  assert.match(header, /SameSite=Lax/i);
  assert.match(header, /Path=\/api/i);
  assert.match(header, /Max-Age=1800/i);
  return header.split(';')[0];
}

/** Parses a public successful session and checks that it is not cacheable. */
async function readSession(response: Response): Promise<DemoSession> {
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return demoSessionSchema.parse(await response.json());
}

test(
  'passwordless demo sessions are signed and resolve to three distinct scopes',
  /** Uses the real Fastify HTTP boundary and checks its CASL conditions against seeded rows. */
  async () => {
    const missing = await fetch(sessionUrl);
    assert.equal(missing.status, 401);
    assert.equal(apiErrorSchema.parse(await missing.json()).statusCode, 401);
    assert.equal(missing.headers.get('cache-control'), 'no-store');
    assert.equal((await selectAccount({ login: 'user1' }, 'http://127.0.0.1:1')).status, 403);
    assert.equal((await selectAccount({ login: 'user' })).status, 400);
    assert.equal((await selectAccount({ login: 'user1', role: 'admin' })).status, 400);

    const first = await selectAccount({ login: 'user1' });
    const firstCookie = extractCookie(first);
    const user1 = await readSession(first);
    const second = await selectAccount({ login: 'user2' }, origin, firstCookie);
    const secondCookie = extractCookie(second);
    const user2 = await readSession(second);
    const adminResponse = await selectAccount({ login: 'admin' }, origin, secondCookie);
    const admin = await readSession(adminResponse);

    assert.notEqual(firstCookie, secondCookie);
    assert.notEqual(user1.id, user2.id);
    assert.equal(user1.role, 'user');
    assert.equal(user2.role, 'user');
    assert.equal(admin.role, 'admin');
    assert.equal(user1.fields.includes('internalCostCents'), false);
    assert.equal(user2.fields.includes('internalNote'), false);
    assert.ok(admin.fields.includes('internalCostCents'));
    assert.deepEqual(await readSession(await fetch(sessionUrl, { headers: { Cookie: secondCookie } })), user2);
    assert.equal((await fetch(sessionUrl, { headers: { Cookie: `${firstCookie}broken` } })).status, 401);

    const databaseUrl = process.env.WORKBOARD_TEST_DATABASE_URL;
    assert.ok(databaseUrl);
    assert.equal(new URL(databaseUrl).pathname, '/workboard_test');
    const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
    try {
      const resolveWhere = createCaslAccessibleWhere<ReturnType<typeof createWorkboardAbility>>();
      for (const [session, expected] of [
        [user1, ['u1-1', 'u1-2', 'u1-3', 'u1-4', 'u1-5', 'u1-6']],
        [user2, ['u2-1', 'u2-2', 'u2-3', 'u2-4', 'u2-5', 'u2-6']],
      ] as const) {
        const ability = createWorkboardAbility(session);
        const where = resolveWhere(ability, 'Task') as Prisma.TaskWhereInput;
        assert.deepEqual(
          await database.task.findMany({ where, select: { id: true }, orderBy: { id: 'asc' } }),
          expected.map(/** Converts expected ids to projected test rows. */ (id) => ({ id })),
        );
      }

      const where = resolveWhere(createWorkboardAbility(admin), 'Task') as Prisma.TaskWhereInput;
      assert.equal(await database.task.count({ where }), 18);
    } finally {
      await database.$disconnect();
    }
  },
);
