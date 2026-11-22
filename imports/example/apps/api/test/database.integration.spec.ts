import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PrismaPg } from '@prisma/adapter-pg';

import { compactFixtures } from '../src/database/fixtures.js';
import { seedWorkboard } from '../src/database/seed.js';
import { PrismaClient } from '../src/generated/prisma/client.js';

/** Requires explicit opt-in and a distinct test database before any fixture resets. */
function disposableDatabaseUrl(): string {
  const value = process.env.WORKBOARD_TEST_DATABASE_URL;
  assert.ok(value, 'Set WORKBOARD_TEST_DATABASE_URL to a disposable PostgreSQL database.');
  const url = new URL(value);
  assert.equal(url.hostname, '127.0.0.1', 'These tests require a loopback database.');
  assert.equal(url.pathname, '/workboard_test', 'Never reset the development database.');
  return value;
}

/** Clears the synthetic dataset without discarding schema or migration history. */
async function clearFixtureTables(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRaw`TRUNCATE "WorkItemLabel", "Label", "WorkItem", "Project", "Profile", "Account"`;
}

test(
  'initialization is atomic, serialized, and preserves existing data',
  /** Exercises seed lifecycle and schema constraints against disposable PostgreSQL. */
  async () => {
    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: disposableDatabaseUrl() }) });
    try {
      await clearFixtureTables(prisma);

      const invalid = { ...compactFixtures, items: [...compactFixtures.items, compactFixtures.items[0]] };
      await assert.rejects(seedWorkboard(prisma, invalid), { code: 'P2002' });
      assert.equal(await prisma.account.count(), 0);
      assert.equal(await prisma.project.count(), 0);

      const starts = await Promise.all([
        seedWorkboard(prisma, compactFixtures),
        seedWorkboard(prisma, compactFixtures),
      ]);
      assert.deepEqual(starts.sort(), [false, true]);
      const stableIds = await prisma.task.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
      assert.equal(stableIds.length, 18);
      assert.equal(await prisma.profile.count(), 3);
      assert.equal(await prisma.task.count({ where: { ownerId: 'u1' } }), 6);
      assert.equal(await prisma.task.count({ where: { ownerId: 'u2' } }), 6);
      assert.equal(await prisma.task.count({ where: { ownerId: 'admin' } }), 6);
      assert.equal(await prisma.task.count({ where: { projectId: 'shared' } }), 8);
      assert.equal(await prisma.taskLabel.count({ where: { labelId: 'review' } }), 3);
      assert.deepEqual(
        await prisma.task.aggregate({
          where: { status: 'OPEN' },
          _count: { _all: true },
          _sum: { estimatedHours: true },
          _avg: { estimatedHours: true },
          _min: { estimatedHours: true },
          _max: { estimatedHours: true },
        }),
        {
          _count: { _all: 5 },
          _sum: { estimatedHours: 30 },
          _avg: { estimatedHours: 6 },
          _min: { estimatedHours: 2 },
          _max: { estimatedHours: 10 },
        },
      );
      await assert.rejects(prisma.profile.create({ data: { accountId: 'u1', displayName: 'Duplicate' } }), {
        code: 'P2002',
      });
      await assert.rejects(prisma.taskLabel.create({ data: { taskId: 'u1-1', labelId: 'review' } }), {
        code: 'P2002',
      });
      await assert.rejects(prisma.task.update({ where: { id: 'u1-1' }, data: { projectId: 'missing' } }), {
        code: 'P2003',
      });
      await assert.rejects(prisma.task.update({ where: { id: 'u1-1' }, data: { estimatedHours: -1 } }));
      assert.equal(await seedWorkboard(prisma), false);
      assert.deepEqual(await prisma.task.findMany({ select: { id: true }, orderBy: { id: 'asc' } }), stableIds);

      await clearFixtureTables(prisma);
      await prisma.label.create({ data: { id: 'custom', slug: 'custom', displayName: 'Custom data' } });
      assert.equal(await seedWorkboard(prisma), false);
      assert.deepEqual(await prisma.label.findMany({ select: { id: true } }), [{ id: 'custom' }]);
      assert.equal(await prisma.account.count(), 0);
      await clearFixtureTables(prisma);

      assert.equal(await seedWorkboard(prisma), true);
      assert.equal(await prisma.project.count(), 50);
      assert.equal(await prisma.task.count(), 1_000);
      assert.equal(await prisma.project.count({ where: { tasks: { some: {} } } }), 50);
      const owners = await prisma.task.groupBy({ by: ['ownerId'], _count: { _all: true } });
      assert.equal(owners.length, 3);
      assert.ok(owners.every(/** Checks that each account has a useful dataset. */ ({ _count }) => _count._all >= 300));
      assert.equal(await seedWorkboard(prisma), false);
      assert.equal(await prisma.task.count(), 1_000);
      await clearFixtureTables(prisma);
    } finally {
      await prisma.$disconnect();
    }
  },
);
