import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';
import { compactFixtures } from './fixtures.js';
import { seedWorkboard } from './seed.js';

/** Database URL used by the host development Compose stack. */
export const localDatabaseUrl = 'postgresql://workboard:workboard@127.0.0.1:54329/workboard';

/** Application-owned Prisma client and seed lifecycle. */
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /** Creates an adapter for the configured local or container database. */
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? localDatabaseUrl }) });
  }

  /** Connects and completes initialization before Nest starts listening. */
  async onModuleInit(): Promise<void> {
    await this.$connect();
    await seedWorkboard(this, process.env.WORKBOARD_SEED_PROFILE === 'compact' ? compactFixtures : undefined);
  }

  /** Releases the connection pool when the HTTP application shuts down. */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
