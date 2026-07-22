import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TaskStatus } from '@/generated/prisma/client';

import { ENV } from '~/config/env';

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: ENV.databaseUrl }) });

async function seed(): Promise<void> {
  await db.task.deleteMany();
  await db.label.deleteMany();
  await db.member.deleteMany();
  await db.project.deleteMany();
  await db.workspace.deleteMany();

  const workspace = await db.workspace.create({ data: { name: 'Product studio' } });
  const [ada, grace] = await Promise.all([
    db.member.create({ data: { workspaceId: workspace.id, name: 'Ada Lovelace', role: 'OWNER' } }),
    db.member.create({ data: { workspaceId: workspace.id, name: 'Grace Hopper', role: 'EDITOR' } }),
  ]);
  const [product, api] = await Promise.all([
    db.label.create({ data: { name: 'Product', color: 'violet' } }),
    db.label.create({ data: { name: 'API', color: 'cyan' } }),
  ]);
  const project = await db.project.create({ data: { workspaceId: workspace.id, name: 'Spring launch' } });
  await db.task.create({
    data: {
      projectId: project.id,
      assigneeId: ada.id,
      title: 'Refine product brief',
      status: TaskStatus.DONE,
      labels: { connect: [{ id: product.id }, { id: api.id }] },
    },
  });
  await db.task.create({
    data: { projectId: project.id, assigneeId: grace.id, title: 'Document API contract', status: TaskStatus.DOING },
  });
}

seed()
  .then(() => db.$disconnect())
  .catch(async (error: unknown) => {
    await db.$disconnect();
    throw error;
  });
