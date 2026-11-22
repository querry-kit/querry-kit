import 'dotenv/config';

import type { PrismaConfig } from 'prisma/config';

export default {
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://workboard:workboard@localhost:54329/workboard?schema=public',
  },
} satisfies PrismaConfig;
