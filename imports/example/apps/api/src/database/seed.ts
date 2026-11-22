import type { PrismaClient } from '../generated/prisma/client.js';
import { demoFixtures, type WorkboardFixtures } from './fixtures.js';

/**
 * Inserts demo fixtures only into an empty application database.
 *
 * The transaction lock serializes simultaneous initializers. Any failure rolls back all inserts.
 */
export async function seedWorkboard(
  prisma: PrismaClient,
  fixtures: WorkboardFixtures = demoFixtures,
): Promise<boolean> {
  return prisma.$transaction(
    /** Checks for existing application rows and writes all fixtures on one connection. */
    async (db) => {
      // Check after obtaining the lock so a second startup cannot see a stale empty database.
      await db.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(12024, 11961)`;
      const existing = await Promise.all([
        db.account.findFirst({ select: { id: true } }),
        db.profile.findFirst({ select: { accountId: true } }),
        db.project.findFirst({ select: { id: true } }),
        db.task.findFirst({ select: { id: true } }),
        db.label.findFirst({ select: { id: true } }),
        db.taskLabel.findFirst({ select: { taskId: true } }),
      ]);
      if (existing.some(Boolean)) return false;

      await db.account.createMany({ data: fixtures.accounts });
      await db.profile.createMany({ data: fixtures.profiles });
      await db.project.createMany({ data: fixtures.projects });
      await db.task.createMany({ data: fixtures.items });
      await db.label.createMany({ data: fixtures.labels });
      await db.taskLabel.createMany({ data: fixtures.itemLabels });
      return true;
    },
    { timeout: 15_000 },
  );
}
