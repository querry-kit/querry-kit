import 'dotenv/config';

import { defineConfig } from 'prisma/config';

/** Local Compose defaults; callers can set DATABASE_URL for a different isolated instance. */
export const localDatabaseUrl = 'postgresql://workboard:workboard@127.0.0.1:54329/workboard';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? localDatabaseUrl },
});
