import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { DatabaseService } from '../database/database.service.js';

/** Readiness used by the standalone stack's service checks. */
@Controller('health')
export class HealthController {
  /** Receives the database client that initializes before requests are accepted. */
  constructor(private readonly database: DatabaseService) {}

  /** Reports readiness while the initialized database still answers. */
  @Get('ready')
  async ready(): Promise<{ status: 'ready' }> {
    try {
      await this.database.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      throw new ServiceUnavailableException('Database is unavailable.');
    }
  }
}
