import { Module } from '@nestjs/common';

import { DatabaseService } from './database.service.js';

/** Exposes the database client to the application's read modules. */
@Module({ providers: [DatabaseService], exports: [DatabaseService] })
export class DatabaseModule {}
